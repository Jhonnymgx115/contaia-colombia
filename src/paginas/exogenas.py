"""Página del Validador de Exógenas — revisa el archivo ANTES de la DIAN."""

import pandas as pd
import streamlit as st

from src.herramientas.exogenas import validar_exogenas, digito_verificacion_nit

# Los archivos se leen solo en memoria: nunca se guardan en disco.


def _leer_archivo(archivo):
    nombre = archivo.name.lower()
    if nombre.endswith((".xlsx", ".xls")):
        return pd.read_excel(archivo)
    return pd.read_csv(archivo, sep=None, engine="python", encoding="utf-8-sig")


def pagina_exogenas():
    st.title("📊 Validador de Exógenas")
    st.markdown(
        "Suba su archivo de medios magnéticos (**CSV o Excel**) y la "
        "herramienta revisará la estructura de los formatos **1003** (personas "
        "naturales) o **1004** (personas jurídicas) según la Resolución "
        "000162 de 2016, antes de que lo cargue a la DIAN."
    )

    st.warning(
        "🔒 **Su archivo no sale de este computador.** Se procesa en memoria "
        "y no se guarda en ningún lado.",
        icon="🛡️",
    )

    c1, c2 = st.columns([2, 1])
    with c1:
        archivo = st.file_uploader(
            "Archivo de exógenas (CSV, XLSX)",
            type=["csv", "xlsx", "xls"],
        )
    with c2:
        formato = st.selectbox("Formato DIAN", ["1003", "1004"])

    if archivo is None:
        st.info(
            "👆 Cargue su archivo para comenzar. Si aún no lo tiene, genere "
            "el reporte en su software contable (SIIGO, World Office, Alegra, "
            "Niloé…) y expórtelo en Excel o CSV."
        )
        return

    try:
        df = _leer_archivo(archivo)
    except Exception as exc:  # mensaje amable, sin traceback técnico
        st.error(f"No pudimos leer el archivo ({exc.__class__.__name__}). Verifique que sea un CSV o Excel válido.")
        return

    informe = validar_exogenas(df, formato)

    if informe["estado"] == "LISTO":
        st.success(f"✅ **{informe['estado']}** — El archivo contiene las columnas mínimas del formato {formato}.")
    else:
        st.warning(f"⚠️ **{informe['estado']}** — Faltan columnas respecto al formato {formato}.")

    c1, c2, c3 = st.columns(3)
    c1.metric("Filas de datos", informe["total_filas"])
    c2.metric("Columnas mínimas encontradas", len(informe["columnas_encontradas"]))
    c3.metric("Columnas faltantes", len(informe["columnas_faltantes"]))

    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown("**Columnas del formato encontradas**")
        st.write("• " + "\n• ".join(informe["columnas_encontradas"]) or "—")
    with col_b:
        st.markdown("**Columnas faltantes**")
        if informe["columnas_faltantes"]:
            st.write("❌ " + "\n❌ ".join(informe["columnas_faltantes"]))
        else:
            st.write("Ninguna 🎉")

    if informe["advertencias"]:
        for adv in informe["advertencias"]:
            st.warning(f"⚠️ {adv}")

    with st.expander("🔍 Vista previa (primeras 10 filas) — verifique que los datos se leyeron bien"):
        st.dataframe(df.head(10), use_container_width=True)

    with st.expander("🧮 Verificador de dígito de verificación de NIT"):
        nit = st.text_input("Escriba un NIT sin dígito de verificación (ej: 900123456)")
        if nit:
            try:
                st.success(
                    f"El dígito de verificación de **{nit}** es: **{digito_verificacion_nit(nit)}**"
                )
            except ValueError:
                st.error("Escriba solo números.")
        st.caption("El algoritmo es el oficial de la DIAN (módulo 11 con pesos 3, 7, 13, 17, 19…).")

    st.caption(
        "⚠️ La validación cubre la estructura típica del formato. La DIAN "
        "además verifica condiciones por tipo de reporte y firmas digitales; "
        "revise la resolución de la temporada vigente."
    )
