'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function TrackerLogic() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      // Usamos 'todomax_ref' para que coincida perfectamente con tu página de pago
      localStorage.setItem('todomax_ref', ref.toUpperCase());
    }
  }, [searchParams]);

  return null;
}

export default function AffiliateTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerLogic />
    </Suspense>
  );
}