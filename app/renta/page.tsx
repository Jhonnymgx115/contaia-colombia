"use client";

import { useState } from "react";
import { aniosDisponibles, UVT_POR_ANIO } from "@/lib/datos/uvt";
import { liquidar, cop, type ResultadoLiquidacion } from "@/lib/herramientas/renta";
import { TRAMOS_ART_241 } from "@/lib/datos/tarifas";

const PASOS = [
  ["1", "Ingresos totales", "Todo lo que recibió en el año (ventas, honorarios, salarios)."],
  ["2", "(–) No constitutivos", "P. ej., aportes obligatorios a salud y pensión de dependientes (art. 45 ET)."],
  ["3", "(–) Costos y deducciones", "Costos de venta y gastos aceptados fiscalmente (arts. 105 y 107 ET)."],
  ["4", "(–) Rentas exentas", "P. ej., la exención laboral de 790 UVT (art. 336 ET), con topes."],
  ["5", "= Renta líquida gravable", "La base sobre la que se calcula el impuesto."],
  ["6", "× Tarifa marginal", "Tabla progresiva del art. 241 ET (0% a 37%)."],
];

export default function RentaPage() {
  const anios = aniosDisponibles();
  const [anio, setAnio] = useState(anios[0]);
  const [esNatural, setEsNatural] = useState(true);
  const [ingresos, setIngresos] = useState(0);
  const [noConstitutivos, setNoConstitutivos] = useState(0);
  const [costos, setCostos] = useState(0);
  const [exentas, setExentas] = useState(0);
  const [resultado, setResultado] = useState<ResultadoLiquidacion | null>(null);

  const calcular = () => {
    setResultado(
      liquidar({
        ingresosTotales: ingresos,
        ingresosNoConstitutivos: noConstitutivos,
        costosYDeducciones: costos,
        rentasExentas: exentas,
        anio,
        esPersonaNatural: esNatural,
        ingresosLaborales: esNatural ? ingresos : null,
      }),
    );
  };

  const input = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">🧾 Liquidador de Renta</h1>
      <p className="mt-2 text-slate-600">
        Llene las cifras del año gravable. La herramienta aplica la tarifa del{" "}
        <strong>art. 241 del Estatuto Tributario</strong> y le muestra el camino paso a paso.
      </p>

      <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">📖 ¿Cómo funciona una liquidación?</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600">
          {PASOS.map(([n, c, d]) => <li key={n}><strong>{c}</strong> — {d}</li>)}
        </ol>
      </details>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-medium">Año gravable</label>
          <select className={input} value={anio} onChange={(e) => setAnio(Number(e.target.value))}>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          {!UVT_POR_ANIO[anio] && (
            <p className="mt-1 text-xs text-amber-600">UVT de {anio} no publicada; se usa la última conocida.</p>
          )}

          <div className="mt-3 flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input type="radio" checked={esNatural} onChange={() => setEsNatural(true)} /> Persona natural
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={!esNatural} onChange={() => setEsNatural(false)} /> Jurídica (empresa)
            </label>
          </div>

          {([
            ["Ingresos totales del año (COP)", ingresos, setIngresos],
            ["Ingresos NO constitutivos (COP)", noConstitutivos, setNoConstitutivos],
            ["Costos y deducciones (COP)", costos, setCostos],
            ["Otras rentas exentas (COP)", exentas, setExentas],
          ] as const).map(([label, valor, set]) => (
            <div key={label} className="mt-3">
              <label className="block text-sm font-medium">{label}</label>
              <input type="number" min={0} step={100000} className={input}
                value={valor} onChange={(e) => set(Number(e.target.value))} />
            </div>
          ))}

          <button onClick={calcular}
            className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
            🧮 Calcular impuesto
          </button>
        </div>

        <div>
          {resultado ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                UVT {resultado.anioGravable}: {cop(resultado.uvt)}
              </p>
              <div className="mt-2 rounded-lg bg-sky-50 p-4">
                <p className="text-xs uppercase text-sky-700">💰 Impuesto básico de renta</p>
                <p className="text-3xl font-bold text-sky-800">{cop(resultado.impuestoBasicoCop)}</p>
                <p className="text-xs text-slate-500">
                  Base: {resultado.baseUvt.toLocaleString("es-CO", { maximumFractionDigits: 2 })} UVT ·
                  Gravable: {cop(resultado.rentaLiquidaGravable)}
                </p>
              </div>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {([
                    ["Ingresos totales", resultado.ingresosTotales],
                    ["(–) No constitutivos", resultado.ingresosNoConstitutivos],
                    ["= Ingresos netos", resultado.ingresosNetos],
                    ["(–) Costos y deducciones", resultado.costosYDeducciones],
                    ["= Renta líquida", resultado.rentaLiquida],
                    ["(–) Rentas exentas", resultado.rentasExentas],
                    ["= Renta líquida gravable", resultado.rentaLiquidaGravable],
                  ] as const).map(([k, v]) => (
                    <tr key={k} className="border-b border-slate-100">
                      <td className="py-1">{k}</td>
                      <td className="py-1 text-right font-medium">{cop(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resultado.notas.map((n, i) => (
                <p key={i} className="mt-2 rounded-lg bg-sky-50 p-2 text-xs text-sky-800">ℹ️ {n}</p>
              ))}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium">🔬 Cómo se aplicó la tarifa</summary>
                <table className="mt-2 w-full text-xs">
                  <thead><tr className="text-left text-slate-500"><th>Tramo (UVT)</th><th>Tarifa</th><th className="text-right">Impuesto (UVT)</th></tr></thead>
                  <tbody>
                    {resultado.detalleTramos.map((d, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td>{d.tramoDesde.toLocaleString()} – {d.tramoHasta ?? "sin límite"}</td>
                        <td>{(d.tarifa * 100).toFixed(0)}%</td>
                        <td className="text-right">{d.impuestoTramo.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
              <p className="mt-3 text-[11px] text-slate-400">
                ⚠️ Impuesto básico (art. 241 ET). No incluye anticipos ni retenciones, que se restan en la declaración.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">
              👈 Llene los datos y presione <strong>Calcular</strong>. Verá el camino completo,
              listo para explicarle a su cliente o revisor fiscal.
            </div>
          )}
        </div>
      </div>

      <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">📊 Tabla del art. 241 ET vigente</summary>
        <table className="mt-2 w-full text-xs">
          <tbody>
            {TRAMOS_ART_241.map((t, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td>0 – {t.limite?.toLocaleString() ?? "en adelante"} UVT</td>
                <td>{(t.tarifa * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
