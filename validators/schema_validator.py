"""
Validador de Integridad y Supervisor de Base de Datos
Cuenta 5 (Gemini 3.1 Pro High - Supervisor & Gatekeeper DB)
Garantiza coherencia matemática (montos > 0, normalización a USD) y temporal (fecha_cierre > fecha_publicacion)
antes de ejecutar el upsert en Supabase / PostgreSQL.
"""

import os
import sys
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional, Tuple
from pydantic import BaseModel, Field, field_validator, model_validator

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# 10 Macro-Categorías oficiales inmutables
MACRO_CATEGORIAS_VALIDAS = {
    "Salud y Equipamiento Médico",
    "Tecnología y Telecomunicaciones",
    "Obras Civiles e Infraestructura",
    "Mantenimiento y Facility Management",
    "Transporte, Flotas y Logística",
    "Alimentos, Catering y Suministros Agro",
    "Servicios Profesionales y Consultoría",
    "Seguridad y Vigilancia",
    "Limpieza, Desechos y Gestión Ambiental",
    "Papelería, Mobiliario y Suministros de Oficina",
}

# Tasas de cambio de referencia (USD)
# En producción se actualizan diariamente mediante API de TRM o servicio centralizado
TASAS_CAMBIO_USD = {
    "USD": Decimal("1.0"),
    "COP": Decimal("4150.0"),  # 1 USD ≈ 4,150 COP
    "CRC": Decimal("515.0"),   # 1 USD ≈ 515 CRC
}


class LicitacionNormalizadaModel(BaseModel):
    id_global: str = Field(..., min_length=4, max_length=150, description="Identificador único global con prefijo de país")
    id_origen: str = Field(..., min_length=1, max_length=100)
    pais: Literal["PA", "CO", "CR"] = Field(..., description="Código de país ISO 3166-1 alfa-2")
    entidad_compradora: str = Field(..., min_length=2, max_length=255)
    titulo_objeto: str = Field(..., min_length=3)
    monto_estimado: Decimal = Field(..., ge=0, description="Monto en moneda de origen")
    moneda: Literal["USD", "COP", "CRC"]
    monto_usd_normalizado: Optional[Decimal] = None
    categoria_macro: str
    codigo_estandar: Optional[str] = None
    tipo_procedimiento: Optional[str] = None
    fecha_publicacion: Optional[datetime] = None
    fecha_cierre: Optional[datetime] = None
    fecha_homologacion: Optional[datetime] = None
    estado: Literal["publicada", "adenda_activa", "evaluacion", "adjudicada", "desierta"] = "publicada"
    url_oficial: str
    resumen_ia: Optional[str] = None
    plantilla_sugerida: Optional[str] = None

    @field_validator("categoria_macro")
    @classmethod
    def validar_categoria(cls, v: str) -> str:
        if v not in MACRO_CATEGORIAS_VALIDAS:
            raise ValueError(f"Categoría '{v}' no pertenece a las 10 Macro-Categorías oficiales.")
        return v

    @model_validator(mode="after")
    def validar_fechas_y_montos(self) -> "LicitacionNormalizadaModel":
        # 1. Regla Matemática de Cuenta 5: Monto mayor a 0 y conversión a USD
        if self.monto_estimado <= Decimal("0"):
            raise ValueError(f"Monto estimado debe ser mayor a 0. Valor recibido: {self.monto_estimado}")

        tasa = TASAS_CAMBIO_USD.get(self.moneda, Decimal("1.0"))
        # Conversión a USD con redondeo a 2 decimales
        self.monto_usd_normalizado = round(self.monto_estimado / tasa, 2)

        # 2. Regla Temporal de Cuenta 5: fecha_cierre > fecha_publicacion
        if self.fecha_publicacion and self.fecha_cierre:
            if self.fecha_cierre <= self.fecha_publicacion:
                raise ValueError(
                    f"Inconsistencia temporal: fecha_cierre ({self.fecha_cierre}) "
                    f"no puede ser menor o igual a fecha_publicacion ({self.fecha_publicacion})"
                )

        return self


class GatekeeperSupervisor:
    """
    Supervisor de Calidad (Cuenta 5).
    Filtra, valida y realiza el upsert por lotes en Supabase / PostgreSQL.
    """

    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        self.client = None

        if self.supabase_url and self.supabase_key:
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.supabase_key)
            except Exception as e:
                print(f"[Cuenta 5 - Supervisor] Advertencia al conectar con Supabase: {e}")

    def procesar_lote(
        self, registros_crudos: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Valida registros en memoria.
        Retorna (registros_aprobados, registros_en_cuarentena).
        """
        aprobados: List[Dict[str, Any]] = []
        cuarentena: List[Dict[str, Any]] = []

        for item in registros_crudos:
            try:
                # Conversión de fechas en formato ISO si vienen como strings
                for k in ["fecha_publicacion", "fecha_cierre", "fecha_homologacion"]:
                    if isinstance(item.get(k), str) and item[k]:
                        try:
                            item[k] = datetime.fromisoformat(item[k].replace("Z", "+00:00"))
                        except ValueError:
                            pass

                modelo = LicitacionNormalizadaModel(**item)
                
                # Serialización limpia para PostgreSQL/Supabase
                registro_dict = modelo.model_dump(mode="json")
                aprobados.append(registro_dict)

            except Exception as e:
                item_error = dict(item)
                item_error["_error_validacion"] = str(e)
                item_error["_fecha_rechazo"] = datetime.now(timezone.utc).isoformat()
                cuarentena.append(item_error)
                print(f"[Cuenta 5 - Gatekeeper] Registro RECHAZADO ({item.get('id_global')}): {e}")

        return aprobados, cuarentena

    def guardar_en_supabase(self, registros: List[Dict[str, Any]]) -> int:
        """
        Upsert atómico en la tabla maestra licitaciones_normalizadas.
        """
        if not registros:
            return 0

        if not self.client:
            print("[Cuenta 5 - Gatekeeper] Modo Simulación (Sin credenciales de Supabase).")
            print(f" -> {len(registros)} registros validados listos para inserción.")
            return len(registros)

        try:
            # Upsert por lote utilizando id_global como clave primaria
            resultado = (
                self.client.table("licitaciones_normalizadas")
                .upsert(registros, on_conflict="id_global")
                .execute()
            )
            insertados = len(resultado.data) if resultado.data else len(registros)
            print(f"[Cuenta 5 - Supervisor] Upsert exitoso de {insertados} licitaciones en Supabase.")
            return insertados
        except Exception as e:
            print(f"[Cuenta 5 - Supervisor] Error al insertar en Supabase: {e}")
            raise


if __name__ == "__main__":
    print("[Cuenta 5 - Supervisor] Ejecutando pruebas de validación...")
    supervisor = GatekeeperSupervisor()

    # Caso de prueba 1: Válido
    caso_valido = {
        "id_global": "CO-CO1.REQ.9876543",
        "id_origen": "CO1.REQ.9876543",
        "pais": "CO",
        "entidad_compradora": "Ministerio de Transporte",
        "titulo_objeto": "Mantenimiento y rehabilitación de carpeta asfáltica vía Girardot",
        "monto_estimado": 415000000.0,  # 415M COP = 100,000 USD
        "moneda": "COP",
        "categoria_macro": "Obras Civiles e Infraestructura",
        "fecha_publicacion": "2026-10-15T08:00:00Z",
        "fecha_cierre": "2026-11-15T18:00:00Z",
        "url_oficial": "https://colombiacompra.gov.co/secop-ii",
        "plantilla_sugerida": "Plantilla B — Calculadora APU y Márgenes",
    }

    # Caso de prueba 2: Inválido por fecha (cierre antes de publicación)
    caso_invalido_fecha = dict(caso_valido)
    caso_invalido_fecha["id_global"] = "CO-ERROR-FECHA"
    caso_invalido_fecha["fecha_cierre"] = "2026-10-10T08:00:00Z"

    aprobados, cuarentena = supervisor.procesar_lote([caso_valido, caso_invalido_fecha])
    print(f" -> Aprobados: {len(aprobados)} (Monto USD Normalizado: {aprobados[0]['monto_usd_normalizado']})")
    print(f" -> En cuarentena: {len(cuarentena)} (Razón: {cuarentena[0]['_error_validacion']})")
