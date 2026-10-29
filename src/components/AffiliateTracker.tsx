'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { siteConfig } from '@/config/site';

function TrackerLogic() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    // 1. Detección de código de afiliado
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('todomax_ref', ref.toUpperCase().trim());
    }

    // 2. Detección de parámetros de campañas publicitarias
    const fbclid = searchParams.get('fbclid');
    const ttclid = searchParams.get('ttclid');
    const gclid = searchParams.get('gclid');
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');

    const hasAdParam = !!(fbclid || ttclid || gclid || utmSource);

    // 3. Atribución inteligente: no sobrescribe canales pagados con 'Directo' en navegación interna
    if (hasAdParam) {
      let detectedChannel = 'Campaña';
      if (fbclid || utmSource?.toLowerCase().includes('facebook') || utmSource?.toLowerCase().includes('meta') || utmSource?.toLowerCase().includes('instagram')) {
        detectedChannel = 'Meta Ads';
      } else if (ttclid || utmSource?.toLowerCase().includes('tiktok')) {
        detectedChannel = 'TikTok Ads';
      } else if (gclid || utmSource?.toLowerCase().includes('google')) {
        detectedChannel = 'Google Ads';
      } else if (utmSource) {
        detectedChannel = `Campaña: ${utmSource}`;
      }

      const attributionData = {
        channel: detectedChannel,
        utmCampaign: utmCampaign || 'none',
        affiliateRef: ref ? ref.toUpperCase().trim() : (localStorage.getItem('todomax_ref') || 'DIRECTO'),
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem('todomax_attribution', JSON.stringify(attributionData));
    } else if (ref) {
      const existingAttributionStr = localStorage.getItem('todomax_attribution');
      let existingChannel = 'Afiliado';
      try {
        if (existingAttributionStr) {
          const parsed = JSON.parse(existingAttributionStr);
          if (parsed.channel && parsed.channel !== 'Directo') {
            existingChannel = parsed.channel;
          }
        }
      } catch (e) {}

      const attributionData = {
        channel: existingChannel,
        utmCampaign: 'none',
        affiliateRef: ref.toUpperCase().trim(),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('todomax_attribution', JSON.stringify(attributionData));
    } else {
      // Solo registra "Directo" si no existía ninguna atribución publicitaria previa
      const existing = localStorage.getItem('todomax_attribution');
      if (!existing) {
        const attributionData = {
          channel: 'Directo',
          utmCampaign: 'none',
          affiliateRef: localStorage.getItem('todomax_ref') || 'DIRECTO',
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('todomax_attribution', JSON.stringify(attributionData));
      }
    }

    // 4. Disparo de evento PageView
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  const [pixelId, setPixelId] = useState<string>('');

  // Validación estricta: solo permite identificadores numéricos de Pixel para evitar inyecciones XSS
  const isValidPixel = (id: string) => /^\d{5,25}$/.test(id.trim());

  useEffect(() => {
    const initialId = siteConfig.metaPixelId || '';
    if (isValidPixel(initialId)) {
      setPixelId(initialId.trim());
    }

    const localPixel = localStorage.getItem('todomax_meta_pixel');
    if (localPixel && isValidPixel(localPixel)) {
      setPixelId(localPixel.trim());
    }

    fetch('/api/store?key=store_marketing_config')
      .then(res => res.json())
      .then(json => {
        const fetchedId = json?.data?.metaPixelId;
        if (fetchedId && isValidPixel(fetchedId)) {
          setPixelId(fetchedId.trim());
          localStorage.setItem('todomax_meta_pixel', fetchedId.trim());
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {pixelId && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      <Suspense fallback={null}>
        <TrackerLogic />
      </Suspense>
    </>
  );
}