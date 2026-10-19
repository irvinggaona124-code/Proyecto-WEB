"""
API REST Headless de Licitaciones Swarm (Backend exclusivo para Next.js)
Monitorea compras públicas de Panamá, Colombia y Costa Rica en tiempo real.
"""

import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Añadir raíz al sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from connectors.panama_compras import extraer_licitaciones_panamacompra
from connectors.colombia_secop import extraer_procesos_secop
from connectors.costa_rica_sicop import extraer_carteles_sicop
from auditor.copilot_gems import CopilotoAuditorPro
from validators.schema_validator import GatekeeperSupervisor, MACRO_CATEGORIAS_VALIDAS
from automation.pomelli_engine import PomelliSEOFabric
from automation.opal_engine import MotorOpalEngine
from templates.catalog import CATALOGO_PLANTILLAS, PLANES_SUSCRIPCION
from orchestration.swarm_dispatcher import SwarmOrchestrator

app = FastAPI(
    title="Licitaciones Swarm API",
    description="Backend JSON de Inteligencia de Compras Públicas (PA, CO, CR) para Next.js",
    version="2.0.0",
)

# Permitir peticiones desde el frontend de Next.js (localhost:3000 y dominio de producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de Servicios del Enjambre
supervisor = GatekeeperSupervisor()
auditor = CopilotoAuditorPro()
pomelli = PomelliSEOFabric()
opal = MotorOpalEngine()
orquestador = SwarmOrchestrator()

# Almacenamiento en Memoria / Caché de Licitaciones Normalizadas
MEMORIA_LICITACIONES: List[Dict[str, Any]] = []
ORDENES_CHECKOUT: List[Dict[str, Any]] = []


def recargar_cache_inicial():
    """Carga inicial de licitaciones validadas por Cuenta 5."""
    global MEMORIA_LICITACIONES
    try:
        pa = extraer_licitaciones_panamacompra(limite=5)
        co = extraer_procesos_secop(horas_atras=72, limite=5)
        cr = extraer_carteles_sicop(limite=5)
        todos = pa + co + cr
        aprobados, _ = supervisor.procesar_lote(todos)
        MEMORIA_LICITACIONES = aprobados
        print(f"[Swarm API] Caché inicial cargada con {len(MEMORIA_LICITACIONES)} licitaciones.")
    except Exception as e:
        print(f"[Swarm API] Error al precargar caché: {e}")


# Ejecutar precarga al arrancar
recargar_cache_inicial()


class AuditoriaRequest(BaseModel):
    id_licitacion: str
    entidad: str
    objeto: str
    texto_pliego: Optional[str] = "Contenido del pliego..."
    datos_financieros: Optional[Dict[str, float]] = None


class CheckoutOrderRequest(BaseModel):
    id_licitacion: Optional[str] = None
    codigo_oficial: Optional[str] = "GENERAL"
    tipo_producto: str  # 'TEMPLATE' o 'PRO_PLAN'
    metodo_pago: str    # 'YAPPY', 'NEQUI', 'SINPE', 'CARD'
    monto_usd: float
    whatsapp: str
    email: str


# ==============================================================================
# ENDPOINTS DE API REST (JSON PURO — SIN JINJA2)
# ==============================================================================

@app.get("/api/licitaciones")
async def api_listar_licitaciones(
    pais: Optional[str] = None,
    categoria: Optional[str] = None,
    q: Optional[str] = None,
    limite: int = 50,
):
    """Devuelve las licitaciones públicas normalizadas para src/app/page.tsx."""
    res = list(MEMORIA_LICITACIONES)
    if pais and pais.upper() in ["PA", "CO", "CR"]:
        res = [l for l in res if l.get("pais") == pais.upper()]
    if categoria:
        res = [l for l in res if categoria.lower() in l.get("categoria_macro", "").lower()]
    if q:
        palabras = q.lower().split()
        res = [
            l for l in res
            if any(
                p in l.get("titulo_objeto", "").lower()
                or p in l.get("entidad_compradora", "").lower()
                or p in l.get("categoria_macro", "").lower()
                for p in palabras
            )
        ]
    total_usd = sum(float(l.get("monto_usd_normalizado") or 0) for l in res)
    return {
        "total": len(res),
        "total_usd": total_usd,
        "licitaciones": res[:limite],
    }


@app.get("/api/catalogo")
async def api_obtener_catalogo():
    """Devuelve el catálogo de plantillas Excel y planes SaaS para src/app/tienda/page.tsx."""
    return {
        "plantillas": CATALOGO_PLANTILLAS,
        "planes": PLANES_SUSCRIPCION,
        "macro_categorias": sorted(list(MACRO_CATEGORIAS_VALIDAS)),
    }


@app.get("/api/seo/{pais_slug}/{categoria_slug}")
async def api_seo_categoria(pais_slug: str, categoria_slug: str):
    """Endpoint JSON de Programmatic SEO (Cuenta 7 - Pomelli)."""
    slug_map = {"panama": "PA", "colombia": "CO", "costa-rica": "CR"}
    if pais_slug.lower() not in slug_map:
        raise HTTPException(status_code=404, detail="País no soportado")
    pais_code = slug_map[pais_slug.lower()]
    cat_oficial = next(
        (cat for cat in MACRO_CATEGORIAS_VALIDAS if pomelli.slugify(cat) == categoria_slug.lower()),
        categoria_slug.replace("-", " ").title(),
    )
    lics = [
        l for l in MEMORIA_LICITACIONES
        if l.get("pais") == pais_code and cat_oficial.lower() in l.get("categoria_macro", "").lower()
    ]
    metadatos = pomelli.generar_metadatos_seo(pais=pais_code, categoria=cat_oficial)
    return {
        "seo": metadatos,
        "pais_codigo": pais_code,
        "categoria_nombre": cat_oficial,
        "licitaciones": lics,
    }


@app.post("/api/auditar")
async def api_auditar_pliego(req: AuditoriaRequest):
    """Cuenta 4 (Copiloto Gems Pro): Audita un pliego y devuelve dictamen JSON."""
    resultado = auditor.auditar_pliego(
        id_licitacion=req.id_licitacion,
        entidad=req.entidad,
        objeto=req.objeto,
        texto_pliego=req.texto_pliego or "Pliego...",
        datos_financieros_ofertante=req.datos_financieros,
    )
    return resultado.model_dump()


@app.post("/api/checkout")
async def api_procesar_checkout(req: CheckoutOrderRequest):
    """Registra una orden de compra de 2 toques (Yappy, Nequi, SINPE, Tarjeta)."""
    orden = {
        "id_orden": f"ORD-{uuid.uuid4().hex[:8].upper()}",
        "id_licitacion": req.id_licitacion,
        "codigo_oficial": req.codigo_oficial,
        "tipo_producto": req.tipo_producto,
        "metodo_pago": req.metodo_pago,
        "monto_usd": req.monto_usd,
        "whatsapp": req.whatsapp,
        "email": req.email,
        "estado": "PENDIENTE_PAGO",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    ORDENES_CHECKOUT.append(orden)
    return {"status": "success", "orden": orden}


@app.get("/api/checkout/orders")
async def api_listar_ordenes():
    """Listar órdenes registradas por el modal de checkout."""
    return {"total": len(ORDENES_CHECKOUT), "ordenes": ORDENES_CHECKOUT}


@app.post("/api/sync")
async def api_sincronizar_enjambre():
    """Despacha un ciclo completo concurrente de las 8 cuentas."""
    metricas = await orquestador.despachar_ciclo_completo()
    recargar_cache_inicial()
    return metricas


@app.get("/health")
async def health_check():
    """Verificación de salud del enjambre."""
    return {
        "status": "healthy",
        "swarm_nodes": 8,
        "licitaciones_en_memoria": len(MEMORIA_LICITACIONES),
        "paises_conectados": ["PA", "CO", "CR"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("web.app:app", host="127.0.0.1", port=8000, reload=False)
