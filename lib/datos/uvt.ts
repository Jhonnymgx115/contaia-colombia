// Valores de la UVT (Unidad de Valor Tributario) por año gravable, en COP.
// La UVT la fija cada año la DIAN (www.dian.gov.co — "UVT año en curso").
export const UVT_POR_ANIO: Record<number, number> = {
  2022: 42_000,
  2023: 42_412,
  2024: 47_065,
  2025: 49_799,
  // 2026: pendiente de publicación oficial (suele anunciarse en noviembre).
};

const ULTIMO_ANIO = Math.max(...Object.keys(UVT_POR_ANIO).map(Number));

export function uvt(anio: number): number {
  return UVT_POR_ANIO[anio] ?? UVT_POR_ANIO[ULTIMO_ANIO];
}

export function aniosDisponibles(): number[] {
  return Object.keys(UVT_POR_ANIO).map(Number).sort((a, b) => b - a);
}
