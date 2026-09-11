"use client";

import { useState } from "react";
import { liquidacionCompleta, cop } from "@/lib/herramientas/nomina";

export default function NominaPage() {
  const [salario, setSalario] = useState(2_000_000);
  const [transporte, setTransporte] = useState(0);
  const [desde, setDesde] = useState("2025-01-01");
  const [hasta, setHasta] = useState("2025-06-30");
  const [r, setR] = useState<ReturnType<typeof liquidacionCompleta> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = () => {
    try {
      const inicio = new Date(desde + "T00:00:00");
      const fin = new Date(hasta + "T00:00:00");
      if (fin <= inicio) throw new Error("La fecha de corte debe ser posterior a la de inicio.");
      setError(null);
      setR(liquidacionCompleta(salario, inicio, fin, transporte));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error en el cálculo.");
      setR(null);
    }
  };

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">💰 Nómina y Prestaciones</h1>
      <p className="mt-2 text-slate-600">
        Prima de servicios, cesantías e intereses según el CST (arts. 185-197 y 210) y la Ley 50 de 1990.
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <summary className="font-semibold">📖 ¿Qué es qué?</summary>
        <ul className="mt-2 list-disc pl-5 text-slate-600">
          <li><strong>Prima:</strong> 15 días de salario por semestre. Se paga el 30 de junio y el 20 de diciembre.</li>
          <li><strong>Cesantías:</strong> un mes de salario por año. Se consigna el 14 de febrero.</li>
          <li><strong>Intereses:</strong> 12% anual sobre las cesantías. Se pagan el 31 de enero.</li>
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-medium">Salario mensual base (COP)</label>
          <input type="number" min={0} step={50000} className={input}
            value={salario} onChange={(e) => setSalario(Number(e.target.value))} />
          <label className="mt-3 block text-sm font-medium">Auxilio de transporte mensual (COP)</label>
          <input type="number" min={0} step={10000} className={input}
            value={transporte} onChange={(e) => setTransporte(Number(e.target.value))} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Desde</label>
              <input type="date" className={input} value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Hasta</label>
              <input type="date" className={input} value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
          </div>
          <button onClick={calcular}
            className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            🧮 Calcular prestaciones
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          {r ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-sky-50 p-3">
                  <p className="text-xs text-slate-500">💵 Prima</p>
                  <p className="text-xl font-bold text-sky-800">{cop(r.prima.prima)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-slate-500">🏦 Cesantías</p>
                  <p className="text-xl font-bold text-emerald-800">{cop(r.cesantias.cesantias)}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-slate-500">📈 Intereses</p>
                  <p className="text-xl font-bold text-amber-800">{cop(r.intereses.intereses)}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                  <p className="text-xs text-slate-500">🧾 Total periodo</p>
                  <p className="text-xl font-bold">{cop(r.totalPrestaciones)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Días trabajados: {r.diasTrabajados}</p>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium">🔬 Fórmulas aplicadas</summary>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  <li>Prima: {r.prima.formula} → {cop(r.prima.prima)}</li>
                  <li>Cesantías: {r.cesantias.formula} → {cop(r.cesantias.cesantias)}</li>
                  <li>Intereses: {r.intereses.formula} → {cop(r.intereses.intereses)}</li>
                </ul>
                <p className="mt-2 text-[11px] text-slate-400">
                  El auxilio de transporte sí hace parte de la prima (art. 194 CST), pero NO de las cesantías.
                </p>
              </details>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
              👈 Ingrese el salario y el periodo, luego presione <strong>Calcular</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
