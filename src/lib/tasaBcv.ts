interface Fuente {
  url: string;
  extraer: (json: any) => { tasa: number; fecha: string | null };
}

const FUENTES: Fuente[] = [
  {
    url: 'https://ve.dolarapi.com/v1/dolares/oficial',
    extraer: (j) => ({ tasa: Number(j?.promedio ?? j?.venta), fecha: j?.fechaActualizacion ?? null }),
  },
  {
    url: 'https://pydolarve.org/api/v1/dollar?page=bcv&monitor=usd',
    extraer: (j) => ({ tasa: Number(j?.price), fecha: j?.last_update ?? null }),
  },
];

/** Tasa oficial BCV con fallback y caché de 15 minutos. Devuelve null si ninguna fuente responde. */
export async function obtenerTasaBcv(): Promise<{ tasa: number; fechaActualizacion: string } | null> {
  for (const fuente of FUENTES) {
    try {
      const res = await fetch(fuente.url, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const { tasa, fecha } = fuente.extraer(await res.json());
      if (Number.isFinite(tasa) && tasa > 0) {
        return { tasa, fechaActualizacion: fecha || new Date().toISOString() };
      }
    } catch {
      // intenta con la siguiente fuente
    }
  }
  return null;
}
