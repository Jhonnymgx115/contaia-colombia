"use client";

import { useEffect, useState } from "react";
import { cop } from "@/lib/herramientas/renta";

type Historial = {
  id: string;
  anioGravable: number;
  esPersonaNatural: boolean;
  ingresosTotales: number;
  rentaLiquidaGravable: number;
  impuestoBasicoCop: number;
  createdAt: string;
};

export default function HistorialPage() {
  const [historial, setHistorial] = useState<Historial[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/liquidaciones")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Sin conexión a la base de datos"))))
      .then((d) => setHistorial(d.historial))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">🗂️ Historial de liquidaciones</h1>
      <p className="mt-2 text-slate-600">
        Guardado en su <strong>PostgreSQL</strong> local. Solo se almacenan cifras: nunca datos
        personales de clientes.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">❌ {error}</p>}

      {!historial && !error && <p className="mt-4 text-sm text-slate-500">Cargando…</p>}

      {historial && (
        <table className="mt-4 w-full rounded-xl bg-white text-sm shadow-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="p-3">Fecha</th>
              <th className="p-3">Año</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Ingresos</th>
              <th className="p-3 text-right">Gravable</th>
              <th className="p-3 text-right">Impuesto</th>
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-400">Aún no hay liquidaciones guardadas.</td></tr>
            )}
            {historial.map((h) => (
              <tr key={h.id} className="border-b border-slate-100">
                <td className="p-3">{new Date(h.createdAt).toLocaleString("es-CO")}</td>
                <td className="p-3">{h.anioGravable}</td>
                <td className="p-3">{h.esPersonaNatural ? "Natural" : "Jurídica"}</td>
                <td className="p-3 text-right">{cop(h.ingresosTotales)}</td>
                <td className="p-3 text-right">{cop(h.rentaLiquidaGravable)}</td>
                <td className="p-3 text-right font-semibold">{cop(h.impuestoBasicoCop)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
