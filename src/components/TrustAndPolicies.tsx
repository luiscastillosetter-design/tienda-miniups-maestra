'use client';

import { useState, useEffect } from 'react';
import { Truck, ShieldCheck, FileText, Lock, X, ChevronRight, CheckCircle2 } from 'lucide-react';

export interface PolicyData {
  title: string;
  badge: string;
  content: string;
}

export interface StorePolicies {
  shipping: PolicyData;
  warranty: PolicyData;
  terms: PolicyData;
  privacy: PolicyData;
}

export const defaultPolicies: StorePolicies = {
  shipping: {
    title: 'Envíos y Entregas',
    badge: 'MRW, Zoom, Tealca y Barinas',
    content: `Cobertura y Métodos de Envío:
Realizamos despachos a todo el territorio nacional a través de las principales empresas de encomienda: MRW, Zoom y Tealca. Todos los envíos nacionales viajan con número de guía rastreable proporcionado a través de WhatsApp una vez procesado el paquete.

Entregas en Barinas:
Para clientes ubicados en la ciudad de Barinas, contamos con servicio de Retiro en Tienda / Entrega Personal previa coordinación, así como delivery local en zonas céntricas.

Tiempos de Procesamiento:
Los pedidos se procesan y despachan en un lapso de 24 a 48 horas hábiles tras la verificación y aprobación definitiva del pago. El tiempo de tránsito posterior depende directamente de la empresa de encomienda seleccionada (habitualmente entre 24 y 72 horas).

Condiciones de Envío Gratis:
Las promociones de envío gratis aplican exclusivamente para compras que alcancen o superen el monto mínimo estipulado en la plataforma y bajo las empresas de encomienda habilitadas para dicha promoción.`,
  },
  warranty: {
    title: 'Cambios y Reembolsos',
    badge: 'Garantía directa de importadora',
    content: `Garantía por Defecto de Fábrica:
En Importadora TodoMax respaldamos la calidad de nuestros productos. Todos nuestros artículos cuentan con un período de garantía de 7 a 15 días continuos (a partir de la fecha de recepción) exclusivamente por defectos atribuibles a fabricación o fallas electrónicas de origen.

Condiciones para Cambios:
• El producto debe devolverse en su empaque original, con todos sus manuales, cables y accesorios completos.
• No se aceptan cambios ni garantías por productos con golpes, humedad, sobrecargas eléctricas externas, signos de manipulación o uso indebido.

Procedimiento de Reemplazo:
Tras recibir y validar el estado del artículo en nuestro centro de revisión, se procederá al reemplazo por una unidad nueva. En caso de no contar con inventario disponible para reemplazo, se acordará el cambio por otro artículo de igual valor o el reembolso correspondiente vía Pago Móvil o Zelle.`,
  },
  terms: {
    title: 'Términos del Servicio',
    badge: 'Condiciones de compra y pago',
    content: `Validación de Pedidos y Pagos:
Toda orden generada a través de la tienda web queda en estatus "Pendiente de Verificación" hasta que nuestro equipo confirme la disponibilidad real de los fondos en las cuentas bancarias oficiales (Pago Móvil, Transferencia, Zelle o Binance Pay).

Disponibilidad de Inventario:
Los precios y el stock mostrado en la plataforma se actualizan en tiempo real. En caso de que se presente una discrepancia de inventario por alta demanda simultánea, el cliente será notificado de inmediato para ofrecerle una alternativa inmediata o la anulación de la orden.

Responsabilidad en Tránsito:
Una vez que el paquete es entregado en la agencia de encomiendas (MRW, Zoom, Tealca) y se genera la guía de despacho, la custodia y tiempos de traslado son responsabilidad de la empresa de transporte. TodoMax asiste al cliente con la información requerida ante cualquier reclamo logístico.`,
  },
  privacy: {
    title: 'Política de Privacidad',
    badge: 'Protección de datos 100% segura',
    content: `Confidencialidad:
En Importadora TodoMax garantizamos la estricta reserva de la información suministrada por nuestros clientes (nombres, cédula/RIF, teléfonos, dirección y comprobantes de pago).

Uso Exclusivo:
Sus datos personales se utilizan única y exclusivamente para:
1. Validar la procedencia de los pagos.
2. Rotular las guías oficiales de despacho y facturación.
3. Enviar notificaciones sobre el estado de su orden vía WhatsApp.

Bajo ninguna circunstancia vendemos, alquilamos ni compartimos bases de datos con terceros.`,
  },
};

export default function TrustAndPolicies() {
  const [policies, setPolicies] = useState<StorePolicies>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('store_policies');
        if (local) return { ...defaultPolicies, ...JSON.parse(local) };
      } catch (_) {}
    }
    return defaultPolicies;
  });

  const [activePolicyKey, setActivePolicyKey] = useState<keyof StorePolicies | null>(null);

  useEffect(() => {
    fetch(`/api/store?key=store_policies&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          const merged = { ...defaultPolicies, ...json.data };
          setPolicies(merged);
          try {
            localStorage.setItem('store_policies', JSON.stringify(merged));
          } catch (_) {}
        }
      })
      .catch(() => {});

    // Escuchador para abrir el modal desde enlaces externos (como el Footer)
    const handleOpenPolicy = (e: any) => {
      if (e.detail && policies[e.detail as keyof StorePolicies]) {
        setActivePolicyKey(e.detail as keyof StorePolicies);
      }
    };
    window.addEventListener('open-policy', handleOpenPolicy);
    return () => window.removeEventListener('open-policy', handleOpenPolicy);
  }, []);

  const items = [
    {
      key: 'shipping' as keyof StorePolicies,
      icon: Truck,
      bgIcon: 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white',
      title: policies.shipping.title,
      badge: policies.shipping.badge,
    },
    {
      key: 'warranty' as keyof StorePolicies,
      icon: ShieldCheck,
      bgIcon: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      title: policies.warranty.title,
      badge: policies.warranty.badge,
    },
    {
      key: 'terms' as keyof StorePolicies,
      icon: FileText,
      bgIcon: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      title: policies.terms.title,
      badge: policies.terms.badge,
    },
    {
      key: 'privacy' as keyof StorePolicies,
      icon: Lock,
      bgIcon: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      title: policies.privacy.title,
      badge: policies.privacy.badge,
    },
  ];

  const activePolicy = activePolicyKey ? policies[activePolicyKey] : null;

  return (
    <>
      <section className="w-full bg-white rounded-3xl p-6 md:p-10 border border-gray-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePolicyKey(item.key)}
                className="flex items-center gap-4 text-left p-3 -m-3 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100"
              >
                <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 flex-shrink-0 ${item.bgIcon}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-500 transition-colors flex items-center gap-1">
                    <span>{item.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                  </h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{item.badge}</p>
                  <span className="text-[10px] font-bold text-orange-600/80 group-hover:text-orange-600 mt-1 inline-block underline underline-offset-2">
                    Leer detalles
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Modal Emergente Dinámico */}
      {activePolicy && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                  {activePolicyKey === 'shipping' && <Truck className="w-5 h-5" />}
                  {activePolicyKey === 'warranty' && <ShieldCheck className="w-5 h-5" />}
                  {activePolicyKey === 'terms' && <FileText className="w-5 h-5" />}
                  {activePolicyKey === 'privacy' && <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{activePolicy.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{activePolicy.badge}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicyKey(null)}
                className="p-2 text-gray-400 hover:text-slate-800 rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con formateo dinámico */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
              {activePolicy.content}
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Importadora TodoMax • Información Oficial
              </span>
              <button
                type="button"
                onClick={() => setActivePolicyKey(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}