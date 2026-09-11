// Tarifa marginal del impuesto sobre la renta — art. 241 del Estatuto
// Tributario (vigente desde la Ley 2277 de 2022). Tramos en UVT.
export type Tramo = { limite: number | null; tarifa: number };

export const TRAMOS_ART_241: Tramo[] = [
  { limite: 1_090, tarifa: 0.0 },
  { limite: 1_780, tarifa: 0.19 },
  { limite: 4_100, tarifa: 0.28 },
  { limite: 8_670, tarifa: 0.33 },
  { limite: 18_970, tarifa: 0.35 },
  { limite: null, tarifa: 0.37 },
];

// Art. 336 ET — renta laboral exenta y tope total de exenciones.
export const RENTA_LABORAL_EXENTA_UVT = 790;
export const TOPE_EXENTAS_PERSONA_NATURAL_UVT = 2_400;

export type DetalleTramo = {
  tramoDesde: number;
  tramoHasta: number | null;
  uvtEnTramo: number;
  tarifa: number;
  impuestoTramo: number;
};

export function impuestoBasico(baseUvt: number): {
  impuestoUvt: number;
  detalle: DetalleTramo[];
} {
  const detalle: DetalleTramo[] = [];
  let impuesto = 0;
  let limiteAnterior = 0;

  for (const { limite, tarifa } of TRAMOS_ART_241) {
    if (baseUvt <= limiteAnterior) break;
    const tope = limite === null ? baseUvt : Math.min(baseUvt, limite);
    const uvtEnTramo = tope - limiteAnterior;
    impuesto += uvtEnTramo * tarifa;
    detalle.push({
      tramoDesde: limiteAnterior,
      tramoHasta: limite,
      uvtEnTramo,
      tarifa,
      impuestoTramo: uvtEnTramo * tarifa,
    });
    if (limite === null || baseUvt <= limite) break;
    limiteAnterior = limite;
  }
  return { impuestoUvt: impuesto, detalle };
}
