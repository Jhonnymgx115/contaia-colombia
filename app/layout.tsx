import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContaIA Colombia",
  description:
    "Asistente contable con IA para contadores colombianos — renta, exógenas, prima de servicios, calendario DIAN y escudo anti-fuga de datos.",
};

const PAGINAS = [
  { href: "/", titulo: "Inicio", icono: "🏠" },
  { href: "/renta", titulo: "Liquidador de Renta", icono: "🧾" },
  { href: "/exogenas", titulo: "Validador de Exógenas", icono: "📊" },
  { href: "/nomina", titulo: "Nómina y Prestaciones", icono: "💰" },
  { href: "/calendario", titulo: "Calendario Tributario", icono: "📅" },
  { href: "/historial", titulo: "Historial (PostgreSQL)", icono: "🗂️" },
  { href: "/asistente", titulo: "Asistente IA", icono: "🤖" },
  { href: "/guia", titulo: "Guía Rápida", icono: "📖" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-5">
            <h1 className="text-lg font-bold">🇨🇴 ContaIA Colombia</h1>
            <p className="mt-1 text-xs text-slate-500">
              Hecho para contadores, no para ingenieros.
            </p>
            <nav className="mt-5 flex flex-col gap-1">
              {PAGINAS.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {p.icono} {p.titulo}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 text-[11px] leading-4 text-slate-400">
              <p>🛡️ Los cálculos se hacen en su equipo. Antes de enviar algo a la IA, el escudo anti-fuga oculta sus datos sensibles.</p>
              <p className="mt-2">⚠️ Herramienta de apoyo didáctico. No reemplaza el criterio profesional del contador público.</p>
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
