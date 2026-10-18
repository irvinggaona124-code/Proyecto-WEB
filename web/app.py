"""
Servidor Web y API REST de Licitaciones Swarm
Desarrollado con FastAPI y renderizado con Jinja2 + Tailwind CSS.
Monitorea compras públicas de Panamá, Colombia y Costa Rica en tiempo real.
"""

import os
import sys
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
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
    description="Plataforma de Inteligencia de Compras Públicas (Panamá, Colombia y Costa Rica) con Enjambre de 8 Cuentas IA",
    version="1.0.0",
)

# Configuración de Plantillas Jinja2
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
templates = Jinja2Templates(directory=TEMPLATES_DIR)


def format_usd(val: Any) -> str:
    try:
        return f"{float(val or 0):,.2f}"
    except (ValueError, TypeError):
        return "0.00"


def format_num(val: Any) -> str:
    try:
        return f"{float(val or 0):,.0f}"
    except (ValueError, TypeError):
        return "0"


templates.env.filters["usd"] = format_usd
templates.env.filters["num"] = format_num

# Inicialización de Servicios del Enjambre
supervisor = GatekeeperSupervisor()
auditor = CopilotoAuditorPro()
pomelli = PomelliSEOFabric()
opal = MotorOpalEngine()
orquestador = SwarmOrchestrator()

# Almacenamiento en Memoria / Caché de Licitaciones Normalizadas
MEMORIA_LICITACIONES: List[Dict[str, Any]] = []


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
        print(f"[Web Server] Caché inicial cargada con {len(MEMORIA_LICITACIONES)} licitaciones validadas.")
    except Exception as e:
        print(f"[Web Server] Error al precargar caché: {e}")


# Ejecutar precarga al arrancar
recargar_cache_inicial()


class AuditoriaRequest(BaseModel):
    id_licitacion: str
    entidad: str
    objeto: str
    texto_pliego: Optional[str] = "Contenido del pliego..."
    datos_financieros: Optional[Dict[str, float]] = None


# ==============================================================================
# RUTAS DEL FRONTEND WEB
# ==============================================================================

CATEGORIAS_KIOSCO = [
    {
        "id": "obras-civiles",
        "nombre": "Obras Civiles e Infraestructura",
        "nombre_corto": "Obras Civiles y Vialidad",
        "desc": "Infraestructura, escuelas, puentes y asfaltado",
        "icono": "🚧",
        "badge_color": "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
        "id": "salud-insumos",
        "nombre": "Salud y Equipamiento Médico",
        "nombre_corto": "Salud e Insumos Médicos",
        "desc": "Reactivos, equipos hospitalarios y fármacos",
        "icono": "🏥",
        "badge_color": "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
        "id": "ti-telecom",
        "nombre": "Tecnología y Telecomunicaciones",
        "nombre_corto": "TI, Software y Redes",
        "desc": "Licencias, ciberseguridad, nube y hardware",
        "icono": "💻",
        "badge_color": "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
        "id": "mantenimiento",
        "nombre": "Mantenimiento y Facility Management",
        "nombre_corto": "Mantenimiento y Aires",
        "desc": "Climatización HVAC, plantas eléctricas y pintura",
        "icono": "🔧",
        "badge_color": "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
        "id": "seguridad",
        "nombre": "Seguridad y Vigilancia",
        "nombre_corto": "Seguridad y Vigilancia",
        "desc": "CCTV, patrullaje, control de acceso y blindaje",
        "icono": "🛡️",
        "badge_color": "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
        "id": "suministros",
        "nombre": "Papelería, Mobiliario y Suministros de Oficina",
        "nombre_corto": "Suministros y Mobiliario",
        "desc": "Oficina, uniformes, mobiliario e insumos",
        "icono": "📦",
        "badge_color": "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
        "id": "consultoria",
        "nombre": "Servicios Profesionales y Consultoría",
        "nombre_corto": "Consultoría y Legal",
        "desc": "Estudios ambientales, interventoría y finanzas",
        "icono": "⚖️",
        "badge_color": "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
        "id": "transporte",
        "nombre": "Transporte, Flotas y Logística",
        "nombre_corto": "Transporte y Flotas",
        "desc": "Vehículos, ambulancias, repuestos y logística",
        "icono": "🚚",
        "badge_color": "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
        "id": "alimentos",
        "nombre": "Alimentos, Catering y Suministros Agro",
        "nombre_corto": "Alimentos y Raciones",
        "desc": "Comedores escolares, raciones y granos básicos",
        "icono": "🍎",
        "badge_color": "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
        "id": "limpieza",
        "nombre": "Limpieza, Desechos y Gestión Ambiental",
        "nombre_corto": "Limpieza y Aseo",
        "desc": "Aseo hospitalario, fumigación y desechos",
        "icono": "✨",
        "badge_color": "bg-teal-50 text-teal-700 border-teal-200",
    },
]

ORDENES_CHECKOUT: List[Dict[str, Any]] = []

class CheckoutOrderRequest(BaseModel):
    id_licitacion: Optional[str] = None
    codigo_oficial: Optional[str] = "GENERAL"
    tipo_producto: str  # 'TEMPLATE' o 'PRO_PLAN'
    metodo_pago: str    # 'YAPPY', 'NEQUI', 'SINPE', 'CARD'
    monto_usd: float
    whatsapp: str
    email: str

@app.get("/", response_class=HTMLResponse)
async def home_dashboard(
    request: Request,
    q: Optional[str] = None,
    pais: Optional[str] = None,
    categoria: Optional[str] = None,
):
    """Página principal con Buscador Global Command Palette y filtros."""
    filtradas = list(MEMORIA_LICITACIONES)

    # Filtro por País
    if pais and pais.upper() in ["PA", "CO", "CR"]:
        filtradas = [l for l in filtradas if l.get("pais") == pais.upper()]

    # Filtro por Categoría
    if categoria:
        filtradas = [l for l in filtradas if categoria.lower() in l.get("categoria_macro", "").lower()]

    # Búsqueda de Texto Completo
    if q:
        palabras = q.lower().split()
        filtradas = [
            l for l in filtradas
            if any(
                p in l.get("titulo_objeto", "").lower() or
                p in l.get("entidad_compradora", "").lower() or
                p in l.get("categoria_macro", "").lower()
                for p in palabras
            )
        ]

    total_usd = sum(float(l.get("monto_usd_normalizado") or 0) for l in MEMORIA_LICITACIONES)

    # Calcular conteos por categoría y país
    categorias_con_conteo = []
    pais_filtro = pais.upper() if pais and pais.upper() in ["PA", "CO", "CR"] else None
    for cat in CATEGORIAS_KIOSCO:
        nombre_oficial = cat["nombre"]
        conteo_pais = sum(
            1 for l in MEMORIA_LICITACIONES
            if (not pais_filtro or l.get("pais") == pais_filtro)
            and nombre_oficial.lower() in l.get("categoria_macro", "").lower()
        )
        cat_copy = dict(cat)
        cat_copy["conteo"] = conteo_pais
        categorias_con_conteo.append(cat_copy)

    return templates.TemplateResponse(
        request,
        "index.html",
        {
            "licitaciones": filtradas,
            "total_licitaciones": len(MEMORIA_LICITACIONES),
            "total_usd": total_usd,
            "filtro_pais": pais.upper() if pais else None,
            "filtro_categoria": categoria,
            "query": q,
            "macro_categorias": sorted(list(MACRO_CATEGORIAS_VALIDAS)),
            "categorias_kiosco": categorias_con_conteo,
        },
    )


@app.get("/tienda", response_class=HTMLResponse)
async def tienda_plantillas(request: Request):
    """Tienda de Activos Digitales y Suscripciones SaaS."""
    return templates.TemplateResponse(
        request,
        "tienda.html",
        {
            "plantillas": CATALOGO_PLANTILLAS,
            "planes": PLANES_SUSCRIPCION,
        },
    )


# ==============================================================================
# RUTAS DE PROGRAMMATIC SEO (CUENTA 7 - POMELLI)
# ==============================================================================

@app.get("/{pais_slug}/licitaciones/{categoria_slug}", response_class=HTMLResponse)
async def seo_categoria_page(request: Request, pais_slug: str, categoria_slug: str):
    """Página indexable de Programmatic SEO por Rubro."""
    slug_map = {"panama": "PA", "colombia": "CO", "costa-rica": "CR"}
    if pais_slug.lower() not in slug_map:
        raise HTTPException(status_code=404, detail="País no soportado")

    pais_code = slug_map[pais_slug.lower()]
    pais_nombre = {"PA": "Panamá", "CO": "Colombia", "CR": "Costa Rica"}[pais_code]

    # Encontrar nombre oficial de la categoría a partir del slug
    cat_oficial = None
    for cat in MACRO_CATEGORIAS_VALIDAS:
        if pomelli.slugify(cat) == categoria_slug.lower():
            cat_oficial = cat
            break

    if not cat_oficial:
        cat_oficial = categoria_slug.replace("-", " ").title()

    # Filtrar licitaciones
    lics = [
        l for l in MEMORIA_LICITACIONES
        if l.get("pais") == pais_code and cat_oficial.lower() in l.get("categoria_macro", "").lower()
    ]

    metadatos = pomelli.generar_metadatos_seo(pais=pais_code, categoria=cat_oficial)

    return templates.TemplateResponse(
        request,
        "seo_category.html",
        {
            "seo": metadatos,
            "licitaciones": lics,
            "pais_codigo": pais_code,
            "pais_nombre": pais_nombre,
            "categoria_nombre": cat_oficial,
        },
    )


# ==============================================================================
# ENDPOINTS DE API REST
# ==============================================================================

@app.get("/api/licitaciones")
async def api_listar_licitaciones(
    pais: Optional[str] = None,
    categoria: Optional[str] = None,
    q: Optional[str] = None,
    limite: int = 50,
):
    """API JSON de licitaciones públicas normalizadas."""
    res = list(MEMORIA_LICITACIONES)
    if pais:
        res = [l for l in res if l.get("pais") == pais.upper()]
    if categoria:
        res = [l for l in res if categoria.lower() in l.get("categoria_macro", "").lower()]
    if q:
        res = [l for l in res if q.lower() in l.get("titulo_objeto", "").lower()]
    return {"total": len(res), "licitaciones": res[:limite]}


@app.post("/api/auditar")
async def api_auditar_pliego(req: AuditoriaRequest):
    """Cuenta 4 (Copiloto Gems Pro): Audita un pliego y devuelve dictamen."""
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
    """Procesa una solicitud de compra en 2 toques (Yappy, Nequi, SINPE, Tarjeta)."""
    import uuid
    from datetime import datetime, timezone

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
    
    # Generar enlace directo o instrucciones de pago según billetera
    instrucciones = {
        "YAPPY": f"Envía ${req.monto_usd:.2f} al Directorio Yappy @LicitacionesClick o escanea el QR en tu app Banco General.",
        "NEQUI": f"Transfiere ${req.monto_usd:.2f} USD al número Nequi Colombia +57 300 000 0000.",
        "SINPE": f"Envía ${req.monto_usd:.2f} USD al SINPE Móvil Costa Rica +506 8000 0000.",
        "CARD": "https://buy.stripe.com/licitaciones_instant",
    }

    return {
        "status": "success",
        "mensaje": f"Orden {orden['id_orden']} generada con éxito.",
        "orden": orden,
        "instruccion_pago": instrucciones.get(req.metodo_pago, ""),
    }


@app.get("/api/checkout/orders")
async def api_listar_ordenes():
    """Listar órdenes registradas por el modal de checkout."""
    return {"total": len(ORDENES_CHECKOUT), "ordenes": ORDENES_CHECKOUT}


@app.post("/api/sync")
async def api_sincronizar_enjambre():
    """Despacha un ciclo completo concurrente de las 8 cuentas."""
    global MEMORIA_LICITACIONES
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
    print("\n[Licitaciones Swarm Web] Iniciando servidor en http://127.0.0.1:8000 ...")
    uvicorn.run("web.app:app", host="127.0.0.1", port=8000, reload=False)
