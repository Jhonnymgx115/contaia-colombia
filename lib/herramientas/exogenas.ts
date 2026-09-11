// Validador de exógenas — Resolución 000162 de 2016 (formatos 1003/1004).
// Portado del módulo Python; opera sobre encabezados + filas crudas para
// funcionar tanto en el navegador como en el servidor.

export const FORMATOS: Record<string, { nombre: string; columnasMinimas: string[] }> = {
  "1003": {
    nombre: "1003 — Personas naturales, sucesiones líquidas y patrimonios autónomos",
    columnasMinimas: [
      "nit", "primer apellido", "segundo apellido", "primer nombre",
      "otros nombres", "razón social", "dirección", "departamento",
      "municipio", "país", "ingresos", "aportes a seguridad social",
      "pensiones", "otros ingresos", "consignaciones y pagos",
    ],
  },
  "1004": {
    nombre: "1004 — Personas jurídicas, sociedades y entes colectivos",
    columnasMinimas: [
      "nit", "razón social", "dirección", "departamento", "municipio",
      "país", "ingresos brutos", "costos", "pagos a terceros",
      "consignaciones y pagos",
    ],
  },
};

// Pesos oficiales DIAN para el dígito de verificación del NIT.
export const PESOS_NIT = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

export function digitoVerificacionNit(nit: string | number): number {
  const solo = String(nit).replace(/\D/g, "");
  if (!solo) throw new Error("NIT vacío");
  let suma = 0;
  [...solo].reverse().forEach((d, i) => {
    if (i < PESOS_NIT.length) suma += Number(d) * PESOS_NIT[i];
  });
  const resto = suma % 11;
  return resto === 0 || resto === 1 ? resto : 11 - resto;
}

export function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type InformeExogenas = {
  formato: string;
  nombreFormato: string;
  totalFilas: number;
  columnasEncontradas: string[];
  columnasFaltantes: string[];
  advertencias: string[];
  estado: "LISTO" | "CON OBSERVACIONES";
  pareceNoSerExogenas: boolean;
};

export function validarExogenas(
  encabezados: string[],
  filas: unknown[][],
  formato = "1003",
): InformeExogenas {
  const config = FORMATOS[formato];
  if (!config) throw new Error(`Formato no soportado: ${formato}`);

  const columnasArchivo = encabezados.map(normalizar);
  const encontradas: string[] = [];
  const faltantes: string[] = [];

  for (const esperada of config.columnasMinimas) {
    const objetivo = normalizar(esperada);
    let coincidencia = columnasArchivo.find((c) => c === objetivo);
    if (!coincidencia) {
      coincidencia = columnasArchivo.find(
        (c) => c.includes(objetivo) || objetivo.includes(c),
      );
    }
    if (coincidencia) encontradas.push(esperada);
    else faltantes.push(esperada);
  }

  const advertencias: string[] = [];
  const idxNit = columnasArchivo.indexOf("nit");
  if (idxNit >= 0) {
    let malos = 0;
    for (const fila of filas) {
      const valor = String(fila?.[idxNit] ?? "");
      if (!valor.replace(/\D/g, "") || valor.replace(/\D/g, "").length < 6) malos++;
    }
    if (malos) {
      advertencias.push(
        `${malos} fila(s) tienen un NIT/identificación con formato dudoso. Revíselas antes de cargar a la DIAN.`,
      );
    }
  }
  if (filas.length === 0) advertencias.push("El archivo no contiene filas de datos.");

  return {
    formato,
    nombreFormato: config.nombre,
    totalFilas: filas.length,
    columnasEncontradas: encontradas,
    columnasFaltantes: faltantes,
    advertencias,
    estado: faltantes.length ? "CON OBSERVACIONES" : "LISTO",
    pareceNoSerExogenas: encontradas.length / config.columnasMinimas.length < 0.3,
  };
}

// Parser CSV simple del lado del cliente (soporta , y ;).
export function parsearCsv(texto: string): { encabezados: string[]; filas: unknown[][] } {
  const separador = texto.includes(";") ? ";" : ",";
  const lineas = texto.trim().split(/\r?\n/);
  const partir = (linea: string) =>
    linea
      .split(separador)
      .map((c) => c.trim().replace(/^"(.*)"$/, "$1"));
  const encabezados = partir(lineas[0] ?? "");
  const filas = lineas.slice(1).filter(Boolean).map(partir);
  return { encabezados, filas };
}
