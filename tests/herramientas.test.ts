import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { exportarXlsx, leerPlanilla } from "../lib/herramientas/planillas";
import { proveedorPorId, PROVEEDORES } from "../lib/ia/proveedores";

describe("Excel y LibreOffice (SheetJS)", () => {
  it("genera un .xlsx real y lo relee con los mismos datos", async () => {
    const contenido = exportarXlsx([
      {
        nombre: "Liquidación",
        columnas: [
          { titulo: "Concepto", valores: ["Ingresos", "Impuesto"] },
          { titulo: "Valor", valores: [100000000, 9708827] },
        ],
      },
    ]);
    const archivo = new File([contenido.buffer as ArrayBuffer], "liquidacion.xlsx");
    const hoja = await leerPlanilla(archivo);
    expect(hoja.formato).toBe("xlsx");
    expect(hoja.encabezados).toEqual(["Concepto", "Valor"]);
    expect(hoja.filas[0][0]).toBe("Ingresos");
    expect(hoja.filas[1][1]).toBe(9708827);
  });

  it("lee .ods de LibreOffice", async () => {
    // SheetJS genera ODS válido (mismo formato que exporta LibreOffice Calc).
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet([["NIT", "Ingresos"], ["900123456", 5000]]);
    XLSX.utils.book_append_sheet(libro, hoja, "1003");
    const ods = new Uint8Array(XLSX.write(libro, { bookType: "ods", type: "array" }));
    const leida = await leerPlanilla(new File([ods], "exogenas.ods"));
    expect(leida.formato).toBe("ods");
    expect(leida.encabezados).toContain("NIT");
  });

  it("rechaza formatos no soportados con un mensaje claro", async () => {
    await expect(leerPlanilla(new File([new Uint8Array([1, 2])], "datos.pdf"))).rejects.toThrow(/no soportado/);
  });
});

describe("Proveedores de IA", () => {
  it("incluye Gemini, DeepSeek, OpenAI y Anthropic", () => {
    const ids = PROVEEDORES.map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(["gemini", "deepseek", "openai", "anthropic"]));
  });

  it("detecta los proveedores con clave configurada", () => {
    const env: Record<string, string | undefined> = { GEMINI_API_KEY: "test-key", DEEPSEEK_API_KEY: "", ANTHROPIC_API_KEY: "tu-clave-aqui" };
    const disponibles = PROVEEDORES.filter(
      (p) => env[p.variableClave]?.trim() && env[p.variableClave] !== "tu-clave-aqui",
    );
    expect(disponibles.map((p) => p.id)).toEqual(["gemini"]);
  });

  it("cada proveedor tiene variable de clave y modelo por defecto", () => {
    for (const p of PROVEEDORES) {
      expect(p.variableClave).toBeTruthy();
      expect(p.modeloPorDefecto).toBeTruthy();
      expect(proveedorPorId(p.id)).toBe(p);
    }
  });
});
