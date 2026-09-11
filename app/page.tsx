import Link from "next/link";

const MODULOS = [
  { href: "/renta", icono: "🧾", titulo: "Liquidador de Renta", texto: "Calcule el impuesto con la tarifa del art. 241 ET, paso a paso." },
  { href: "/exogenas", icono: "📊", titulo: "Validador de Exógenas", texto: "Revise su archivo 1003/1004 antes de subirlo a la DIAN." },
  { href: "/nomina", icono: "💰", titulo: "Nómina y Prestaciones", texto: "Prima, cesantías e intereses, con la fórmula explicada." },
  { href: "/calendario", icono: "📅", titulo: "Calendario", texto: "Las fechas típicas de cada obligación, por cercanía." },
  { href: "/asistente", icono: "🤖", titulo: "Asistente IA", texto: "Pregunte lo que quiera; el escudo protege sus datos." },
  { href: "/guia", icono: "📖", titulo: "Guía Rápida", texto: "Todo lo que necesita saber en 5 minutos." },
];

export default function Inicio() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">🇨🇴 ContaIA Colombia</h1>
      <p className="mt-3 text-slate-600">
        Bienvenido, contador(a). 👋 Esta herramienta lo acompaña en las{" "}
        <strong>diferentes épocas del año contable</strong>: declaración de renta,
        exógenas, prima de servicios, cesantías y más — con IA de apoyo y el
        escudo anti-fuga de datos.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-sky-400 hover:shadow"
          >
            <div className="text-2xl">{m.icono}</div>
            <h2 className="mt-2 font-semibold">{m.titulo}</h2>
            <p className="mt-1 text-sm text-slate-500">{m.texto}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h3 className="font-semibold">🛡️ ¿Cómo lo protegemos?</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li><strong>Sus datos no salen de su equipo:</strong> renta, nómina y exógenas se calculan en el navegador o en su servidor local.</li>
          <li><strong>Escudo anti-fuga:</strong> antes de enviar texto a la IA ocultamos cédulas, NITs, tarjetas, cuentas, correos, teléfonos y claves, y le mostramos qué se protegió.</li>
          <li><strong>Minimización</strong> (Ley 1581 de 2012): nunca enviamos más de lo necesario.</li>
        </ul>
      </div>
    </div>
  );
}
