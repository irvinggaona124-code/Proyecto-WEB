"""
Suite de Pruebas Automatizadas End-to-End
Verifica el funcionamiento riguroso del Enjambre de 8 Cuentas en Antigravity.
"""

import asyncio
import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Añadir raíz al sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from connectors.panama_compras import extraer_licitaciones_panamacompra, clasificar_objeto_panama
from connectors.colombia_secop import extraer_procesos_secop, mapear_unspsc_a_macro
from connectors.costa_rica_sicop import extraer_carteles_sicop, calcular_plazo_objecion_cr
from auditor.copilot_gems import CopilotoAuditorPro
from validators.schema_validator import GatekeeperSupervisor, LicitacionNormalizadaModel
from automation.opal_engine import MotorOpalEngine
from automation.pomelli_engine import PomelliSEOFabric
from templates.catalog import CATALOGO_PLANTILLAS, PLANES_SUSCRIPCION
from orchestration.swarm_dispatcher import SwarmOrchestrator


class TestLicitacionesSwarm(unittest.TestCase):

    def setUp(self):
        self.supervisor = GatekeeperSupervisor()
        self.auditor = CopilotoAuditorPro()
        self.opal = MotorOpalEngine()
        self.pomelli = PomelliSEOFabric()

    def test_cuenta_1_panama_extractor(self):
        """Verifica que el Worker de Panamá extraiga pliegos con detección de adendas y homologación."""
        lics = extraer_licitaciones_panamacompra(limite=4)
        self.assertGreaterEqual(len(lics), 1)
        primer = lics[0]
        self.assertEqual(primer["pais"], "PA")
        self.assertTrue(primer["id_global"].startswith("PA-"))
        self.assertIn("Obras", primer["categoria_macro"])
        self.assertGreater(primer["monto_estimado"], 0)

    def test_cuenta_2_colombia_extractor(self):
        """Verifica que el Worker de Colombia consuma la API abierta de SECOP II con Token Shield."""
        lics = extraer_procesos_secop(horas_atras=72, limite=3)
        self.assertGreaterEqual(len(lics), 1)
        primer = lics[0]
        self.assertEqual(primer["pais"], "CO")
        self.assertEqual(primer["moneda"], "COP")
        self.assertIn("Plantilla", primer["plantilla_sugerida"])
        self.assertIn("\n", primer["resumen_ia"])  # Resumen de 2 líneas

    def test_cuenta_3_costa_rica_extractor(self):
        """Verifica que el Worker de Costa Rica calcule plazos de objeción de Ley 9986."""
        lics = extraer_carteles_sicop(limite=3)
        self.assertGreaterEqual(len(lics), 1)
        primer = lics[0]
        self.assertEqual(primer["pais"], "CR")
        self.assertEqual(primer["moneda"], "CRC")
        # Prueba del cálculo de días hábiles de objeción
        objecion = calcular_plazo_objecion_cr("Licitación Mayor", datetime.now(timezone.utc))
        self.assertEqual(objecion["dias_habiles_objecion"], 8)

    def test_cuenta_5_gatekeeper_validaciones(self):
        """Verifica que Cuenta 5 rechace montos <= 0 y fechas inconsistentes, normalizando a USD."""
        ahora = datetime.now(timezone.utc)
        
        # Caso Válido
        valido = {
            "id_global": "CO-TEST-VAL",
            "id_origen": "TEST-VAL",
            "pais": "CO",
            "entidad_compradora": "Ministerio de Salud",
            "titulo_objeto": "Compra de medicamentos e insumos",
            "monto_estimado": 41500000.0,  # 41.5M COP = 10,000 USD
            "moneda": "COP",
            "categoria_macro": "Salud y Equipamiento Médico",
            "fecha_publicacion": ahora.isoformat(),
            "fecha_cierre": (ahora + timedelta(days=15)).isoformat(),
            "url_oficial": "https://secop.gov.co",
        }

        # Caso Inválido: fecha_cierre antes de fecha_publicacion
        invalido_fecha = dict(valido)
        invalido_fecha["id_global"] = "CO-ERR-FECHA"
        invalido_fecha["fecha_cierre"] = (ahora - timedelta(days=1)).isoformat()

        # Caso Inválido: monto 0
        invalido_monto = dict(valido)
        invalido_monto["id_global"] = "CO-ERR-MONTO"
        invalido_monto["monto_estimado"] = 0.0

        aprobados, cuarentena = self.supervisor.procesar_lote([valido, invalido_fecha, invalido_monto])
        self.assertEqual(len(aprobados), 1)
        self.assertEqual(len(cuarentena), 2)
        self.assertEqual(float(aprobados[0]["monto_usd_normalizado"]), 10000.0)

    def test_cuenta_4_copiloto_gems_pro(self):
        """Verifica que el Copiloto Auditor evalúe RUP y detecte cláusulas trampa."""
        resultado = self.auditor.auditar_pliego(
            id_licitacion="PA-TEST-001",
            entidad="MOP",
            objeto="Puente Vehicular",
            texto_pliego="Texto del pliego...",
        )
        self.assertGreaterEqual(len(resultado.clausulas_trampa), 1)
        self.assertTrue(resultado.evaluacion_financiera_rup["apto_para_licitar"])
        self.assertGreaterEqual(len(resultado.matriz_cumplimiento_prellenada), 3)

    def test_cuenta_6_opal_alertas_whatsapp_3_lineas(self):
        """Verifica que las alertas de WhatsApp tengan estrictamente 3 líneas legibles."""
        alerta = self.opal.construir_alerta_whatsapp_adenda(
            id_global="PA-01",
            pais="PA",
            entidad="MOP",
            objeto="Ampliación carretera",
            cambio_detectado="Prórroga",
            url="https://panamacompra.gob.pa",
            plantilla="Plantilla B",
        )
        lineas = alerta.strip().split("\n")
        self.assertEqual(len(lineas), 3, "La alerta de WhatsApp debe contener exactamente 3 líneas.")
        self.assertTrue(lineas[0].startswith("🚨"))
        self.assertTrue(lineas[1].startswith("📄"))
        self.assertTrue(lineas[2].startswith("⚡"))

    def test_cuenta_7_pomelli_linkedin_y_seo(self):
        """Verifica que Pomelli genere carruseles de 5 slides y rutas SEO limpias."""
        lic = {
            "pais": "CR",
            "entidad_compradora": "ICE",
            "titulo_objeto": "Red de fibra óptica nacional",
            "monto_usd_normalizado": 500000.0,
            "categoria_macro": "Tecnología y Telecomunicaciones",
        }
        carrusel = self.pomelli.generar_carrusel_linkedin(lic)
        self.assertEqual(len(carrusel.diapositivas), 5)

        seo = self.pomelli.generar_metadatos_seo("CR", categoria="Tecnología y Telecomunicaciones")
        self.assertEqual(seo.slug_url, "/costa-rica/licitaciones/tecnologia-y-telecomunicaciones")

    def test_catalogo_plantillas_y_precios(self):
        """Verifica la existencia y rango de precios del catálogo de activos digitales."""
        self.assertEqual(len(CATALOGO_PLANTILLAS), 6)
        self.assertEqual(CATALOGO_PLANTILLAS["PLANTILLA_A"].precio_usd, 19.0)
        self.assertEqual(CATALOGO_PLANTILLAS["PLANTILLA_B"].precio_usd, 29.0)
        self.assertEqual(CATALOGO_PLANTILLAS["KIT_MAESTRO"].precio_usd, 69.0)
        self.assertEqual(PLANES_SUSCRIPCION["PLAN_PRO"]["precio_mensual_usd"], 29.0)

    def test_orquestador_ejecucion_concurrente_rapida(self):
        """Verifica que el ciclo completo de las 8 cuentas se ejecute en menos de 5 segundos."""
        orquestador = SwarmOrchestrator()
        metricas = asyncio.run(orquestador.despachar_ciclo_completo())
        self.assertLess(metricas["duracion_segundos"], 5.0)
        self.assertGreaterEqual(metricas["total_aprobadas"], 5)


if __name__ == "__main__":
    unittest.main()
