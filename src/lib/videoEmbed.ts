/** Convierte un enlace de video (YouTube/Shorts/TikTok/Instagram) en URL embebible. Devuelve null si es video directo o desconocido. */
export function getVideoEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith('youtube.com')) {
      const shorts = u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/);
      if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (host.endsWith('tiktok.com')) {
      const m = u.pathname.match(/\/video\/(\d+)/);
      if (m) return `https://www.tiktok.com/embed/v2/${m[1]}`;
    }
    if (host.endsWith('instagram.com')) {
      const m = u.pathname.match(/\/(p|reel|reels|tv)\/([\w-]+)/);
      if (m) return `https://www.instagram.com/${m[1] === 'reels' ? 'reel' : m[1]}/${m[2]}/embed`;
    }
  } catch {
    return null;
  }
  return null;
}

export const isDirectVideoUrl = (url?: string) => !!url && /\.(mp4|webm)(\?|$)/i.test(url);
