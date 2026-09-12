// Webhook de Formplus → ContaIA Colombia.
//
// VERIFICACIÓN DE VIABILIDAD (2026-09): Formplus NO ofrece una API REST
// pública para consultar formularios (su documentación no publica endpoints
// y su integración oficial es vía Zapier). La vía soportada son los
// WEBHOOKS: Formplus envía cada respuesta del formulario por POST a esta
// URL, y ContaIA la convierte en una liquidación guardada.
//
// Configuración en Formplus: Form → Settings → Integrations → Webhooks →
//   URL: https://SU-DOMINIO/api/formplus/webhook
//   (y defina FORMPLUS_SECRETO en .env.local para validar la firma/envío)
//
// El formulario debe tener campos cuyo nombre (label) contenga:
//   "ingresos" (obligatorio), y opcionalmente "no constitutivos",
//   "costos", "exentas", "anio", "tipo" (natural/juridica).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { liquidar } from "@/lib/herramientas/renta";
import { escanear } from "@/lib/seguridad/guardia";

type CampoFormplus = { label?: string; name?: string; value?: unknown };

function buscarCampo(campos: CampoFormplus[], palabras: string[]): unknown {
  const c = campos.find((campo) => {
    const texto = `${campo.label ?? ""} ${campo.name ?? ""}`.toLowerCase();
    return palabras.some((p) => texto.includes(p));
  });
  return c?.value;
}

export async function POST(request: Request) {
  const secreto = process.env.FORMPLUS_SECRETO;
  if (secreto && request.headers.get("x-contaia-secreto") !== secreto) {
    return NextResponse.json({ estado: "rechazado" }, { status: 401 });
  }

  let cuerpo: { campos?: CampoFormplus[]; [k: string]: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ estado: "error", mensaje: "JSON inválido" }, { status: 400 });
  }

  // Formplus envía estructuras distintas según el tipo de campo; aceptamos
  // un arreglo "campos" [{label, value}] o un objeto plano clave→valor.
  const planos: CampoFormplus[] = Array.isArray(cuerpo.campos)
    ? cuerpo.campos
    : Object.entries(cuerpo).map(([k, v]) => ({ name: k, value: v }));

  const ingresos = Number(buscarCampo(planos, ["ingresos", "ingresos totales"]));
  if (!ingresos || ingresos <= 0) {
    return NextResponse.json({
      estado: "ignorado",
      mensaje: "La respuesta no trae un campo «ingresos» utilizable.",
    });
  }

  // Escudo anti-fuga también sobre los datos del formulario: si un campo
  // trae documentos de identidad, nunca se registran en la base.
  const textoFormulario = JSON.stringify(cuerpo);
  const escaneo = escanear(textoFormulario);

  const anio = Number(buscarCampo(planos, ["año gravable", "anio"])) || 2025;
  const tipoTexto = String(buscarCampo(planos, ["tipo", "persona"]) ?? "natural").toLowerCase();
  const esNatural = !tipoTexto.includes("jur");

  const resultado = liquidar({
    ingresosTotales: ingresos,
    ingresosNoConstitutivos: Number(buscarCampo(planos, ["no constitutivos"])) || 0,
    costosYDeducciones: Number(buscarCampo(planos, ["costos", "deducciones"])) || 0,
    rentasExentas: Number(buscarCampo(planos, ["exentas", "exoneradas"])) || 0,
    anio,
    esPersonaNatural: esNatural,
    ingresosLaborales: esNatural ? ingresos : null,
  });

  const guardada = await prisma.liquidacionRenta.create({
    data: {
      anioGravable: resultado.anioGravable,
      esPersonaNatural: esNatural,
      ingresosTotales: resultado.ingresosTotales,
      ingresosNoConstitutivos: resultado.ingresosNoConstitutivos,
      costosYDeducciones: resultado.costosYDeducciones,
      rentasExentas: resultado.rentasExentas,
      rentaLiquidaGravable: resultado.rentaLiquidaGravable,
      impuestoBasicoCop: resultado.impuestoBasicoCop,
      uvt: resultado.uvt,
    },
  });

  return NextResponse.json({
    estado: "ok",
    id: guardada.id,
    impuestoBasicoCop: Math.round(resultado.impuestoBasicoCop),
    datosProtegidosPorEscudo: escaneo.totalDatosProtegidos,
  });
}
