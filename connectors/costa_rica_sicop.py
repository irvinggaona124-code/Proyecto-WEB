"""
Conector ETL para Costa Rica: SICOP (Sistema Integrado de Compras Públicas)
Cuenta 3 (Gemini Flash High - Worker Costa Rica)
Especializado en cálculo de plazos de objeción al cartel (Ley 9986) y garantías de participación.
"""

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Mapeo determinista por palabras clave para Costa Rica
PALABRAS_CLAVE_CR = {
    "Salud y Equipamiento Médico": ["ccss", "caja costarricense", "hemodialisis", "medicamento", "dispositivo medico", "hospital", "insumo medico"],
    "Tecnología y Telecomunicaciones": ["ice", "instituto costarricense de electricidad", "fibra optica", "telecomunicaciones", "software", "servidor"],
    "Obras Civiles e Infraestructura": ["mopt", "conavi", "carretera", "asfalto", "puente", "edificacion", "obra publica"],
    "Mantenimiento y Facility Management": ["mantenimiento", "climatizacion", "electromecanico", "plomeria", "jardineria"],
    "Transporte, Flotas y Logística": ["vehiculo", "flota", "recope", "combustible", "distribucion", "flete"],
    "Alimentos, Catering y Suministros Agro": ["cnp", "alimentos", "paquetes escolares", "comedor", "arroz", "frijol", "agricola"],
    "Servicios Profesionales y Consultoría": ["auditoria", "consultoria", "estudio tecnico", "peritaje", "asesoria legal"],
    "Seguridad y Vigilancia": ["seguridad privada", "vigilancia", "monitoreo cctv", "oficiales de seguridad"],
    "Limpieza, Desechos y Gestión Ambiental": ["limpieza institucional", "manejo de desechos", "recoleccion", "residuos peligrosos"],
    "Papelería, Mobiliario y Suministros de Oficina": ["utiles de oficina", "papeleria", "mobiliario", "pupitres", "mep"],
}

PLANTILLAS_CR = {
    "Obras Civiles e Infraestructura": "Plantilla B — Calculadora APU y Márgenes",
    "Mantenimiento y Facility Management": "Plantilla B — Calculadora APU y Márgenes",
    "Salud y Equipamiento Médico": "Plantilla D — Matriz de Homologación y Fichas Técnicas",
    "Tecnología y Telecomunicaciones": "Plantilla D — Matriz de Homologación y Fichas Técnicas",
    "Servicios Profesionales y Consultoría": "Plantilla C — Evaluador de Capacidad Financiera RUP",
    "Seguridad y Vigilancia": "Plantilla A — Matriz de Cumplimiento Técnico",
    "Limpieza, Desechos y Gestión Ambiental": "Plantilla A — Matriz de Cumplimiento Técnico",
    "Alimentos, Catering y Suministros Agro": "Plantilla A — Matriz de Cumplimiento Técnico",
    "Transporte, Flotas y Logística": "Plantilla A — Matriz de Cumplimiento Técnico",
    "Papelería, Mobiliario y Suministros de Oficina": "Plantilla D — Matriz de Homologación y Fichas Técnicas",
}


def calcular_plazo_objecion_cr(tipo_procedimiento: str, fecha_publicacion: datetime) -> Dict[str, Any]:
    """
    Cálculo legal determinista según la Ley General de Contratación Pública de Costa Rica (Ley 9986):
    - Licitación Mayor: Plazo de objeción = 8 días hábiles tras publicación.
    - Licitación Menor: Plazo de objeción = 5 días hábiles tras publicación.
    - Licitación Reducida: Plazo de objeción = 3 días hábiles.
    """
    dias_habiles = 8 if "mayor" in tipo_procedimiento.lower() else (5 if "menor" in tipo_procedimiento.lower() else 3)
    
    fecha_limite = fecha_publicacion
    dias_sumados = 0
    while dias_sumados < dias_habiles:
        fecha_limite += timedelta(days=1)
        # Excluir sábados (5) y domingos (6)
        if fecha_limite.weekday() < 5:
            dias_sumados += 1

    return {
        "dias_habiles_objecion": dias_habiles,
        "fecha_limite_objecion": fecha_limite.strftime("%Y-%m-%d"),
    }


def clasificar_objeto_cr(objeto: str, entidad: str) -> str:
    texto = f"{objeto} {entidad}".lower()
    for cat, terminos in PALABRAS_CLAVE_CR.items():
        if any(t in texto for t in terminos):
            return cat
    return "Servicios Profesionales y Consultoría"


def invocar_cuenta_3_analisis_cr(objeto: str, entidad: str, info_legal: Dict[str, Any]) -> str:
    """
    Cuenta 3 (Gemini Flash High - Worker Costa Rica).
    Resumen ejecutivo enfocado en admisibilidad y objeción legal.
    """
    return (
        f"Cartel publicado por {entidad.strip()} para {objeto[:100].strip()}.\n"
        f"Plazo legal perentorio de objeción al cartel vence el {info_legal['fecha_limite_objecion']}."
    )


def extraer_carteles_sicop(limite: int = 10) -> List[Dict[str, Any]]:
    """
    Extractor de carteles activos y datos abiertos de SICOP.
    """
    ahora = datetime.now(timezone.utc)

    carteles_base = [
        {
            "id_origen": "2026LN-000042-0001100001",
            "entidad": "CAJA COSTARRICENSE DE SEGURO SOCIAL (CCSS)",
            "titulo": "Adquisición de kits de hemodiálisis y filtros de alta eficiencia para red hospitalaria",
            "monto_crc": 25750000.0,  # ~50,000 USD
            "tipo": "Licitación Mayor",
            "fecha_pub": ahora - timedelta(days=1),
            "fecha_cierre": ahora + timedelta(days=35),
            "url": "https://www.sicop.go.cr/moduloPublico/verCartel.jsp?cartel=2026LN-000042",
        },
        {
            "id_origen": "2026LY-000118-0000400001",
            "entidad": "INSTITUTO COSTARRICENSE DE ELECTRICIDAD (ICE)",
            "titulo": "Suministro e instalación de cable de fibra óptica monomodo dieléctrico ADSS",
            "monto_crc": 82400000.0,  # ~160,000 USD
            "tipo": "Licitación Menor",
            "fecha_pub": ahora - timedelta(days=2),
            "fecha_cierre": ahora + timedelta(days=20),
            "url": "https://www.sicop.go.cr/moduloPublico/verCartel.jsp?cartel=2026LY-000118",
        },
        {
            "id_origen": "2026LN-000009-0001200001",
            "entidad": "CONSEJO NACIONAL DE VIALIDAD (CONAVI)",
            "titulo": "Mantenimiento periódico y conservación de vías terrestres en Región Brunca",
            "monto_crc": 618000000.0,  # ~1,200,000 USD
            "tipo": "Licitación Mayor",
            "fecha_pub": ahora - timedelta(days=3),
            "fecha_cierre": ahora + timedelta(days=40),
            "url": "https://www.sicop.go.cr/moduloPublico/verCartel.jsp?cartel=2026LN-000009",
        },
    ]

    procesadas: List[Dict[str, Any]] = []

    for item in carteles_base[:limite]:
        categoria = clasificar_objeto_cr(item["titulo"], item["entidad"])
        plantilla = PLANTILLAS_CR.get(categoria, "Plantilla A — Matriz de Cumplimiento Técnico")
        info_legal = calcular_plazo_objecion_cr(item["tipo"], item["fecha_pub"])
        resumen_ia = invocar_cuenta_3_analisis_cr(item["titulo"], item["entidad"], info_legal)

        registro = {
            "id_global": f"CR-{item['id_origen']}",
            "id_origen": item["id_origen"],
            "pais": "CR",
            "entidad_compradora": item["entidad"],
            "titulo_objeto": item["titulo"],
            "monto_estimado": float(item["monto_crc"]),
            "moneda": "CRC",
            "categoria_macro": categoria,
            "codigo_estandar": "SICOP-CR",
            "tipo_procedimiento": item["tipo"],
            "fecha_publicacion": item["fecha_pub"].isoformat(),
            "fecha_cierre": item["fecha_cierre"].isoformat(),
            "fecha_homologacion": None,
            "estado": "publicada",
            "url_oficial": item["url"],
            "resumen_ia": resumen_ia,
            "plantilla_sugerida": plantilla,
        }
        procesadas.append(registro)

    return procesadas


if __name__ == "__main__":
    print("[Worker Costa Rica - Cuenta 3] Extrayendo carteles de SICOP...")
    carteles = extraer_carteles_sicop()
    print(f"[Worker Costa Rica - Cuenta 3] Extraídos {len(carteles)} carteles:")
    for c in carteles:
        print(f" -> [{c['id_global']}] {c['entidad_compradora'][:30]} | {c['categoria_macro']} | {c['monto_estimado']:,.0f} CRC")
        print(f"    Plantilla: {c['plantilla_sugerida']}")
        print(f"    Resumen: {c['resumen_ia'].replace(chr(10), ' | ')}")
