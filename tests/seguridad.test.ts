import { describe, expect, it } from "vitest";
import { escanear } from "../lib/seguridad/guardia";

describe("Escudo anti-fuga", () => {
  it("no detecta datos en texto limpio", () => {
    const inf = escanear("¿Qué es la renta líquida gravable según el Estatuto Tributario?");
    expect(inf.hayDatos).toBe(false);
    expect(inf.textoSeguro).toBe(inf.textoOriginal);
  });

  it("detecta y oculta la cédula con etiqueta", () => {
    const inf = escanear("El cliente con cédula 1023456789 pregunta por su declaración.");
    expect(inf.hayDatos).toBe(true);
    expect(inf.textoSeguro).not.toContain("1023456789");
  });

  it("detecta el correo electrónico", () => {
    const inf = escanear("Escríbeme a juan.perez@empresa.com para coordinar.");
    expect(inf.hallazgos.some((h) => h.categoria === "Correo electrónico")).toBe(true);
    expect(inf.textoSeguro).not.toContain("juan.perez@empresa.com");
  });

  it("detecta la tarjeta de crédito", () => {
    const inf = escanear("Se pagó con la tarjeta 4111111111111111.");
    expect(inf.hallazgos.some((h) => h.categoria.includes("Tarjeta"))).toBe(true);
    expect(inf.textoSeguro).not.toContain("4111111111111111");
  });

  it("detecta la clave operativa", () => {
    const inf = escanear("La clave: miSecreto2024 para entrar a MUISCA.");
    expect(inf.hallazgos.some((h) => h.categoria.includes("Clave"))).toBe(true);
    expect(inf.textoSeguro).not.toContain("miSecreto2024");
  });

  it("detecta el NIT con dígito de verificación", () => {
    const inf = escanear("Facturamos al NIT 900.123.456-1 del proveedor.");
    expect(inf.hallazgos.some((h) => h.categoria.includes("NIT"))).toBe(true);
    expect(inf.textoSeguro).not.toContain("900.123.456-1");
  });

  it("detecta la cédula escrita con puntos sin confundirla con IP", () => {
    const inf = escanear("El declarante cédula 1.023.456.789 no presentó renta.");
    expect(inf.hayDatos).toBe(true);
    expect(inf.textoSeguro).not.toContain("1.023.456.789");
    expect(inf.hallazgos.some((h) => h.categoria.includes("IP"))).toBe(false);
  });

  it("detecta la cuenta de ahorros con etiqueta", () => {
    const inf = escanear("La consignación va a la cuenta de ahorros 12345678901.");
    expect(inf.hayDatos).toBe(true);
    expect(inf.textoSeguro).not.toContain("12345678901");
  });

  it("sigue detectando direcciones IP válidas", () => {
    const inf = escanear("El servidor de la DIAN responde en 192.168.1.10.");
    expect(inf.hallazgos.some((h) => h.categoria.includes("IP"))).toBe(true);
  });

  it("el informe es legible", () => {
    const inf = escanear("cédula 1012345678 en el contrato");
    expect(inf.resumen).toContain("OCULTADOS");
  });
});
