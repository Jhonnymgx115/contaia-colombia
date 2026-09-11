"""
Prueba end-to-end de ContaIA Colombia con datos abiertos reales de
datos.gov.co:

  1. Directorio de funcionarios de la Contraloría General de la República
     (https://www.datos.gov.co/Contraloría/7pn8-vpxh)
  2. Caracterización del Empleo Público — SIGEP II, Función Pública
     (https://www.datos.gov.co/Empresas-y-Organizaciones/h8rs-jxum)

Ejecutar:  python3 scripts/prueba_datos_abiertos.py

Los archivos de datos se descargan a /tmp y NUNCA se suben al repositorio.
El reporte usa datos agregados y ejemplos fabricados, nunca los datos
personales reales (deber de reserva del contador).
"""

import subprocess
import sys
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).parent.parent
sys.path.insert(0, str(RAIZ))

from src.herramientas.exogenas import validar_exogenas, digito_verificacion_nit
from src.herramientas.renta import liquidar
from src.herramientas.nomina import prima_servicios, cesantias, intereses_cesantias
from src.seguridad.guardia_datos import escanear

DATOS = Path("/tmp/datos_abiertos")
URLS = {
    "contraloria_funcionarios.csv": "https://www.datos.gov.co/resource/7pn8-vpxh.csv?$limit=150",
    "sigep_entidades.csv": "https://www.datos.gov.co/resource/h8rs-jxum.csv?$limit=300",
}

separador = "═" * 74


def titulo(texto):
    print(f"\n{separador}\n  {texto}\n{separador}")


def descargar_datos():
    DATOS.mkdir(exist_ok=True)
    for nombre, url in URLS.items():
        ruta = DATOS / nombre
        if not ruta.exists():
            print(f"⬇️  Descargando {nombre}…")
            subprocess.run(["curl", "-s", url, "-o", str(ruta)], check=True)
        else:
            print(f"✔  {nombre} ya descargado")


def prueba_escudo_antifuga():
    """El texto fabricado imita un caso real: el contador pega una fila del
    directorio para preguntarle a la IA. El escudo debe ocultar el correo."""
    fila_real = pd.read_csv(DATOS / "contraloria_funcionarios.csv").iloc[0]
    texto_consulta = (
        f"Mi cliente, funcionario del centro {fila_real['nombre_centro_trabajo']}, "
        f"escribe desde {fila_real['correo_electronico']} y pregunta: "
        "¿qué documentos soportan la exención laboral de 790 UVT?"
    )
    informe = escanear(texto_consulta)
    print(f"Datos protegidos: {informe.total_datos_protegidos} — {informe.nivel_riesgo}")
    print(informe.resumen())
    assert informe.hay_datos, "el escudo debía detectar el correo real del dataset"
    assert fila_real["correo_electronico"] not in informe.texto_seguro, "el correo REAL quedó sin enmascarar"
    print("✅ PRUEBA ESCUDO: el correo real del dataset quedó oculto antes de enviar.")
    return informe


def prueba_validador_exogenas():
    """El CSV de la Contraloría se comporta como un archivo real de terceros:
    columnas distintas al formato, datos faltantes, tildes/ñ en encabezados."""
    df = pd.read_csv(DATOS / "contraloria_funcionarios.csv")
    informe = validar_exogenas(df, "1004")
    print(f"Formato 1004 contra CSV real de la Contraloría ({len(df)} filas):")
    print(f"  Estado: {informe['estado']}")
    print(f"  Columnas encontradas: {len(informe['columnas_encontradas'])}")
    print(f"  Columnas faltantes: {informe['columnas_faltantes']}")
    for a in informe["advertencias"]:
        print(f"  ⚠️ {a}")
    return informe


def prueba_digitos_nit_reales():
    """Los NIT de las entidades SIGEP son reales; el DV del archivo debe
    coincidir con el que calcula la herramienta."""
    df = pd.read_csv(DATOS / "sigep_entidades.csv", dtype=str)
    df = df[df["nit"].notna() & df["nit"].str.strip().ne("")]
    verificados = divergentes = 0
    ejemplos_divergentes = []
    for _, fila in df.iterrows():
        nit = fila["nit"].strip()
        if not nit.isdigit():
            continue
        dv_calculado = digito_verificacion_nit(nit)
        verificados += 1
        dv_archivo = str(fila.get("dv", "")).strip()
        if "dv" in df.columns and dv_archivo.isdigit() and int(dv_archivo) != dv_calculado:
            divergentes += 1
            if len(ejemplos_divergentes) < 3:
                # Se registra solo el NIT de la entidad pública, dato público.
                ejemplos_divergentes.append((nit, dv_archivo, dv_calculado))
    print(f"NIT verificados: {verificados}")
    if ejemplos_divergentes:
        print("Divergencias (nit, dv_archivo, dv_calculado):", ejemplos_divergentes)
    return verificados, divergentes


def prueba_renta_con_agregados():
    """Liquida renta de un funcionario representativo usando el salario
    mensual promedio REAL del dataset SIGEP (Función Pública)."""
    df = pd.read_csv(DATOS / "sigep_entidades.csv")
    total_servidores = (
        pd.to_numeric(df["genero_hombre"], errors="coerce").fillna(0)
        + pd.to_numeric(df["genero_mujer"], errors="coerce").fillna(0)
        + pd.to_numeric(df["genero_no_binario"], errors="coerce").fillna(0)
    ).sum()
    salario_promedio = pd.to_numeric(df["salario_mensual_promedio"], errors="coerce")
    salario_promedio = salario_promedio[salario_promedio > 0].median()
    ingresos_anuales = salario_promedio * 12
    print(f"Servidores públicos agregados en la muestra: {total_servidores:,.0f}")
    print(f"Salario mensual promedio REAL (mediana SIGEP): ${salario_promedio:,.0f}")
    print(f"Ingresos anuales del caso representativo: ${ingresos_anuales:,.0f}")

    r = liquidar(
        ingresos_totales=ingresos_anuales,
        anio=2025,
        es_persona_natural=True,
        ingresos_laborales=ingresos_anuales,
    )
    print(f"  Renta líquida gravable: ${r['renta_liquida_gravable']:,.0f}")
    print(f"  Impuesto básico: ${r['impuesto_basico_cop']:,.0f}")
    assert r["uvt"] == 49_799

    # Nómina con el salario promedio real (verifica fórmulas con cifras reales)
    p = prima_servicios(salario_promedio, 180)
    c = cesantias(salario_promedio, 360)
    i = intereses_cesantias(c["cesantias"], 360)
    print(f"  Prima semestre completo: ${p['prima']:,.0f} (debe ser salario ÷ 2)")
    print(f"  Cesantías año: ${c['cesantias']:,.0f} (debe ser el salario)")
    print(f"  Intereses: ${i['intereses']:,.0f} (debe ser 12% de cesantías)")
    assert abs(p["prima"] - salario_promedio / 2) < 1
    assert abs(c["cesantias"] - salario_promedio) < 1
    assert abs(i["intereses"] - salario_promedio * 0.12) < 1
    print("✅ PRUEBA RENTA+NÓMINA: consistente con el salario promedio real del sector.")
    return r


def prueba_nomina_real():
    """Prima y cesantías para un salario de la escala real (profesional
    universitario grado 01 ≈ 3.1 SMMLV en 2025)."""
    salario = 1_423_500 * 3.1
    p = prima_servicios(salario, 180)
    c = cesantias(salario, 360)
    i = intereses_cesantias(c["cesantias"], 360)
    print(f"Salario de prueba: ${salario:,.0f}")
    print(f"  Prima semestre completo: ${p['prima']:,.0f} (debe ser salario ÷ 2)")
    print(f"  Cesantías año: ${c['cesantias']:,.0f} (debe ser el salario)")
    print(f"  Intereses: ${i['intereses']:,.0f} (debe ser 12% de cesantías)")
    assert abs(p["prima"] - salario / 2) < 1
    assert abs(c["cesantias"] - salario) < 1
    assert abs(i["intereses"] - salario * 0.12) < 1
    print("✅ PRUEBA NÓMINA: fórmulas consistentes.")


if __name__ == "__main__":
    titulo("PRUEBA END-TO-END CON DATOS ABIERTOS DE COLOMBIA (datos.gov.co)")
    descargar_datos()
    titulo("1. ESCUDO ANTI-FUGA CON UN CORREO REAL DEL DATASET")
    prueba_escudo_antifuga()
    titulo("2. VALIDADOR DE EXÓGENAS CONTRA CSV REAL (CONTRALORÍA)")
    prueba_validador_exogenas()
    titulo("3. DÍGITO DE VERIFICACIÓN CONTRA NITs REALES (SIGEP)")
    prueba_digitos_nit_reales()
    titulo("4. LIQUIDADORA DE RENTA CON CIFRAS AGREGADAS DEL SECTOR")
    prueba_renta_con_agregados()
    titulo("5. NÓMINA CON SALARIO DE ESCALA REAL")
    prueba_nomina_real()
    titulo("FIN DE LA PRUEBA END-TO-END")
