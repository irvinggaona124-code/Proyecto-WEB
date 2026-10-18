"""
Pruebas de Integración de Rutas Web y API FastAPI
Verifica la disponibilidad de todas las vistas, SEO y endpoints REST.
"""

import os
import sys
import unittest
from fastapi.testclient import TestClient

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Añadir raíz al sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from web.app import app


class TestWebRoutes(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_check(self):
        """Verifica el endpoint de salud del sistema."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["swarm_nodes"], 8)

    def test_home_dashboard_render(self):
        """Verifica que la página principal renderice el buscador y métricas."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.headers["content-type"])
        self.assertIn("Licitaciones", response.text)
        self.assertIn("Buscador Global", response.text)

    def test_home_filter_by_country(self):
        """Verifica el filtrado por país en el dashboard."""
        response = self.client.get("/?pais=PA")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Panamá", response.text)

    def test_tienda_page_render(self):
        """Verifica la página de la tienda de activos digitales."""
        response = self.client.get("/tienda")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Plantilla A", response.text)
        self.assertIn("Kit Maestro", response.text)
        self.assertIn("Plan Pro", response.text)

    def test_programmatic_seo_route(self):
        """Verifica la ruta indexable de SEO para Colombia Obras Civiles."""
        response = self.client.get("/colombia/licitaciones/obras-civiles-e-infraestructura")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Obras Civiles", response.text)
        self.assertIn("Colombia", response.text)

    def test_api_auditar_pliego(self):
        """Verifica el endpoint de auditoría con Cuenta 4."""
        payload = {
            "id_licitacion": "TEST-WEB-001",
            "entidad": "Alcaldía de Medellín",
            "objeto": "Construcción de ciclorruta y parques",
        }
        response = self.client.post("/api/auditar", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("clausulas_trampa", data)
        self.assertIn("evaluacion_financiera_rup", data)
        self.assertTrue(data["evaluacion_financiera_rup"]["apto_para_licitar"])

    def test_api_checkout_order(self):
        """Verifica el procesamiento de órdenes en 2 toques con Yappy."""
        payload = {
            "id_licitacion": "PA-2026-TEST",
            "codigo_oficial": "2026-LP-01",
            "tipo_producto": "TEMPLATE",
            "metodo_pago": "YAPPY",
            "monto_usd": 19.0,
            "whatsapp": "+507 6000-0000",
            "email": "contacto@licitador.pa"
        }
        response = self.client.post("/api/checkout", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("ORD-", data["orden"]["id_orden"])
        self.assertIn("Yappy", data["instruccion_pago"])

    def test_api_listar_licitaciones(self):
        """Verifica el endpoint JSON de listado de licitaciones."""
        response = self.client.get("/api/licitaciones?limite=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("licitaciones", data)


if __name__ == "__main__":
    unittest.main()
