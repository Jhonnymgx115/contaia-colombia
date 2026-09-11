"use client";

import { OBLIGACIONES, proximas } from "@/lib/datos/calendario";

export default function CalendarioPage() {
  const prox = proximas(new Date(), 4);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">📅 Calendario Tributario</h1>
      <p className="mt-2 text-slate-600">
        Las obligaciones llegan por temporadas. Aquí tiene las próximas y la temporada completa.
      </p>

      <h2 className="mt-6 font-semibold">⏰ Sus próximas fechas</h2>
      <div className="mt-2 space-y-2">
        {prox.map((ob) => (
          <div key={ob.nombre} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">{ob.nombre}</h3>
            <p className="text-sm text-slate-600">🗓️ <strong>{ob.tipico}</strong> · <em>{ob.norma}</em></p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-semibold">🗓️ Temporada completa</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {OBLIGACIONES.map((ob) => (
          <li key={ob.nombre} className="rounded-lg bg-white px-3 py-2 shadow-sm">
            <strong>{ob.nombre}</strong> — {ob.tipico} · <em className="text-slate-500">{ob.norma}</em>
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
        ℹ️ Las fechas exactas las fija la DIAN cada año en su resolución de plazos y dependen de los
        últimos dos dígitos del NIT. Use esta vista como mapa general y confirme la resolución vigente.
      </p>
    </div>
  );
}
