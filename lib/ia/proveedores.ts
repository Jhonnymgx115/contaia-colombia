// Capa multi-proveedor de IA de ContaIA Colombia.
// Cada proveedor implementa la misma interfaz y SIEMPRE se usa junto al
// escudo anti-fuga (el texto que llega aquí ya viene enmascarado).

export type ProveedorId = "openai" | "anthropic" | "gemini" | "deepseek";

export type ProveedorInfo = {
  id: ProveedorId;
  nombre: string;
  variableClave: string;
  modeloPorDefecto: string;
  web: string;
};

export const PROVEEDORES: ProveedorInfo[] = [
  { id: "gemini", nombre: "Google Gemini", variableClave: "GEMINI_API_KEY", modeloPorDefecto: "gemini-2.0-flash", web: "aistudio.google.com" },
  { id: "deepseek", nombre: "DeepSeek", variableClave: "DEEPSEEK_API_KEY", modeloPorDefecto: "deepseek-chat", web: "platform.deepseek.com" },
  { id: "openai", nombre: "OpenAI", variableClave: "OPENAI_API_KEY", modeloPorDefecto: "gpt-4o-mini", web: "platform.openai.com" },
  { id: "anthropic", nombre: "Anthropic Claude", variableClave: "ANTHROPIC_API_KEY", modeloPorDefecto: "claude-3-5-haiku-20241022", web: "console.anthropic.com" },
];

export function proveedorPorId(id: string): ProveedorInfo | undefined {
  return PROVEEDORES.find((p) => p.id === id);
}

/** Proveedores configurados según las variables de entorno presentes. */
export function proveedoresDisponibles(env: Record<string, string | undefined> = process.env): ProveedorInfo[] {
  return PROVEEDORES.filter((p) => {
    const clave = env[p.variableClave];
    return Boolean(clave && clave.trim() && clave !== "tu-clave-aqui");
  });
}

export type LlamadaIA = {
  preguntaSegura: string;
  sistema: string;
  proveedor: ProveedorInfo;
  clave: string;
  modelo: string;
};

async function llamadaOpenAICompatible(ll: LlamadaIA, baseUrl: string): Promise<string> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${ll.clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ll.modelo,
      messages: [
        { role: "system", content: ll.sistema },
        { role: "user", content: ll.preguntaSegura },
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function llamar(ll: LlamadaIA): Promise<string> {
  switch (ll.proveedor.id) {
    case "openai":
      return llamadaOpenAICompatible(ll, "https://api.openai.com/v1/chat/completions");

    // DeepSeek usa la API de OpenAI como estándar (documentación oficial).
    case "deepseek":
      return llamadaOpenAICompatible(ll, "https://api.deepseek.com/chat/completions");

    case "anthropic": {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ll.clave,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: ll.modelo,
          max_tokens: 1024,
          system: ll.sistema,
          messages: [{ role: "user", content: ll.preguntaSegura }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      return data.content[0].text;
    }

    case "gemini": {
      const modelo = ll.modelo;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "x-goog-api-key": ll.clave, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ll.sistema }] },
          contents: [{ role: "user", parts: [{ text: ll.preguntaSegura }] }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      const texto = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
      if (!texto) throw new Error("Gemini no devolvió contenido.");
      return texto;
    }
  }
}

export async function preguntarProveedor(
  proveedorId: string,
  preguntaSegura: string,
  sistema: string,
): Promise<{ respuesta: string; proveedor: ProveedorInfo }> {
  const info = proveedorPorId(proveedorId);
  if (!info) throw new Error(`Proveedor desconocido: ${proveedorId}`);

  const clave = process.env[info.variableClave]?.trim();
  if (!clave || clave === "tu-clave-aqui") {
    throw new Error(`Falta la clave de ${info.nombre} (variable ${info.variableClave}).`);
  }

  const modelo = modeloDe(info.id);
  const respuesta = await llamar({ preguntaSegura, sistema, proveedor: info, clave, modelo });
  return { respuesta, proveedor: info };
}

export function modeloDe(proveedorId: ProveedorId): string {
  const info = proveedorPorId(proveedorId)!;
  const porEntorno: Record<ProveedorId, string | undefined> = {
    openai: process.env.OPENAI_MODELO,
    anthropic: process.env.ANTHROPIC_MODELO,
    gemini: process.env.GEMINI_MODELO,
    deepseek: process.env.DEEPSEEK_MODELO,
  };
  return porEntorno[proveedorId]?.trim() || info.modeloPorDefecto;
}
