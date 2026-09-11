// Excel y LibreOffice para ContaIA Colombia.
// Lee .xlsx (Excel), .xls (Excel antiguo), .ods (LibreOffice Calc) y .csv
// mediante SheetJS; y exporta resultados a .xlsx listos para abrir en
// Excel o LibreOffice.
// Todo se procesa en memoria: los archivos nunca salen del equipo.

import * as XLSX from "xlsx";

export type HojaLeida = {
  encabezados: string[];
  filas: unknown[][];
  nombreHoja: string;
  formato: string;
};

const EXTENSIONES = new Set(["xlsx", "xls", "ods", "csv", "txt"]);

export function extensionesSoportadas(): string[] {
  return [...EXTENSIONES];
}

export async function leerPlanilla(archivo: File): Promise<HojaLeida> {
  const ext = (archivo.name.split(".").pop() ?? "").toLowerCase();
  if (!EXTENSIONES.has(ext)) {
    throw new Error(
      `Formato «${ext || "desconocido"}» no soportado. Use: ${[...EXTENSIONES].join(", ")}.`,
    );
  }
  const buffer = await archivo.arrayBuffer();
  const libro = XLSX.read(buffer, { type: "array", raw: false });
  const nombreHoja = libro.SheetNames[0];
  if (!nombreHoja) throw new Error("El archivo no tiene hojas.");

  const hoja = libro.Sheets[nombreHoja];
  const matriz = XLSX.utils.sheet_to_json<unknown[]>(hoja, { header: 1, defval: "" });
  if (matriz.length === 0) throw new Error("La primera hoja está vacía.");

  const encabezados = (matriz[0] as unknown[]).map((c, i) => String(c ?? `Columna ${i + 1}`));
  const filas = matriz.slice(1).filter((f) => Array.isArray(f) && f.some((c) => String(c ?? "").trim() !== ""));

  return { encabezados, filas, nombreHoja, formato: ext };
}

export type ColumnaSalida = { titulo: string; valores: (string | number)[] };

/** Genera un .xlsx real (compatible con Excel y LibreOffice Calc). */
export function exportarXlsx(
  hojas: { nombre: string; columnas: ColumnaSalida[] }[],
): Uint8Array {
  const libro = XLSX.utils.book_new();
  for (const { nombre, columnas } of hojas) {
    const hoja = XLSX.utils.aoa_to_sheet([
      columnas.map((c) => c.titulo),
      ...columnas[0]?.valores.map((_, fila) => columnas.map((c) => c.valores[fila])) ?? [],
    ]);
    XLSX.utils.book_append_sheet(libro, hoja, nombre.slice(0, 31));
  }
  return new Uint8Array(XLSX.write(libro, { bookType: "xlsx", type: "array" }));
}
