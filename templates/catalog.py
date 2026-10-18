"""
Catálogo Oficial de Activos Digitales y Plantillas de Licitación
Venta Cruzada Directa (Sin fricción comercial ni demos)
Precios: $19 - $39 USD (Plantillas individuales), $69 - $79 USD (Kit Maestro), $29/mes (Plan Pro)
"""

import sys
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


class PlantillaDigital(BaseModel):
    id_plantilla: str
    nombre: str
    formato: str
    precio_usd: float
    precio_rango: str
    descripcion_corta: str
    beneficios_clave: List[str]
    enlace_pago_stripe: str
    enlace_pago_local: str  # Yappy (PA), Nequi (CO), SINPE (CR)


CATALOGO_PLANTILLAS: Dict[str, PlantillaDigital] = {
    "PLANTILLA_A": PlantillaDigital(
        id_plantilla="PLANTILLA_A",
        nombre="Plantilla A — Matriz de Cumplimiento Técnico y Checklist de Admisibilidad",
        formato="Excel (.xlsx) + Notion Template",
        precio_usd=19.0,
        precio_rango="$19 - $25 USD",
        descripcion_corta="Semáforo de cumplimiento (Cumple / No cumple / Subsanable) y control perentorio de fechas de objeción y homologación.",
        beneficios_clave=[
            "Evita el 80 % de descalificaciones por errores de forma o documentos faltantes.",
            "Semáforo condicional automático con asignación de responsables.",
            "Checklist de admisibilidad legal, técnica y financiera integrado.",
        ],
        enlace_pago_stripe="https://buy.stripe.com/plantilla_a_cumplimiento",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=PLANTILLA_A",
    ),
    "PLANTILLA_B": PlantillaDigital(
        id_plantilla="PLANTILLA_B",
        nombre="Plantilla B — Calculadora de Análisis de Precios Unitarios (APU) y Márgenes",
        formato="Excel (.xlsx) con fórmulas dinámicas",
        precio_usd=29.0,
        precio_rango="$29 - $39 USD",
        descripcion_corta="Desglose de materiales, mano de obra y equipos con cálculo de A.I.U. y simulador de flujo de caja ante pagos estatales a 60-120 días.",
        beneficios_clave=[
            "Cálculo exacto de A.I.U. (Administración, Imprevistos y Utilidades).",
            "Simulador de costo financiero ante retrasos de pago institucional.",
            "Protege el margen neto para que licitar con el Estado sea verdaderamente rentable.",
        ],
        enlace_pago_stripe="https://buy.stripe.com/plantilla_b_apu",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=PLANTILLA_B",
    ),
    "PLANTILLA_C": PlantillaDigital(
        id_plantilla="PLANTILLA_C",
        nombre="Plantilla C — Evaluador de Capacidad Financiera e Índices de Idoneidad",
        formato="Excel (.xlsx) formulado",
        precio_usd=25.0,
        precio_rango="$25 - $35 USD",
        descripcion_corta="Calcula en segundos Liquidez, Endeudamiento y Cobertura de Intereses según el RUP (Colombia) y pliegos de Panamá y Costa Rica.",
        beneficios_clave=[
            "Verificación anticipada de aptitud financiera antes de invertir tiempo en la propuesta.",
            "Fórmulas oficiales RUP / DGCP / SICOP precargadas.",
            "Alertas automáticas si el balance no alcanza el índice requerido.",
        ],
        enlace_pago_stripe="https://buy.stripe.com/plantilla_c_rup",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=PLANTILLA_C",
    ),
    "PLANTILLA_D": PlantillaDigital(
        id_plantilla="PLANTILLA_D",
        nombre="Plantilla D — Matriz de Homologación y Fichas Técnicas",
        formato="Excel (.xlsx) + Exportador PDF",
        precio_usd=19.0,
        precio_rango="$19 USD",
        descripcion_corta="Tabla comparativa cruzada (especificación del pliego vs. ficha de fabricante) lista para exportar a PDF y anexar a la oferta.",
        beneficios_clave=[
            "Ideal para insumos médicos, farmacéuticos, TI, hardware y suministros.",
            "Demuestra equivalencia técnica y neutralidad de marca.",
            "Genera el anexo técnico en PDF profesional con un clic.",
        ],
        enlace_pago_stripe="https://buy.stripe.com/plantilla_d_homologacion",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=PLANTILLA_D",
    ),
    "PLANTILLA_E": PlantillaDigital(
        id_plantilla="PLANTILLA_E",
        nombre="Plantilla E — Tablero CRM de Seguimiento de Licitaciones y Cobro Estatal",
        formato="Notion / Google Sheets",
        precio_usd=29.0,
        precio_rango="$29 USD",
        descripcion_corta="Pipeline Kanban desde 'En estudio' hasta 'Cuenta presentada' y 'Pagada', con control de vencimiento de pólizas y fianzas.",
        beneficios_clave=[
            "Control visual de todas las propuestas en marcha por país.",
            "Alertas de vencimiento de fianzas de propuesta y cumplimiento.",
            "Módulo de seguimiento a cuentas por cobrar al Estado.",
        ],
        enlace_pago_stripe="https://buy.stripe.com/plantilla_e_crm",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=PLANTILLA_E",
    ),
    "KIT_MAESTRO": PlantillaDigital(
        id_plantilla="KIT_MAESTRO",
        nombre="Kit Maestro de Licitaciones Públicas (Las 5 Plantillas)",
        formato="Bundle Completo (Excel, Notion, Sheets)",
        precio_usd=69.0,
        precio_rango="$69 - $79 USD",
        descripcion_corta="El arsenal completo para contratistas: Matriz de Cumplimiento + Calculadora APU + Evaluador RUP + Homologación + CRM.",
        beneficios_clave=[
            "Ahorro de más del 40 % frente a la compra individual.",
            "Acceso vitalicio a actualizaciones de plantillas.",
            "Guía paso a paso de uso para cada país (PA, CO, CR).",
        ],
        enlace_pago_stripe="https://buy.stripe.com/kit_maestro_licitaciones",
        enlace_pago_local="https://licitaciones.pro/pago-local?item=KIT_MAESTRO",
    ),
}

PLANES_SUSCRIPCION = {
    "PLAN_PRO": {
        "nombre": "Suscripción SaaS Plan Pro",
        "precio_mensual_usd": 29.0,
        "precio_anual_usd": 290.0,
        "beneficios": [
            "Alertas ilimitadas en tiempo real por WhatsApp y correo.",
            "Descarga ilimitada y gratuita de TODAS las plantillas del catálogo.",
            "Acceso al Copiloto Auditor de Pliegos (Cuenta 4 - lectura de PDFs de +100 páginas).",
            "Detección y avisos inmediatos de adendas y suspensiones.",
        ],
        "enlace_checkout": "https://buy.stripe.com/plan_pro_mensual",
    },
    "PLAN_EQUIPOS": {
        "nombre": "Suscripción SaaS Plan Equipos",
        "precio_mensual_usd": 69.0,
        "beneficios": [
            "Hasta 3 usuarios corporativos simultáneos.",
            "Inteligencia histórica de adjudicaciones (precios ganadores de la competencia).",
            "Reportes mensuales de mercado y auditoría asistida.",
        ],
        "enlace_checkout": "https://buy.stripe.com/plan_equipos_mensual",
    },
}


def obtener_plantilla_recomendada(categoria_macro: str) -> PlantillaDigital:
    """Retorna la plantilla adecuada con su enlace directo de cobro."""
    if any(k in categoria_macro.lower() for k in ["obras", "infraestructura", "mantenimiento"]):
        return CATALOGO_PLANTILLAS["PLANTILLA_B"]
    elif any(k in categoria_macro.lower() for k in ["salud", "tecnología", "suministros"]):
        return CATALOGO_PLANTILLAS["PLANTILLA_D"]
    elif any(k in categoria_macro.lower() for k in ["consultoría", "servicios profesionales"]):
        return CATALOGO_PLANTILLAS["PLANTILLA_C"]
    else:
        return CATALOGO_PLANTILLAS["PLANTILLA_A"]


if __name__ == "__main__":
    print("[Catálogo de Activos Digitales] Verificando productos y precios...")
    print(f"Total plantillas activas: {len(CATALOGO_PLANTILLAS)}")
    for k, p in CATALOGO_PLANTILLAS.items():
        print(f" -> [{p.id_plantilla}] {p.nombre[:55]} | Precio: ${p.precio_usd:,.0f} USD")
    print(f"\nSuscripción Plan Pro: ${PLANES_SUSCRIPCION['PLAN_PRO']['precio_mensual_usd']:,.0f} USD/mes")
    print(f"Suscripción Plan Equipos: ${PLANES_SUSCRIPCION['PLAN_EQUIPOS']['precio_mensual_usd']:,.0f} USD/mes")
