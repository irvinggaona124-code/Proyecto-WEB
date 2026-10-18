"""
Fábrica Pomelli & Programmatic SEO
Cuenta 7 (Gemini 3.1 Pro High - Motor Pomelli)
Genera:
1. Carruseles de LinkedIn diarios analizando licitaciones reales y entregando Lead Magnets.
2. Metadatos, slugs y sitemaps para miles de URLs indexables en Google (Programmatic SEO).
"""

import os
import sys
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# Asegurar encoding UTF-8 en terminales Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


class LinkedInDiapositiva(BaseModel):
    numero: int
    titulo: str
    cuerpo: str
    llamado_accion: Optional[str] = None


class LinkedInCarrusel(BaseModel):
    tema_principal: str
    pais: str
    licitacion_analizada: str
    presupuesto_usd: float
    diapositivas: List[LinkedInDiapositiva]
    copy_post: str
    lead_magnet_ofrecido: str


class MetadatosSEO(BaseModel):
    slug_url: str
    canonical_url: str
    meta_titulo: str
    meta_descripcion: str
    keywords: List[str]
    h1_principal: str
    caja_conversion_plantilla: str


class PomelliSEOFabric:
    """
    Motor de generación orgánica y programmatic SEO de Cuenta 7.
    """

    @staticmethod
    def slugify(texto: str) -> str:
        t = texto.lower()
        t = re.sub(r"[áäàâ]", "a", t)
        t = re.sub(r"[éëèê]", "e", t)
        t = re.sub(r"[íïìî]", "i", t)
        t = re.sub(r"[óöòô]", "o", t)
        t = re.sub(r"[úüùû]", "u", t)
        t = re.sub(r"[ñ]", "n", t)
        t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
        return t

    def generar_carrusel_linkedin(self, licitacion: Dict[str, Any]) -> LinkedInCarrusel:
        """
        Redacta un carrusel de LinkedIn de 5 diapositivas a partir de una licitación real.
        """
        pais = licitacion.get("pais", "LATAM")
        entidad = licitacion.get("entidad_compradora", "Entidad Pública")
        objeto = licitacion.get("titulo_objeto", "Licitación Pública")
        monto_usd = float(licitacion.get("monto_usd_normalizado") or 0)
        plantilla = licitacion.get("plantilla_sugerida", "Matriz de Cumplimiento Técnico")

        slides = [
            LinkedInDiapositiva(
                numero=1,
                titulo=f"¿Cómo facturar ${monto_usd:,.0f} USD con el Estado sin morir en el intento?",
                cuerpo=f"Analizamos el nuevo pliego oficial publicado por {entidad} en {pais}.\nObjeto: {objeto[:90]}...",
                llamado_accion="Desliza para ver los 3 errores que descalifican al 80 % de contratistas 👉",
            ),
            LinkedInDiapositiva(
                numero=2,
                titulo="Error 1: Fallar en los índices de idoneidad financiera",
                cuerpo="El pliego exige liquidez ≥ 1.5 y endeudamiento ≤ 70 %. Si tus estados financieros no están calculados con la fórmula exacta del RUP/admisibilidad, quedas fuera antes de abrir la oferta económica.",
            ),
            LinkedInDiapositiva(
                numero=3,
                titulo="Error 2: No detectar adendas de última hora",
                cuerpo="En el 40 % de las licitaciones se publican adendas modificando especificaciones técnicas o plazos de fianza 48 horas antes del cierre. Ignorarlas es descalificación inmediata.",
            ),
            LinkedInDiapositiva(
                numero=4,
                titulo="La Solución: Auditoría previa con semáforo técnico",
                cuerpo=f"Antes de entregar, audita cada requisito con la {plantilla}. Separa los criterios en Cumple, No Cumple y Subsanable con responsables asignados.",
            ),
            LinkedInDiapositiva(
                numero=5,
                titulo="¿Quieres la plantilla lista para usar en esta licitación?",
                cuerpo="Comenta 'LICITAR' o envíame un mensaje directo para enviarte gratis el Checklist de Admisibilidad y el enlace directo al pliego oficial.",
                llamado_accion="Guarda este post y comparte con tu equipo de propuestas 📌",
            ),
        ]

        copy = (
            f"🚨 Acaba de publicarse una de las licitaciones más atractivas del mes en {pais}.\n\n"
            f"🏛️ Entidad: {entidad}\n"
            f"💰 Presupuesto estimado: ${monto_usd:,.2f} USD\n"
            f"📋 Objeto: {objeto}\n\n"
            f"Muchos contratistas van a perder semanas preparando la propuesta para ser rechazados "
            f"por un error formal en la fianza o en las fichas técnicas.\n\n"
            f"En este carrusel desglosamos los puntos críticos para ofertar y ganar.\n\n"
            f"👉 Comenta 'LICITAR' y te envío el Checklist de Admisibilidad directamente por WhatsApp/DM."
        )

        return LinkedInCarrusel(
            tema_principal=f"Auditoría de Licitación {pais} - {objeto[:40]}",
            pais=pais,
            licitacion_analizada=objeto,
            presupuesto_usd=monto_usd,
            diapositivas=slides,
            copy_post=copy,
            lead_magnet_ofrecido="Checklist de Admisibilidad y Matriz de Cumplimiento",
        )

    def generar_metadatos_seo(
        self, pais: str, categoria: Optional[str] = None, entidad: Optional[str] = None
    ) -> MetadatosSEO:
        """
        Genera metadatos optimizados para páginas dinámicas de SEO Programático.
        """
        pais_map = {"PA": "panama", "CO": "colombia", "CR": "costa-rica"}
        pais_nombre = {"PA": "Panamá", "CO": "Colombia", "CR": "Costa Rica"}.get(pais, pais)
        pais_slug = pais_map.get(pais, "latam")

        if categoria:
            cat_slug = self.slugify(categoria)
            slug = f"/{pais_slug}/licitaciones/{cat_slug}"
            h1 = f"Licitaciones de {categoria} en {pais_nombre} (Actualizado Hoy)"
            titulo = f"Licitaciones de {categoria} en {pais_nombre} | Monitor Oficial"
            desc = f"Encuentra todas las compras públicas y licitaciones activas de {categoria} en {pais_nombre}. Alertas instantáneas y plantillas de licitación descargables."
            keywords = [f"licitaciones {categoria.lower()} {pais_nombre.lower()}", f"compras publicas {pais_nombre.lower()}", f"pliegos {categoria.lower()}"]
            plantilla_cta = f"¿Vas a licitar en {categoria}? Descarga la Matriz de Cumplimiento por $19 USD o desbloquéala con el Plan Pro ($29/mes)."
        elif entidad:
            ent_slug = self.slugify(entidad)
            slug = f"/{pais_slug}/entidad/{ent_slug}"
            h1 = f"Licitaciones y Contratos de {entidad} en {pais_nombre}"
            titulo = f"Licitaciones de {entidad} ({pais_nombre}) | Convocatorias Abiertas"
            desc = f"Monitorea en tiempo real todas las licitaciones, contrataciones y adendas publicadas por {entidad} en {pais_nombre}."
            keywords = [f"licitaciones {self.slugify(entidad)}", f"contratos {self.slugify(entidad)}", f"compras {pais_nombre.lower()}"]
            plantilla_cta = f"¿Ofertarás a {entidad}? Descarga la Calculadora APU y Checklist Técnico por $29 USD o gratis con el Plan Pro."
        else:
            slug = f"/{pais_slug}/licitaciones"
            h1 = f"Monitor de Licitaciones Públicas en {pais_nombre}"
            titulo = f"Todas las Licitaciones Públicas en {pais_nombre} 2026"
            desc = f"Buscador unificado de compras públicas para {pais_nombre}. Accede a pliegos de PanamáCompra, SECOP II y SICOP."
            keywords = [f"licitaciones {pais_nombre.lower()}", "compras publicas", "pliegos de licitacion"]
            plantilla_cta = "Descarga el Kit Maestro de Licitaciones con las 5 plantillas por $69 USD."

        return MetadatosSEO(
            slug_url=slug,
            canonical_url=f"https://licitaciones.pro{slug}",
            meta_titulo=titulo,
            meta_descripcion=desc,
            keywords=keywords,
            h1_principal=h1,
            caja_conversion_plantilla=plantilla_cta,
        )


if __name__ == "__main__":
    print("[Cuenta 7 - Fábrica Pomelli] Ejecutando pruebas de SEO y LinkedIn...")
    pomelli = PomelliSEOFabric()

    mock_lic = {
        "pais": "PA",
        "entidad_compradora": "MINISTERIO DE OBRAS PUBLICAS (MOP)",
        "titulo_objeto": "Rehabilitación de tramos viales y puentes vehiculares en Panamá Oeste",
        "monto_usd_normalizado": 4500000.0,
        "plantilla_sugerida": "Plantilla B — Calculadora APU y Márgenes",
    }

    # Prueba de carrusel de LinkedIn
    carrusel = pomelli.generar_carrusel_linkedin(mock_lic)
    print(f"\n--- Carrusel de LinkedIn ({carrusel.tema_principal}) ---")
    print(f"Slide 1: {carrusel.diapositivas[0].titulo}")
    print(f"Slide 5: {carrusel.diapositivas[4].titulo}")
    print(f"Lead Magnet: {carrusel.lead_magnet_ofrecido}")
    print("------------------------------------------------------\n")

    # Prueba de Programmatic SEO
    seo_cat = pomelli.generar_metadatos_seo(pais="CO", categoria="Obras Civiles e Infraestructura")
    print(f" -> Ruta SEO: {seo_cat.slug_url}")
    print(f" -> H1: {seo_cat.h1_principal}")
    print(f" -> Meta Título: {seo_cat.meta_titulo}")
    print(f" -> CTA Conversión: {seo_cat.caja_conversion_plantilla}")
