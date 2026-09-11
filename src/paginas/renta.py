"""Página del Liquidador de Renta — paso a paso, didáctico."""

import streamlit as st

from src.datos.uvt import anios_disponibles, UVT_POR_ANIO
from src.datos.tarifas import TRAMOS_ART_241
from src.herramientas.renta import liquidar


def _cop(valor: float) -> str:
    return f"${valor:,.0f}".replace(",", ".")


def pagina_renta():
    st.title("🧾 Liquidador de Renta")
    st.markdown(
        "Llene los campos con las cifras del año gravable (están en su PUC, "
        "cartola o informe de ingresos). La herramienta hace las restas y "
        "aplica la tarifa del **art. 241 del Estatuto Tributario**."
    )

    with st.expander("📖 ¿Cómo funciona una liquidación de renta? (léalo una vez y entenderá todo)"):
        st.markdown(
            """
            | Paso | Concepto | ¿De dónde saco la cifra? |
            |---|---|---|
            | 1 | **Ingresos totales** | Todo lo que recibió en el año (ventas, honorarios, salarios). |
            | 2 | **(-) No constitutivos de renta** | P. ej., aportes obligatorios a salud y pensión de empleados dependientes (art. 45 ET). |
            | 3 | **(-) Costos y deducciones** | Costos de venta, gastos aceptados fiscalmente (art. 105 y 107 ET). |
            | 4 | **(-) Rentas exentas** | P. ej., la exención laboral de 790 UVT (art. 336 ET), con topes. |
            | 5 | **= Renta líquida gravable** | La base sobre la que se calcula el impuesto. |
            | 6 | **× Tarifa marginal** | Tabla progresiva del art. 241 ET (0% a 37%). |
            """
        )

    col_izq, col_der = st.columns([1, 1])

    with col_izq:
        anio = st.selectbox(
            "Año gravable",
            options=anios_disponibles(),
            help="El valor de la UVT depende del año. Los valores salen del decreto anual de la DIAN.",
        )
        if anio not in UVT_POR_ANIO:
            st.warning(
                f"La UVT de {anio} aún no está publicada; se usará la última "
                f"conocida. Verifique el valor oficial antes de declarar."
            )

        tipo = st.radio("¿Quién declara?", ["Persona natural", "Persona jurídica (empresa)"])

        ingresos = st.number_input(
            "Ingresos totales del año (COP)",
            min_value=0.0,
            step=1_000_000.0,
            format="%f",
            help="Suma de todos los ingresos del año gravable.",
        )
        no_constitutivos = st.number_input(
            "Ingresos NO constitutivos de renta (COP)",
            min_value=0.0,
            step=100_000.0,
            format="%f",
            help="Art. 45 ET. Para empleados: aportes obligatorios a salud y pensión.",
        )
        costos = st.number_input(
            "Costos y deducciones (COP)",
            min_value=0.0,
            step=1_000_000.0,
            format="%f",
        )
        exentas = st.number_input(
            "Otras rentas exentas o exoneradas (COP)",
            min_value=0.0,
            step=100_000.0,
            format="%f",
            help="Art. 206 ET. Las exoneraciones de pequeños contribuyentes (art. 4.3) se manejan aparte.",
        )
        ingresos_laborales = None
        if tipo == "Persona natural":
            usar_laboral = st.checkbox(
                "Parte de los ingresos son de fuente laboral (salario/empleado)",
                value=True,
            )
            if usar_laboral:
                ingresos_laborales = st.number_input(
                    "Ingresos de fuente laboral (COP)",
                    min_value=0.0,
                    value=ingresos,
                    step=1_000_000.0,
                    format="%f",
                    help="Base para la exención de 790 UVT del art. 336 ET.",
                )

        calcular = st.button("🧮 Calcular impuesto", type="primary", use_container_width=True)

    with col_der:
        if calcular:
            resultado = liquidar(
                ingresos_totales=ingresos,
                ingresos_no_constitutivos=no_constitutivos,
                costos_y_deducciones=costos,
                rentas_exentas=exentas,
                anio=anio,
                es_persona_natural=(tipo == "Persona natural"),
                ingresos_laborales=ingresos_laborales,
            )

            st.success(f"UVT usada para {resultado['anio_gravable']}: {_cop(resultado['uvt'])}")
            st.metric("💰 Impuesto básico de renta", _cop(resultado["impuesto_basico_cop"]))
            st.metric("Renta líquida gravable", _cop(resultado["renta_liquida_gravable"]))
            st.caption(f"Base en UVT: {resultado['base_uvt']:,.2f}")

            st.subheader("El camino, paso a paso")
            st.markdown(
                f"""
                | Concepto | Valor |
                |---|---:|
                | Ingresos totales | {_cop(resultado['ingresos_totales'])} |
                | (–) No constitutivos | {_cop(resultado['ingresos_no_constitutivos'])} |
                | **= Ingresos netos** | **{_cop(resultado['ingresos_netos'])}** |
                | (–) Costos y deducciones | {_cop(resultado['costos_y_deducciones'])} |
                | **= Renta líquida** | **{_cop(resultado['renta_liquida'])}** |
                | (–) Rentas exentas | {_cop(resultado['rentas_exentas'])} |
                | **= Renta líquida gravable** | **{_cop(resultado['renta_liquida_gravable'])}** |
                """
            )

            with st.expander("🔬 Cómo se aplicó la tarifa del art. 241 ET"):
                st.markdown(
                    "El impuesto se calcula por **tramos**: cada porción de su base se grava con la tarifa del tramo al que pertenece."
                )
                filas = [
                    {
                        "Tramo (UVT)": f"{d['tramo_desde']:,.0f} – {d['tramo_hasta'] if isinstance(d['tramo_hasta'], str) else format(d['tramo_hasta'], ',.0f')}",
                        "UVT gravadas en el tramo": f"{d['uvt_en_tramo']:,.2f}",
                        "Tarifa": f"{d['tarifa'] * 100:.0f}%",
                        "Impuesto del tramo (UVT)": f"{d['impuesto_tramo']:,.2f}",
                    }
                    for d in resultado["detalle_tramos"]
                ]
                st.dataframe(filas, use_container_width=True, hide_index=True)

            for nota in resultado["notas"]:
                st.info(f"ℹ️ {nota}")

            st.caption(
                "⚠️ Este resultado es el impuesto básico (art. 241 ET). No incluye "
                "anticipos, descuentos por impuestos pagados en el exterior ni "
                "retenciones en la fuente, que se restan en la declaración."
            )
        else:
            st.markdown(
                """
                👈 **Llene los datos a la izquierda y presione Calcular.**

                Verá no solo el impuesto, sino **el camino completo**: cada resta
                y cada tramo de la tarifa, listo para explicar a su cliente o
                revisor fiscal.
                """
            )

    with st.expander("📊 Tabla del art. 241 ET vigente (referencia)"):
        st.markdown(
            "| Base gravable (UVT) | Tarifa |\n|---|---|\n"
            + "\n".join(
                f"| 0 – {limite if limite else 'en adelante'} | {tarifa * 100:.0f}% |"
                for limite, tarifa in TRAMOS_ART_241
            )
        )
