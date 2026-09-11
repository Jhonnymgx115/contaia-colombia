// Escudo anti-fuga de datos — portado del módulo Python.
// Detecta y enmascara datos sensibles colombianos antes de enviar texto
// a un servicio de IA (Ley 1581 de 2012 — minimización).

export type Hallazgo = { categoria: string; cantidad: number; descripcion: string };

export type InformeEscaneo = {
  textoOriginal: string;
  textoSeguro: string;
  hallazgos: Hallazgo[];
  totalDatosProtegidos: number;
  hayDatos: boolean;
  nivelRiesgo: string;
  resumen: string;
};

function mascaraDigitos(valor: string, visiblesFinal = 3): string {
  const solo = valor.replace(/\D/g, "");
  if (solo.length <= visiblesFinal) return "*".repeat(valor.length);
  const prefijoLen = Math.max(valor.length - solo.length + visiblesFinal, 1);
  const prefijo = valor.slice(0, prefijoLen);
  return prefijo + "*".repeat(Math.max(valor.length - prefijo.length, 3));
}

function mascaraCorreo(valor: string): string {
  const [usuario, dominio] = valor.split("@");
  const oculto =
    usuario.length <= 2 ? usuario[0] + "*" : usuario.slice(0, 2) + "*".repeat(Math.max(usuario.length - 2, 3));
  return `${oculto}@${dominio}`;
}

const mascaraTotal = (v: string) => "*".repeat(v.length);

type Patron = {
  categoria: string;
  regex: RegExp;
  descripcion: string;
  mascara: (v: string) => string;
  conGrupo?: boolean;
};

const PATRONES: Patron[] = [
  {
    categoria: "Clave operativa (CLP)",
    regex: /(clave|clp|token|contrase[ñn]a|password)\s*[:=]?\s*(\S{6,32})/gi,
    descripcion: "Claves o tokens escritos en el texto.",
    mascara: mascaraTotal,
    conGrupo: true,
  },
  {
    categoria: "Tarjeta / cuenta bancaria",
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/g,
    descripcion: "Números que corresponden a tarjetas Visa/Mastercard/Amex.",
    mascara: mascaraDigitos,
  },
  {
    categoria: "Cuenta bancaria con etiqueta",
    regex:
      /(cuenta\s+(?:de\s+)?(?:ahorros|corriente)|cuenta\s+bancaria|nequi|daviplata|bancolombia|davivienda|bbva|banco(?:lombia)?)\s*(?:n[úu]mero|nro|no\.?)?\s*[:=]?\s*(\d{8,17})/gi,
    descripcion: "Números de cuenta o billetera digital con etiqueta en el texto.",
    mascara: mascaraDigitos,
    conGrupo: true,
  },
  {
    categoria: "NIT con dígito de verificación",
    regex: /\b\d{3}\.?\d{3}\.?\d{3}-\d\b/g,
    descripcion: "NITs colombianos (formato con guión y DV).",
    mascara: mascaraDigitos,
  },
  {
    categoria: "Documento con separador de miles",
    regex: /\b\d{1,3}(?:\.\d{3}){2,3}\b/g,
    descripcion: "Números con separador de miles (cédulas o NITs escritos como 1.023.456.789).",
    mascara: mascaraDigitos,
  },
  {
    categoria: "Cédula / identificación",
    regex: /(c[ée]dula|cc|identificaci[óo]n|nit)\s*[:\.]?\s*(\d{5,10})/gi,
    descripcion: "Documentos de identidad con etiqueta en el texto.",
    mascara: mascaraDigitos,
    conGrupo: true,
  },
  {
    categoria: "Correo electrónico",
    regex: /[\w\.\-+]+@[\w\-]+\.[\w\.]{2,}/g,
    descripcion: "Correos electrónicos.",
    mascara: mascaraCorreo,
  },
  {
    categoria: "Teléfono / celular",
    regex: /(?:\+?57[\s\-]?)?3\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b/g,
    descripcion: "Celulares colombianos (empiezan por 3 y tienen 10 dígitos).",
    mascara: mascaraDigitos,
  },
  {
    categoria: "Dirección IP",
    regex:
      /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g,
    descripcion: "Direcciones IP que podrían identificar equipos.",
    mascara: mascaraTotal,
  },
];

export function escanear(texto: string): InformeEscaneo {
  let textoSeguro = texto;
  const hallazgos: Hallazgo[] = [];
  let total = 0;

  for (const p of PATRONES) {
    p.regex.lastIndex = 0;
    const coincidencias = [...texto.matchAll(p.regex)];
    if (!coincidencias.length) continue;
    for (const m of coincidencias) {
      const dato = p.conGrupo && m[2] ? m[2] : m[0];
      textoSeguro = textoSeguro.split(dato).join(p.mascara(dato));
    }
    hallazgos.push({
      categoria: p.categoria,
      cantidad: coincidencias.length,
      descripcion: p.descripcion,
    });
    total += coincidencias.length;
  }

  const financieros = hallazgos
    .filter((h) => h.categoria.includes("Tarjeta") || h.categoria.includes("Cuenta") || h.categoria.includes("Clave"))
    .reduce((s, h) => s + h.cantidad, 0);
  const nivelRiesgo = total === 0
    ? "🟢 Sin datos sensibles detectados"
    : financieros
      ? "🔴 Alto — se detectaron datos financieros"
      : "🟡 Medio — se detectaron datos personales";

  const lineas: string[] = [];
  if (!total) {
    lineas.push("El escudo no encontró datos sensibles: el texto puede enviarse tal como está.");
  } else {
    lineas.push(`Nivel de riesgo: ${nivelRiesgo}`, "");
    for (const h of hallazgos)
      lineas.push(`• ${h.categoria}: ${h.cantidad} detectado(s). ${h.descripcion}`);
    lineas.push("", "Todos los datos anteriores fueron OCULTADOS automáticamente.");
  }

  return {
    textoOriginal: texto,
    textoSeguro,
    hallazgos,
    totalDatosProtegidos: total,
    hayDatos: total > 0,
    nivelRiesgo,
    resumen: lineas.join("\n"),
  };
}
