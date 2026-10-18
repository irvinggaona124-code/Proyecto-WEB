"""
Motor Opal: Automatizaciones en Segundo Plano y Alertas
Cuenta 6 (Gemini Flash / 3.1 Pro High - Motor Opal)
Ejecuta:
1. Dossier Matutino a las 7:00 a.m. vía Resend (HTML/Markdown).
2. Diferencial de Adendas para alertas instantáneas de WhatsApp en 3 líneas.
3. Resumen analítico mensual de compras públicas.
"""

import os
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


class MotorOpalEngine:
    """
    Gestor de automatizaciones de la Cuenta 6.
    """

    def __init__(self, resend_api_key: Optional[str] = None):
        self.resend_api_key = resend_api_key or os.getenv("RESEND_API_KEY")

    def construir_alerta_whatsapp_adenda(
        self, id_global: str, pais: str, entidad: str, objeto: str, cambio_detectado: str, url: str, plantilla: str
    ) -> str:
        """
        Formato de alerta instantánea para WhatsApp estrictamente en 3 líneas.
        """
        linea_1 = f"🚨 [{pais}] {entidad[:35]}: {objeto[:45]}... | ⚠️ ADENDA: {cambio_detectado[:30]}"
        linea_2 = f"📄 Pliego y adenda oficial: {url}"
        linea_3 = f"⚡ Prepara tu oferta: Descarga la {plantilla} en https://licitaciones.pro/plantillas"
        return f"{linea_1}\n{linea_2}\n{linea_3}"

    def generar_dossier_matutino_7am(
        self, usuario_nombre: str, rubros_interes: List[str], licitaciones_del_dia: List[Dict[str, Any]]
    ) -> Dict[str, str]:
        """
        Compila el Dossier Matutino personalizado que se envía a las 7:00 a.m. vía Resend.
        """
        filtradas = [
            lic for lic in licitaciones_del_dia
            if any(r.lower() in lic.get("categoria_macro", "").lower() for r in rubros_interes)
        ]

        fecha_hoy = datetime.now(timezone.utc).strftime("%d de %B de %Y")
        total_presupuesto = sum(float(l.get("monto_usd_normalizado") or 0) for l in filtradas)

        # Contenido Markdown / Texto
        md_content = f"# Dossier Matutino de Licitaciones — {fecha_hoy}\n"
        md_content += f"Hola {usuario_nombre}, hemos seleccionado {len(filtradas)} nuevas oportunidades públicas para tus rubros ({', '.join(rubros_interes)}).\n"
        md_content += f"**Presupuesto total en juego hoy:** ${total_presupuesto:,.2f} USD\n\n"

        # Contenido HTML para envío por Resend
        html_cards = ""
        for lic in filtradas:
            monto_usd = float(lic.get("monto_usd_normalizado") or 0)
            cierre = str(lic.get("fecha_cierre") or "Pronto")[:10]
            plantilla = lic.get("plantilla_sugerida", "Plantilla de Licitación")
            url = lic.get("url_oficial", "https://licitaciones.pro")

            md_content += f"### [{lic.get('pais')}] {lic.get('titulo_objeto')}\n"
            md_content += f"- **Entidad:** {lic.get('entidad_compradora')}\n"
            md_content += f"- **Presupuesto:** ${monto_usd:,.2f} USD | **Cierre:** {cierre}\n"
            md_content += f"- **Herramienta recomendada:** {plantilla}\n"
            md_content += f"- [Ver Pliego Oficial]({url}) | [Descargar Plantilla](https://licitaciones.pro/plantillas)\n\n"

            html_cards += f"""
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #ffffff;">
              <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">{lic.get('pais')} • {lic.get('categoria_macro')}</span>
              <h3 style="margin-top: 10px; margin-bottom: 6px; font-size: 16px; color: #0f172a;">{lic.get('titulo_objeto')}</h3>
              <p style="color: #64748b; font-size: 14px; margin: 4px 0;"><strong>Entidad:</strong> {lic.get('entidad_compradora')}</p>
              <p style="font-size: 15px; font-weight: bold; color: #16a34a; margin: 4px 0;">Presupuesto: ${monto_usd:,.2f} USD <span style="color: #64748b; font-weight: normal;">| Cierre: {cierre}</span></p>
              <div style="margin-top: 12px;">
                <a href="{url}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-right: 8px;">Ver Pliego Oficial</a>
                <a href="https://licitaciones.pro/plantillas" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 8px 12px; border-radius: 6px; font-size: 13px;">Descargar {plantilla}</a>
              </div>
            </div>
            """

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
          <div style="max-width: 640px; margin: 0 auto;">
            <div style="padding-bottom: 16px; border-bottom: 2px solid #0f172a; margin-bottom: 20px;">
              <h1 style="font-size: 22px; color: #0f172a; margin: 0;">Licitaciones Swarm — Dossier Matutino</h1>
              <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Reporte oficial de las 7:00 a.m. | {fecha_hoy}</p>
            </div>
            <p style="font-size: 15px; color: #334155;">Hola <strong>{usuario_nombre}</strong>, se han detectado <strong>{len(filtradas)} licitaciones clave</strong> en tus sectores con un valor acumulado de <strong>${total_presupuesto:,.2f} USD</strong>.</p>
            {html_cards}
            <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">
              Enviado automáticamente por el Motor Opal (Cuenta 6) • Licitaciones Antigravity Swarm
            </div>
          </div>
        </body>
        </html>
        """

        return {
            "asunto": f"Dossier 7:00 a.m.: {len(filtradas)} Licitaciones por ${total_presupuesto:,.0f} USD ({', '.join(rubros_interes)})",
            "markdown": md_content,
            "html": html_body,
            "total_licitaciones": len(filtradas),
            "total_usd": total_presupuesto,
        }


if __name__ == "__main__":
    print("[Cuenta 6 - Motor Opal] Ejecutando pruebas de automatización...")
    motor = MotorOpalEngine()

    # Prueba de alerta WhatsApp ante adenda
    alerta_wa = motor.construir_alerta_whatsapp_adenda(
        id_global="PA-2026-0-12-001-08-LV-024501",
        pais="PA",
        entidad="MINISTERIO DE OBRAS PUBLICAS (MOP)",
        objeto="Rehabilitación de tramos viales y puentes vehiculares en Panamá Oeste",
        cambio_detectado="Prórroga de fecha de cierre al 15 de Noviembre",
        url="https://panamacompra.gob.pa/ficha?id=024501",
        plantilla="Plantilla B — Calculadora APU y Márgenes",
    )
    print("\n--- Alerta WhatsApp Generada (3 Líneas) ---")
    print(alerta_wa)
    print("-------------------------------------------\n")

    # Prueba de Dossier Matutino
    mock_lics = [
        {
            "pais": "PA",
            "categoria_macro": "Obras Civiles e Infraestructura",
            "titulo_objeto": "Construcción de puente vehicular sobre Río Caimito",
            "entidad_compradora": "Ministerio de Obras Públicas",
            "monto_usd_normalizado": 2300000.0,
            "fecha_cierre": "2026-11-20",
            "url_oficial": "https://panamacompra.gob.pa",
            "plantilla_sugerida": "Plantilla B — Calculadora APU y Márgenes",
        },
        {
            "pais": "CO",
            "categoria_macro": "Tecnología y Telecomunicaciones",
            "titulo_objeto": "Modernización de centro de cómputo y ciberseguridad",
            "entidad_compradora": "Ministerio de Tecnologías TIC",
            "monto_usd_normalizado": 450000.0,
            "fecha_cierre": "2026-11-10",
            "url_oficial": "https://secop.gov.co",
            "plantilla_sugerida": "Plantilla D — Matriz de Homologación y Fichas Técnicas",
        },
    ]

    dossier = motor.generar_dossier_matutino_7am(
        usuario_nombre="Carlos Méndez",
        rubros_interes=["Obras Civiles", "Tecnología"],
        licitaciones_del_dia=mock_lics,
    )
    print(f" -> Asunto del Dossier: {dossier['asunto']}")
    print(f" -> Oportunidades incluidas: {dossier['total_licitaciones']} (Total: ${dossier['total_usd']:,.2f} USD)")
