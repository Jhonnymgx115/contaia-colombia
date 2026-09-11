"""Página del Calendario Tributario — próximas obligaciones y tabla completa."""

from datetime import date

import streamlit as st

from src.datos.calendario import OBLIGACIONES, proximas


def pagina_calendario():
    st.title("📅 Calendario Tributario")
    st.markdown(
        "Las obligaciones colombianas llegan por temporadas. Aquí tiene las "
        "**próximas en el tiempo** y la tabla completa del año, con su norma."
    )

    hoy = date.today()
    st.caption(f"Calculado para hoy: {hoy.strftime('%d de %B de %Y')}")

    st.subheader("⏰ Sus próximas fechas")
    for ob in proximas(hoy, cuantas=4):
        with st.container(border=True):
            c1, c2 = st.columns([3, 2])
            c1.markdown(f"### {ob['nombre']}")
            c2.markdown(f"🗓️ **{ob['tipico']}**")

    st.divider()
    st.subheader("🗓️ Temporada completa")
    with st.expander("Mostrar todas las obligaciones del año", expanded=True):
        for ob in OBLIGACIONES:
            st.markdown(f"- **{ob['nombre']}** — {ob['tipico']} · *{ob['norma']}*")

    st.info(
        "ℹ️ Las fechas exactas de cada año las fija la DIAN en su resolución "
        "de plazos (y dependen de los últimos dos dígitos del NIT). Use esta "
        "vista como mapa general y confirme en la resolución vigente.",
        icon="📌",
    )
