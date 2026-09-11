// API de liquidaciones: guarda el resultado del cálculo en PostgreSQL y
// lista el historial. Nunca se aceptan datos personales — solo cifras.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { liquidar } from "@/lib/herramientas/renta";

export async function POST(request: Request) {
  try {
    const cuerpo = await request.json();
    const resultado = liquidar({
      ingresosTotales: Number(cuerpo.ingresosTotales),
      ingresosNoConstitutivos: Number(cuerpo.ingresosNoConstitutivos ?? 0),
      costosYDeducciones: Number(cuerpo.costosYDeducciones ?? 0),
      rentasExentas: Number(cuerpo.rentasExentas ?? 0),
      anio: Number(cuerpo.anio ?? 2025),
      esPersonaNatural: Boolean(cuerpo.esPersonaNatural ?? true),
      ingresosLaborales: cuerpo.ingresosLaborales != null ? Number(cuerpo.ingresosLaborales) : null,
    });

    const guardada = await prisma.liquidacionRenta.create({
      data: {
        anioGravable: resultado.anioGravable,
        esPersonaNatural: Boolean(cuerpo.esPersonaNatural ?? true),
        ingresosTotales: resultado.ingresosTotales,
        ingresosNoConstitutivos: resultado.ingresosNoConstitutivos,
        costosYDeducciones: resultado.costosYDeducciones,
        rentasExentas: resultado.rentasExentas,
        rentaLiquidaGravable: resultado.rentaLiquidaGravable,
        impuestoBasicoCop: resultado.impuestoBasicoCop,
        uvt: resultado.uvt,
      },
    });

    return NextResponse.json({ estado: "ok", id: guardada.id, resultado });
  } catch (e) {
    return NextResponse.json(
      { estado: "error", mensaje: e instanceof Error ? e.message : "Error inesperado" },
      { status: 400 },
    );
  }
}

export async function GET() {
  const historial = await prisma.liquidacionRenta.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ historial });
}
