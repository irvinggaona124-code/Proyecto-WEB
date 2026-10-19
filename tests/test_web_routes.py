"""
Pruebas de Integración de API REST Headless FastAPI (v2.0.0)
Verifica la disponibilidad de endpoints REST consumidos por Next.js.
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
        self.assertIn("PA", data["paises_conectados"])

    def test_api_listar_licitaciones(self):
        """Verifica el endpoint JSON de listado de licitaciones para Next.js."""
        response = self.client.get("/api/licitaciones?limite=10")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total", data)
        self.assertIn("licitaciones", data)
        self.assertIn("total_usd", data)

    def test_api_filtrar_por_pais(self):
        """Verifica el filtrado por país en /api/licitaciones."""
        response = self.client.get("/api/licitaciones?pais=PA")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        for lic in data["licitaciones"]:
            self.assertEqual(lic.get("pais"), "PA")

    def test_api_catalogo_plantillas_y_planes(self):
        """Verifica el catálogo consumido por src/app/tienda/page.tsx."""
        response = self.client.get("/api/catalogo")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("plantillas", data)
        self.assertIn("planes", data)
        self.assertIn("macro_categorias", data)
        self.assertTrue(len(data["plantillas"]) > 0)
        self.assertTrue(len(data["planes"]) > 0)

    def test_api_programmatic_seo_json(self):
        """Verifica el endpoint JSON de Programmatic SEO para Colombia."""
        response = self.client.get("/api/seo/colombia/obras-civiles-e-infraestructura")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("seo", data)
        self.assertEqual(data["pais_codigo"], "CO")
        self.assertIn("licitaciones", data)

    def test_api_auditar_pliego(self):
        """Verifica el endpoint de auditoría con Cuenta 4 (Copiloto Gems Pro)."""
        payload = {
            "id_licitacion": "TEST-WEB-001",
            "entidad": "Alcaldía de Medellín",
            "objeto": "Construcción de ciclorruta y parques",
            "texto_pliego": "Requisito RUP clasificador 721410 y fianza de cumplimiento al 10%",
        }
        response = self.client.post("/api/auditar", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("clausulas_trampa", data)
        self.assertIn("evaluacion_financiera_rup", data)

    def test_api_checkout_order(self):
        """Verifica el procesamiento y registro de órdenes de checkout."""
        payload = {
            "id_licitacion": "PA-2026-TEST",
            "codigo_oficial": "2026-LP-01",
            "tipo_producto": "TEMPLATE",
            "metodo_pago": "YAPPY",
            "monto_usd": 19.0,
            "whatsapp": "+507 6578-7219",
            "email": "cliente@licisa.com"
        }
        response = self.client.post("/api/checkout", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("ORD-", data["orden"]["id_orden"])
        self.assertEqual(data["orden"]["metodo_pago"], "YAPPY")


if __name__ == "__main__":
    unittest.main()
