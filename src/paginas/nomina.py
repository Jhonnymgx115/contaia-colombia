"""Página de Nómina y Prestaciones — prima, cesantías e intereses."""

from datetime import date

import streamlit as st

from src.herramientas.nomina import liquidacion_completa


def _cop(valor: float) -> str:
    return f"${valor:,.0f}".replace(",", ".")


def render():
    st.title("💰 Nómina y Prestaciones")
    st.markdown(
        "Calcule **prima de servicios, cesantías e intereses a las cesantías** "
        "con un asistente paso a paso, según el Código Sustantivo del Trabajo "
        "(arts. 185-197 y 210) y la Ley 50 de 1990."
    )

    with st.expander("📖 ¿Qué es qué? (en 30 segundos)"):
        st.markdown(
            """
            - **Prima de servicios:** 15 días de salario por cada semestre
              trabajado. Se paga el **30 de junio** y el **20 de diciembre**.
            - **Cesantías:** un mes de salario por cada año trabajado. Se
              consigna al fondo el **14 de febrero** del año siguiente.
            - **Intereses a las cesantías:** el **12% anual** sobre las
              cesantías. Se pagan el **31 de enero**.
            """
        )

    col_izq, col_der = st.columns([1, 1])

    with col_izq:
        salario = st.number_input(
            "Salario mensual base (COP)",
            min_value=0.0,
            step=50_000.0,
            format="%f",
            help="Sin auxilios ni remuneración en especie.",
        )
        transporte = st.number_input(
            "Auxilio de transporte mensual (COP)",
            min_value=0.0,
            step=10_000.0,
            format="%f",
            help="Solo aplica para salarios hasta 2 SMMLV. Entró a la prima, no a las cesantías.",
        )
        c1, c2 = st.columns(2)
        with c1:
            fecha_ingreso = st.date_input("Fecha de inicio del periodo", value=date(2025, 1, 1))
        with c2:
            fecha_fin = st.date_input("Fecha de corte", value=date(2025, 6, 30))

        calcular = st.button("🧮 Calcular prestaciones", type="primary", use_container_width=True)

    with col_der:
        if calcular:
            if fecha_fin <= fecha_ingreso:
                st.error("La fecha de corte debe ser posterior a la de inicio.")
                return
            try:
                resultado = liquidacion_completa(
                    salario_mensual=salario,
                    fecha_ingreso=fecha_ingreso,
                    fecha_fin=fecha_fin,
                    auxilio_transporte=transporte,
                )
            except ValueError as exc:
                st.error(str(exc))
                return

            st.metric("Días trabajados en el periodo", resultado["dias_trabajados"])
            st.metric("💵 Prima de servicios", _cop(resultado["prima"]["prima"]))
            st.metric("🏦 Cesantías", _cop(resultado["cesantias"]["cesantias"]))
            st.metric("📈 Intereses a las cesantías", _cop(resultado["intereses"]["intereses"]))
            st.metric("🧾 Total prestaciones del periodo", _cop(resultado["total_prestaciones"]))

            with st.expander("🔬 Vea las fórmulas aplicadas (para auditar o explicar)"):
                st.markdown(
                    f"""
                    | Concepto | Fórmula | Resultado |
                    |---|---|---:|
                    | Prima | {resultado['prima']['formula']} | {_cop(resultado['prima']['prima'])} |
                    | Cesantías | {resultado['cesantias']['formula']} | {_cop(resultado['cesantias']['cesantias'])} |
                    | Intereses | {resultado['intereses']['formula']} | {_cop(resultado['intereses']['intereses'])} |
                    """
                )
                st.caption(
                    "Nota: el auxilio de transporte sí hace parte de la prima "
                    "(art. 194 CST), pero NO de las cesantías."
                )
        else:
            st.markdown(
                "👈 **Ingrese el salario y el periodo a la izquierda.** Verá cada "
                "prestación con su fórmula, ideal para conciliar con su nómina."
            )

    st.divider()
    st.markdown("### 📅 Fechas clave de prestaciones (no se le pase)")
    st.markdown(
        """
        | Obligación | Fecha límite | Norma |
        |---|---|---|
        | Prima 1er semestre | 30 de junio | Art. 186 CST |
        | Prima 2do semestre | 20 de diciembre | Art. 186 CST |
        | Intereses a las cesantías | 31 de enero | Art. 210 CST |
        | Consignación de cesantías al fondo | 14 de febrero | Ley 52 de 1975 |
        """
    )
