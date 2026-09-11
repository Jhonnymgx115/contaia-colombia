// Nómina y prestaciones sociales — CST arts. 185-197 y 210; Ley 50 de 1990.

export function diasTrabajadosSemestre(inicio: Date, fin: Date): number {
  return Math.round((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;
}

export type PrimaResult = { prima: number; diasReconocidos: number; formula: string };

export function primaServicios(
  salarioMensual: number,
  diasSemestre: number,
  auxilioTransporte = 0,
): PrimaResult {
  if (diasSemestre <= 0) throw new Error("Los días del semestre deben ser mayores a cero.");
  const diasReconocidos = Math.min(diasSemestre, 180);
  const salarioDiario = salarioMensual / 30;
  const transporteDiario = auxilioTransporte / 30;
  return {
    prima: redondear(((salarioDiario + transporteDiario) * diasReconocidos) / 12),
    diasReconocidos,
    formula: "(salario mensual / 30) × días trabajados ÷ 12 (equivale a 15 días por semestre completo)",
  };
}

export function cesantias(salarioMensual: number, diasTrabajados: number) {
  if (diasTrabajados <= 0) throw new Error("Los días trabajados deben ser mayores a cero.");
  return {
    cesantias: redondear((salarioMensual * diasTrabajados) / 360),
    diasTrabajados,
    formula: "(salario mensual) × días trabajados ÷ 360",
  };
}

export function interesesCesantias(valorCesantias: number, diasTrabajados: number) {
  if (valorCesantias < 0 || diasTrabajados <= 0)
    throw new Error("Valores inválidos para el cálculo de intereses.");
  return {
    intereses: redondear((valorCesantias * 0.12 * diasTrabajados) / 360),
    tasa: "12% anual",
    formula: "(cesantías) × 12% × días trabajados ÷ 360",
  };
}

export function liquidacionCompleta(
  salarioMensual: number,
  fechaIngreso: Date,
  fechaFin: Date,
  auxilioTransporte = 0,
) {
  const dias = diasTrabajadosSemestre(fechaIngreso, fechaFin);
  const p = primaServicios(salarioMensual, dias, auxilioTransporte);
  const c = cesantias(salarioMensual, dias);
  const i = interesesCesantias(c.cesantias, dias);
  return {
    diasTrabajados: dias,
    prima: p,
    cesantias: c,
    intereses: i,
    totalPrestaciones: redondear(p.prima + c.cesantias + i.intereses),
  };
}

function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

export function cop(valor: number): string {
  return `$${Math.round(valor).toLocaleString("es-CO")}`;
}
