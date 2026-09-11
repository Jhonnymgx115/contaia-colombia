// API del Asistente IA — multi-proveedor (Gemini, DeepSeek, OpenAI, Claude).
// Regla inquebrantable: NINGUNA pregunta sale sin pasar por el escudo
// anti-fuga; solo viaja la versión enmascarada.

import { NextResponse } from "next/server";
import { escanear } from "@/lib/seguridad/guardia";
import { preguntarProveedor, proveedoresDisponibles, PROVEEDORES } from "@/lib/ia/proveedores";

const SISTEMA_PROMPT = `Eres un asistente contable y tributario experto en la normativa colombiana:
Estatuto Tributario, normatividad DIAN, NIIF y Código Sustantivo del Trabajo.
Respondes en español claro y didáctico para contadores, citas la norma cuando la
conoces y adviertes cuando una cifra puede cambiar según resoluciones vigentes.
Nunca inventas artículos ni valores. No ofreces asesoría legal formal.`;

// Lista de proveedores y su disponibilidad (para el selector de la interfaz).
export async function GET() {
  const disponibles = proveedoresDisponibles();
  return NextResponse.json({
    proveedores: PROVEEDORES.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      web: p.web,
      disponible: disponibles.some((d) => d.id === p.id),
    })),
  });
}

export async function POST(request: Request) {
  const { pregunta, proveedor: proveedorSolicitado } = (await request.json()) as {
    pregunta?: string;
    proveedor?: string;
  };
  if (!pregunta?.trim()) {
    return NextResponse.json({ estado: "error", respuesta: "Pregunta vacía." }, { status: 400 });
  }

  const informe = escanear(pregunta);
  const preguntaSegura = informe.hayDatos ? informe.textoSeguro : pregunta;
  const informePublico = {
    textoSeguro: informe.textoSeguro,
    resumen: informe.resumen,
    hayDatos: informe.hayDatos,
  };

  const disponibles = proveedoresDisponibles();
  if (disponibles.length === 0) {
    return NextResponse.json({
      estado: "sin_configuracion",
      respuesta:
        "El asistente IA no está activado: configure la clave de al menos un proveedor " +
        "(variables GEMINI_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY o ANTHROPIC_API_KEY). " +
        "Los demás módulos funcionan sin conexión.",
      informe: informePublico,
    });
  }

  // Usa el proveedor pedido si está disponible; si no, el primero configurado.
  const elegido =
    disponibles.find((p) => p.id === proveedorSolicitado) ?? disponibles[0];

  try {
    const { respuesta, proveedor } = await preguntarProveedor(
      elegido.id,
      preguntaSegura,
      SISTEMA_PROMPT,
    );
    return NextResponse.json({
      estado: "ok",
      respuesta,
      proveedorUsado: proveedor.nombre,
      informe: informePublico,
    });
  } catch (e) {
    // Si el proveedor pedido falla, prueba con otro disponible.
    const alternativos = disponibles.filter((p) => p.id !== elegido.id);
    for (const alt of alternativos) {
      try {
        const { respuesta, proveedor } = await preguntarProveedor(
          alt.id,
          preguntaSegura,
          SISTEMA_PROMPT,
        );
        return NextResponse.json({
          estado: "ok",
          respuesta,
          proveedorUsado: `${proveedor.nombre} (respaldo: ${elegido.nombre} falló)`,
          informe: informePublico,
        });
      } catch {
        continue;
      }
    }
    return NextResponse.json({
      estado: "error",
      respuesta: `No se pudo contactar ningún proveedor de IA. Último error: ${
        e instanceof Error ? e.message : e
      }`,
      informe: informePublico,
    });
  }
}
