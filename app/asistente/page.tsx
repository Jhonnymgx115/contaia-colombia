"use client";

import { useEffect, useState } from "react";
import { escanear, type InformeEscaneo } from "@/lib/seguridad/guardia";

type Respuesta = {
  estado: "ok" | "sin_configuracion" | "bloqueado" | "error";
  respuesta: string;
  proveedorUsado?: string;
  informe: { textoSeguro: string; resumen: string; hayDatos: boolean };
};

type ProveedorUI = { id: string; nombre: string; web: string; disponible: boolean };

const SUGERENCIAS = [
  "Explícame con un ejemplo qué son los ingresos no constitutivos de renta del artículo 45 ET.",
  "¿Qué diferencias hay entre costo y gasto deducible en el Estatuto Tributario?",
  "¿Cómo prorrateo la prima de servicios de un empleado que trabajó 3 meses?",
];

export default function AsistentePage() {
  const [pregunta, setPregunta] = useState("");
  const [proveedor, setProveedor] = useState("gemini");
  const [proveedores, setProveedores] = useState<ProveedorUI[]>([]);
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [escaneoLocal, setEscaneoLocal] = useState<InformeEscaneo | null>(null);

  useEffect(() => {
    fetch("/api/asistente")
      .then((r) => r.json())
      .then((d) => setProveedores(d.proveedores ?? []))
      .catch(() => {});
  }, []);

  const enviar = async () => {
    if (!pregunta.trim()) return;
    setCargando(true);
    setRespuesta(null);
    setEscaneoLocal(escanear(pregunta));
    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, proveedor }),
      });
      setRespuesta(await res.json());
    } catch {
      setRespuesta({
        estado: "error",
        respuesta: "No se pudo contactar el servicio de IA. Revise su conexión.",
        informe: { textoSeguro: "", resumen: "", hayDatos: false },
      });
    }
    setCargando(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">🤖 Asistente IA Contable</h1>
      <p className="mt-2 text-slate-600">
        Antes de que su texto viaje a la IA, el <strong>escudo anti-fuga</strong> revisa y oculta
        automáticamente cédulas, NITs, tarjetas, cuentas, correos, teléfonos y claves.
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-600">Proveedor de IA</label>
        <select
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
        >
          {(proveedores.length ? proveedores : [{ id: "gemini", nombre: "Google Gemini", web: "", disponible: false }]).map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}{p.disponible ? "" : " (sin clave)"}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Si el proveedor elegido falla, se usa automáticamente otro configurado como respaldo.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGERENCIAS.map((s) => (
          <button key={s} onClick={() => setPregunta(s)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs hover:border-sky-400">
            {s}
          </button>
        ))}
      </div>

      <textarea
        className="mt-4 h-28 w-full rounded-xl border border-slate-300 p-3 text-sm"
        placeholder="Ej: ¿Qué documentos soportan la exención laboral de 790 UVT?"
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
      />
      <button onClick={enviar} disabled={cargando || !pregunta.trim()}
        className="mt-2 rounded-lg bg-sky-600 px-5 py-2 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">
        {cargando ? "Enviando…" : "🚀 Enviar a la IA"}
      </button>

      {escaneoLocal?.hayDatos && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm">
          <h3 className="font-semibold">🛡️ Escudo anti-fuga — informe de protección</h3>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-emerald-900">{escaneoLocal.resumen}</pre>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs">Ver cómo quedó el texto que se envió</summary>
            <code className="mt-1 block rounded bg-white p-2 text-xs">{escaneoLocal.textoSeguro}</code>
          </details>
        </div>
      )}

        {respuesta && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold">
            🤖 Respuesta{respuesta.proveedorUsado ? ` — vía ${respuesta.proveedorUsado}` : ""}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{respuesta.respuesta}</p>
        </div>
      )}

      <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">🔐 ¿Cómo funciona el escudo?</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-600">
          <li><strong>Escaneo:</strong> buscamos cédulas, NITs, tarjetas, cuentas, correos, celulares, IPs y claves.</li>
          <li><strong>Enmascaramiento:</strong> cada dato se reemplaza, p. ej. <code>1.023.456.789</code> → <code>102***789</code>.</li>
          <li><strong>Envío:</strong> a la IA solo sale la versión enmascarada, y usted ve el informe.</li>
          <li><strong>Minimización</strong> (Ley 1581 de 2012): nunca enviamos más de lo necesario.</li>
        </ol>
      </details>
    </div>
  );
}
