// Calendario tributario colombiano — ventanas TÍPICAS por obligación.
// Las fechas exactas salen cada año en la resolución de plazos de la DIAN.
export type Obligacion = {
  nombre: string;
  norma: string;
  tipico: string;
  mesAprox: number;
};

export const OBLIGACIONES: Obligacion[] = [
  { nombre: "Impuesto de renta — Personas naturales y asimiladas", norma: "Art. 1.6-2 ET", tipico: "Agosto a octubre (según NIT)", mesAprox: 8 },
  { nombre: "Impuesto de renta — Grandes contribuyentes y personas jurídicas", norma: "Art. 1.6-2 ET", tipico: "Abril a junio (según NIT)", mesAprox: 4 },
  { nombre: "Exógenas — Grandes contribuyentes y entidades públicas (código 47)", norma: "Res. 000162 de 2016", tipico: "31 de mayo (aprox.)", mesAprox: 5 },
  { nombre: "Exógenas — Demás personas jurídicas (código 48)", norma: "Res. 000162 de 2016", tipico: "18 de junio (aprox.)", mesAprox: 6 },
  { nombre: "Exógenas — Personas naturales y asimiladas (código 49)", norma: "Res. 000162 de 2016", tipico: "Octubre, según NIT", mesAprox: 10 },
  { nombre: "IVA — Bimestre 1 (enero-febrero)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Marzo, según NIT", mesAprox: 3 },
  { nombre: "IVA — Bimestre 2 (marzo-abril)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Mayo, según NIT", mesAprox: 5 },
  { nombre: "IVA — Bimestre 3 (mayo-junio)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Julio, según NIT", mesAprox: 7 },
  { nombre: "IVA — Bimestre 4 (julio-agosto)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Septiembre, según NIT", mesAprox: 9 },
  { nombre: "IVA — Bimestre 5 (septiembre-octubre)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Noviembre, según NIT", mesAprox: 11 },
  { nombre: "IVA — Bimestre 6 (noviembre-diciembre)", norma: "Art. 1.6.1.13.1 DUT", tipico: "Enero siguiente, según NIT", mesAprox: 1 },
  { nombre: "Prima de servicios — Primer semestre", norma: "Arts. 185-197 CST", tipico: "A más tardar el 30 de junio", mesAprox: 6 },
  { nombre: "Prima de servicios — Segundo semestre", norma: "Arts. 185-197 CST", tipico: "A más tardar el 20 de diciembre", mesAprox: 12 },
  { nombre: "Cesantías — Consignación al fondo", norma: "Ley 50 de 1990, art. 205", tipico: "A más tardar el 14 de febrero", mesAprox: 2 },
  { nombre: "Intereses a las cesantías", norma: "Art. 210 CST (12% anual)", tipico: "Se pagan el 31 de enero", mesAprox: 1 },
  { nombre: "Aportes a seguridad social (PILA)", norma: "Planilla Integrada de Liquidación", tipico: "Mensual, primeros días del mes siguiente", mesAprox: 1 },
];

export function proximas(hoy: Date = new Date(), cuantas = 4): Obligacion[] {
  const cercania = (ob: Obligacion) => {
    const diff = (ob.mesAprox - (hoy.getMonth() + 1)) % 12;
    return diff === 0 ? 12 : diff;
  };
  return [...OBLIGACIONES].sort((a, b) => cercania(a) - cercania(b)).slice(0, cuantas);
}
