"use client";

import { useState } from "react";
import {
  digitoVerificacionNit,
  parsearCsv,
  validarExogenas,
  type InformeExogenas,
} from "@/lib/herramientas/exogenas";
import { leerPlanilla, extensionesSoportadas } from "@/lib/herramientas/planillas";

export default function ExogenasPage() {
  const [formato, setFormato] = useState("1003");
  const [informe, setInforme] = useState<InformeExogenas | null>(null);
  const [vista, setVista] = useState<unknown[][] | null>(null);
  const [nit, setNit] = useState<string>("");
  const [dv, setDv] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alCargar = async (archivo: File) => {
    setError(null);
    try {
      let encabezados: string[];
      let filas: unknown[][];
      if (archivo.name.toLowerCase().endsWith(".csv")) {
        const parsed = parsearCsv(await archivo.text());
        encabezados = parsed.encabezados;
        filas = parsed.filas;
      } else {
        // .xlsx (Excel), .xls (Excel antiguo) y .ods (LibreOffice Calc)
        const hoja = await leerPlanilla(archivo);
        encabezados = hoja.encabezados;
        filas = hoja.filas;
      }
      setInforme(validarExogenas(encabezados, filas, formato));
      setVista(filas.slice(0, 10));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos leer el archivo. Verifique el formato e intente de nuevo.",
      );
    }
  };

  const input = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">📊 Validador de Exógenas</h1>
      <p className="mt-2 text-slate-600">
        Suba su archivo de medios magnéticos (<strong>CSV</strong>) y revise la estructura de los
        formatos <strong>1003</strong> (naturales) o <strong>1004</strong> (jurídicas) según la
        Resolución 000162 de 2016, <strong>antes</strong> de cargarlo a la DIAN.
      </p>
      <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">
        🛡️ El archivo se procesa en su navegador: no se envía a ningún servidor ni se guarda.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select className={input} value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="1003">Formato 1003 — Personas naturales</option>
          <option value="1004">Formato 1004 — Personas jurídicas</option>
        </select>
        <input type="file" accept=".xlsx,.xls,.ods,.csv" className="text-sm"
          onChange={(e) => e.target.files?.[0] && alCargar(e.target.files[0])} />
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Formatos aceptados: {extensionesSoportadas().map((e) => `.${e}`).join(" · ")} — Excel, LibreOffice Calc y CSV. El archivo se lee en su navegador.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {informe && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-semibold">
            {informe.estado === "LISTO"
              ? "✅ LISTO — contiene las columnas mínimas del formato."
              : "⚠️ CON OBSERVACIONES — faltan columnas del formato."}
          </p>
          {informe.pareceNoSerExogenas && (
            <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              🤔 Este archivo no parece ser un formato de exógenas. Verifique que exportó el
              reporte correcto desde su software contable (SIIGO, World Office, Alegra…).
            </p>
          )}
          <div className="mt-3 flex gap-6 text-sm">
            <span>Filas: <strong>{informe.totalFilas}</strong></span>
            <span>Columnas encontradas: <strong>{informe.columnasEncontradas.length}</strong></span>
            <span>Faltantes: <strong>{informe.columnasFaltantes.length}</strong></span>
          </div>
          {informe.columnasFaltantes.length > 0 && (
            <p className="mt-2 text-sm text-red-600">❌ {informe.columnasFaltantes.join(" · ")}</p>
          )}
          {informe.advertencias.map((a, i) => (
            <p key={i} className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">⚠️ {a}</p>
          ))}
        </div>
      )}

      {vista && (
        <details open className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold">🔍 Vista previa (10 filas)</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  {vista[0]?.map((_, i) => <th key={i}>Col {i + 1}</th>)}
                </tr>
              </thead>
              <tbody>
                {vista.map((fila, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {fila.map((celda, j) => <td key={j} className="py-1 pr-3">{String(celda ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">🧮 Verificador de dígito de verificación de NIT</h2>
        <div className="mt-2 flex gap-2">
          <input className={input} placeholder="Ej: 900123456" value={nit}
            onChange={(e) => setNit(e.target.value.replace(/\D/g, ""))} />
          <button
            className="rounded-lg bg-slate-800 px-4 text-sm font-medium text-white"
            onClick={() => setDv(nit ? digitoVerificacionNit(nit) : null)}
          >
            Calcular DV
          </button>
        </div>
        {dv !== null && (
          <p className="mt-2 text-sm text-emerald-700">
            El dígito de verificación de <strong>{nit}</strong> es: <strong>{dv}</strong>
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          Algoritmo oficial DIAN (módulo 11 con pesos 3, 7, 13, 17, 19…).
        </p>
      </div>
    </div>
  );
}
