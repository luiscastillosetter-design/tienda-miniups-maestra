'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { siteConfig } from '@/config/site';

function TrackerLogic() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    // 1. Detección de Afiliado
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('todomax_ref', ref.toUpperCase().trim());
    }

    // 2. Detección de Campañas Publicitarias Pagadas
    const fbclid = searchParams.get('fbclid');
    const ttclid = searchParams.get('ttclid');
    const gclid = searchParams.get('gclid');
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');

    let detectedChannel = 'Directo';

    if (fbclid || utmSource?.toLowerCase().includes('facebook') || utmSource?.toLowerCase().includes('meta') || utmSource?.toLowerCase().includes('instagram')) {
      detectedChannel = 'Meta Ads';
    } else if (ttclid || utmSource?.toLowerCase().includes('tiktok')) {
      detectedChannel = 'TikTok Ads';
    } else if (gclid || utmSource?.toLowerCase().includes('google')) {
      detectedChannel = 'Google Ads';
    } else if (utmSource) {
      detectedChannel = `Campaña: ${utmSource}`;
    }

    // 3. Matriz de Atribución Limpia Anti-Duplicados
    const attributionData = {
      channel: detectedChannel,
      utmCampaign: utmCampaign || 'none',
      affiliateRef: ref ? ref.toUpperCase().trim() : (localStorage.getItem('todomax_ref') || 'DIRECTO'),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('todomax_attribution', JSON.stringify(attributionData));

    // 4. Disparo de Evento PageView en Meta Pixel (si está activo en window)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  const [pixelId, setPixelId] = useState<string>(siteConfig.metaPixelId || '');

  useEffect(() => {
    const localPixel = localStorage.getItem('todomax_meta_pixel');
    if (localPixel && localPixel !== 'TU_PIXEL_ID_AQUI') {
      setPixelId(localPixel);
    }

    fetch('/api/store?key=store_marketing_config')
      .then(res => res.json())
      .then(json => {
        if (json?.data?.metaPixelId && json.data.metaPixelId !== 'TU_PIXEL_ID_AQUI') {
          setPixelId(json.data.metaPixelId);
          localStorage.setItem('todomax_meta_pixel', json.data.metaPixelId);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Script Base Oficial de Meta Pixel (si el ID está configurado en siteConfig o Admin) */}
      {pixelId && pixelId !== 'TU_PIXEL_ID_AQUI' && (
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