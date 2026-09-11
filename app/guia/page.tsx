import Link from "next/link";

export default function GuiaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">📖 Guía Rápida</h1>
      <p className="mt-2 text-slate-600">Todo lo esencial en 5 minutos, sin tecnicismos.</p>

      <h2 className="mt-6 font-semibold">1️⃣ El año contable colombiano, de un vistazo</h2>
      <table className="mt-2 w-full rounded-xl bg-white text-sm shadow-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="p-3">Época</th><th className="p-3">Qué toca</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Enero–Febrero", "Intereses a cesantías (31 ene), consignar cesantías (14 feb)"],
            ["Marzo–Junio", "Bimestres de IVA; renta de jurídicas; exógenas de empresas"],
            ["Junio y Diciembre", "Prima de servicios (30 jun / 20 dic)"],
            ["Agosto–Octubre", "Declaración de renta de personas naturales"],
            ["Octubre", "Exógenas de personas naturales"],
          ].map(([epoca, que]) => (
            <tr key={epoca} className="border-b border-slate-100">
              <td className="p-3 font-medium">{epoca}</td>
              <td className="p-3 text-slate-600">{que}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 font-semibold">2️⃣ Conceptos clave</h2>
      <div className="mt-2 space-y-2 text-sm">
        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-medium">¿Qué es la UVT?</summary>
          <p className="mt-2 text-slate-600">
            La unidad de medida del sistema tributario: casi todos los topes y tarifas se
            expresan en UVT. En 2025 fue <strong>$49.799</strong>. ContaIA la aplica automáticamente
            según el año gravable.
          </p>
        </details>
        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-medium">¿Qué es la tarifa marginal del art. 241 ET?</summary>
          <p className="mt-2 text-slate-600">
            Tarifa <strong>por tramos</strong>: cada porción de la base se grava con la tarifa de su
            tramo (0% → 37%). No todo el ingreso se grava con la tarifa del último tramo.
          </p>
        </details>
        <details className="rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-medium">¿Por qué importa el escudo anti-fuga?</summary>
          <p className="mt-2 text-slate-600">
            Cuando usa la IA, su texto sale hacia un servicio externo. La <strong>Ley 1581 de 2012</strong> y
            el deber de reserva del contador (Ley 43 de 1990, art. 6) obligan a minimizar lo que se
            comparte. El escudo oculta datos sensibles antes de enviar nada. <Link href="/asistente" className="text-sky-600 underline">Pruébelo aquí</Link>.
          </p>
        </details>
      </div>

      <h2 className="mt-8 font-semibold">3️⃣ Consejos de uso</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>Use el liquidador para <strong>verificar</strong> sus cálculos, no como única fuente.</li>
        <li>Valide exógenas <strong>antes</strong> de la fecha límite; el validador no reemplaza la resolución vigente.</li>
        <li>En el asistente IA, pregunte conceptos, no datos de clientes.</li>
      </ul>
    </div>
  );
}
