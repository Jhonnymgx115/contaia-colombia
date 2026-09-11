// Ruta de API del Asistente IA — SIEMPRE pasa la pregunta por el escudo
// anti-fuga antes de enviarla al proveedor externo.

import { NextResponse } from "next/server";
import { escanear } from "@/lib/seguridad/guardia";

const SISTEMA_PROMPT = `Eres un asistente contable y tributario experto en la normativa colombiana:
Estatuto Tributario, normatividad DIAN, NIIF y Código Sustantivo del Trabajo.
Respondes en español claro y didáctico para contadores, citas la norma cuando la
conoces y adviertes cuando una cifra puede cambiar según resoluciones vigentes.
Nunca inventas artículos ni valores. No ofreces asesoría legal formal.`;

export async function POST(request: Request) {
  const { pregunta } = (await request.json()) as { pregunta?: string };
  if (!pregunta?.trim()) {
    return NextResponse.json({ estado: "error", respuesta: "Pregunta vacía." }, { status: 400 });
  }

  const informe = escanear(pregunta);
  const preguntaSegura = informe.hayDatos ? informe.textoSeguro : pregunta;

  const clave = process.env.IA_API_KEY;
  const proveedor = (process.env.IA_PROVEEDOR ?? "openai").toLowerCase();

  if (!clave) {
    return NextResponse.json({
      estado: "sin_configuracion",
      respuesta:
        "El asistente IA no está activado: falta la clave de API (variable IA_API_KEY en .env.local). " +
        "Los demás módulos funcionan sin conexión.",
      informe: { textoSeguro: informe.textoSeguro, resumen: informe.resumen, hayDatos: informe.hayDatos },
    });
  }

  try {
    let texto: string;
    if (proveedor === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": clave,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.IA_MODELO ?? "claude-3-5-haiku-20241022",
          max_tokens: 1024,
          system: SISTEMA_PROMPT,
          messages: [{ role: "user", content: preguntaSegura }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic respondió ${res.status}`);
      const data = await res.json();
      texto = data.content[0].text;
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.IA_MODELO ?? "gpt-4o-mini",
          messages: [
            { role: "system", content: SISTEMA_PROMPT },
            { role: "user", content: preguntaSegura },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI respondió ${res.status}`);
      const data = await res.json();
      texto = data.choices[0].message.content;
    }

    return NextResponse.json({
      estado: "ok",
      respuesta: texto,
      informe: { textoSeguro: informe.textoSeguro, resumen: informe.resumen, hayDatos: informe.hayDatos },
    });
  } catch (e) {
    return NextResponse.json({
      estado: "error",
      respuesta: `No se pudo contactar el servicio de IA: ${e instanceof Error ? e.message : e}`,
      informe: { textoSeguro: informe.textoSeguro, resumen: informe.resumen, hayDatos: informe.hayDatos },
    });
  }
}
