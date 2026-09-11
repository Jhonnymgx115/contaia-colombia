// Liquidador de renta (art. 241 ET) — espejo del módulo Python.
import { uvt } from "../datos/uvt";
import {
  impuestoBasico,
  RENTA_LABORAL_EXENTA_UVT,
  TOPE_EXENTAS_PERSONA_NATURAL_UVT,
} from "../datos/tarifas";

export type EntradaLiquidacion = {
  ingresosTotales: number;
  ingresosNoConstitutivos?: number;
  costosYDeducciones?: number;
  rentasExentas?: number;
  anio: number;
  esPersonaNatural: boolean;
  ingresosLaborales?: number | null;
};

export type ResultadoLiquidacion = {
  anioGravable: number;
  uvt: number;
  ingresosTotales: number;
  ingresosNoConstitutivos: number;
  ingresosNetos: number;
  costosYDeducciones: number;
  rentaLiquida: number;
  rentasExentas: number;
  rentaLiquidaGravable: number;
  baseUvt: number;
  impuestoBasicoUvt: number;
  impuestoBasicoCop: number;
  detalleTramos: ReturnType<typeof impuestoBasico>["detalle"];
  notas: string[];
};

export function liquidar(entrada: EntradaLiquidacion): ResultadoLiquidacion {
  const {
    ingresosTotales,
    ingresosNoConstitutivos = 0,
    costosYDeducciones = 0,
    rentasExentas = 0,
    anio,
    esPersonaNatural,
    ingresosLaborales = null,
  } = entrada;

  const vUvt = uvt(anio);
  const ingresosNetos = Math.max(ingresosTotales - ingresosNoConstitutivos, 0);
  const rentaLiquida = Math.max(ingresosNetos - costosYDeducciones, 0);

  let exencionesAplicadas = rentasExentas;
  const notas: string[] = [];

  if (esPersonaNatural) {
    const porcionLaboral = ingresosLaborales ?? ingresosNetos;
    const exencionLaboral = Math.min(
      RENTA_LABORAL_EXENTA_UVT * vUvt,
      Math.max(porcionLaboral, 0),
    );
    exencionesAplicadas += exencionLaboral;
    notas.push(
      `Exención de ingresos laborales (art. 336 ET): ${RENTA_LABORAL_EXENTA_UVT} UVT = ${exencionLaboral.toLocaleString("es-CO")} COP.`,
    );

    const topeTotal = TOPE_EXENTAS_PERSONA_NATURAL_UVT * vUvt;
    if (exencionesAplicadas > topeTotal) {
      notas.push(
        `Las rentas exentas y deducciones superaron el tope de ${TOPE_EXENTAS_PERSONA_NATURAL_UVT} UVT; se ajustaron al tope.`,
      );
    }
    exencionesAplicadas = Math.min(exencionesAplicadas, topeTotal, rentaLiquida);
  }

  exencionesAplicadas = Math.min(exencionesAplicadas, rentaLiquida);
  const rentaGravable = rentaLiquida - exencionesAplicadas;
  const baseUvt = rentaGravable / vUvt;
  const { impuestoUvt, detalle } = impuestoBasico(baseUvt);

  return {
    anioGravable: anio,
    uvt: vUvt,
    ingresosTotales,
    ingresosNoConstitutivos,
    ingresosNetos,
    costosYDeducciones,
    rentaLiquida,
    rentasExentas: exencionesAplicadas,
    rentaLiquidaGravable: rentaGravable,
    baseUvt,
    impuestoBasicoUvt: impuestoUvt,
    impuestoBasicoCop: impuestoUvt * vUvt,
    detalleTramos: detalle,
    notas,
  };
}

export function cop(valor: number): string {
  return `$${Math.round(valor).toLocaleString("es-CO")}`;
}
