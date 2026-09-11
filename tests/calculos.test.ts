import { describe, expect, it } from "vitest";
import { liquidar } from "../lib/herramientas/renta";
import { digitoVerificacionNit, validarExogenas } from "../lib/herramientas/exogenas";
import { primaServicios, cesantias, interesesCesantias } from "../lib/herramientas/nomina";

describe("Liquidador de renta (art. 241 ET)", () => {
  it("una renta baja no paga impuesto", () => {
    const r = liquidar({ ingresosTotales: 40_000_000, anio: 2025, esPersonaNatural: true });
    expect(r.impuestoBasicoCop).toBe(0);
  });

  it("aplica la tarifa marginal y la UVT de 2025", () => {
    const r = liquidar({
      ingresosTotales: 100_000_000, anio: 2025,
      esPersonaNatural: false,
    });
    expect(r.impuestoBasicoCop).toBeGreaterThan(0);
    expect(Math.abs(r.baseUvt - 100_000_000 / 49_799)).toBeLessThan(0.01);
  });

  it("la exención laboral reduce el impuesto", () => {
    const sin = liquidar({ ingresosTotales: 300_000_000, anio: 2025, esPersonaNatural: false });
    const con = liquidar({ ingresosTotales: 300_000_000, anio: 2025, esPersonaNatural: true });
    expect(con.impuestoBasicoCop).toBeLessThan(sin.impuestoBasicoCop);
  });

  it("respeta el tope de 2.400 UVT en exenciones de persona natural", () => {
    const r = liquidar({
      ingresosTotales: 200_000_000, rentasExentas: 500_000_000, anio: 2025,
      esPersonaNatural: true, ingresosLaborales: 0,
    });
    expect(r.rentasExentas).toBeLessThanOrEqual(2_400 * 49_799 + 0.01);
  });
});

describe("Validador de exógenas", () => {
  const columnas1004 = [
    "NIT", "Razón Social", "Dirección", "Departamento", "Municipio", "País",
    "Ingresos Brutos", "Costos", "Pagos a Terceros", "Consignaciones y Pagos",
  ];

  it("calcula el dígito de verificación oficial de la DIAN", () => {
    expect(digitoVerificacionNit("900123456")).toBe(8);
  });

  it("aprueba un archivo con todas las columnas del formato 1004", () => {
    const inf = validarExogenas(columnas1004, [["815000842", "Entidad", "Calle 1", "Cundinamarca", "Bogotá", "CO", 1, 1, 1, 1]], "1004");
    expect(inf.estado).toBe("LISTO");
    expect(inf.pareceNoSerExogenas).toBe(false);
  });

  it("marca observaciones cuando faltan columnas", () => {
    const inf = validarExogenas(["NIT", "Razón Social", "Ingresos"], [["1", "X", 2]], "1004");
    expect(inf.estado).toBe("CON OBSERVACIONES");
    expect(inf.columnasFaltantes.length).toBeGreaterThan(0);
  });

  it("avisa cuando el archivo ni siquiera parece de exógenas", () => {
    const inf = validarExogenas(["nombres", "apellidos", "correo_electronico"], [], "1004");
    expect(inf.pareceNoSerExogenas).toBe(true);
  });
});

describe("Nómina y prestaciones (CST)", () => {
  it("prima de un semestre completo = salario ÷ 2", () => {
    expect(Math.abs(primaServicios(2_000_000, 180).prima - 1_000_000)).toBeLessThan(0.01);
  });

  it("prima prorrateada de 90 días", () => {
    expect(Math.abs(primaServicios(2_000_000, 90).prima - 500_000)).toBeLessThan(0.01);
  });

  it("cesantías de un año = salario", () => {
    expect(Math.abs(cesantias(2_000_000, 360).cesantias - 2_000_000)).toBeLessThan(0.01);
  });

  it("intereses a las cesantías = 12%", () => {
    expect(Math.abs(interesesCesantias(2_000_000, 360).intereses - 240_000)).toBeLessThan(0.01);
  });
});
