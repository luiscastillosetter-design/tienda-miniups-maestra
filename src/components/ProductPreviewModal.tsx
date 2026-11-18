'use client';

import { useState } from 'react';
import { X, ShoppingBag, ShoppingCart, Truck, CheckCircle2, ListChecks, Play } from 'lucide-react';
import { siteConfig } from '@/config/site';
import DescriptionContent from '@/components/DescriptionContent';
import Price from '@/components/Price';
import { useCurrencyStore } from '@/store/currencyStore';

export interface PreviewData {
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  description: string;
  features: string[];
  benefits: string[];
  badge?: string;
  images: string[];
  colors?: { name: string; hex: string }[];
}

interface Props {
  data: PreviewData;
  tasaBcv: number | null;
  isEditing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const isVideo = (url?: string) =>
  !!url && (url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video'));

function Media({ src, className }: { src: string; className: string }) {
  if (!src) return <div className={`${className} bg-slate-100`} />;
  return isVideo(src) ? (
    <video src={src} muted loop autoPlay playsInline className={className} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} />
  );
}

export default function ProductPreviewModal({ data, tasaBcv: tasaProp, isEditing, onClose, onConfirm }: Props) {
  const [view, setView] = useState<'card' | 'full'>('card');
  const tasaGlobal = useCurrencyStore((s) => s.tasaBcv);
  const tasaBcv = tasaGlobal ?? tasaProp;
  const [imgIdx, setImgIdx] = useState(0);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const colors = data.colors ?? [];
  const activeColor = colors.find(c => c.name === pickedColor) || colors[0];

  const cover = data.images[0] || '';
  const current = data.images[imgIdx] || cover;
  const outOfStock = data.stock <= 0;
  const descuento =
    data.originalPrice && data.originalPrice > data.price
      ? Math.round((1 - data.price / data.originalPrice) * 100)
      : 0;
  const bs = tasaBcv ? (data.price * tasaBcv).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;

  const precio = (
    <div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <Price value={data.price} className="text-lg md:text-xl font-black text-slate-900" />
        {data.originalPrice ? (
          <span className="text-xs text-gray-400 line-through">
            <Price value={data.originalPrice} />
          </span>
        ) : null}
        {descuento > 0 && (
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">-{descuento}%</span>
        )}
      </div>
      {bs && <span className="text-[11px] text-slate-500 font-semibold">≈ Bs. {bs}</span>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between gap-3 p-4 md:p-5 border-b">
          <div>
            <h3 className="text-base font-black text-slate-900">Vista Previa del Producto</h3>
            <p className="text-[11px] text-slate-500">Aún no está publicado. Así se verá en la tienda.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-4 md:px-5 pt-3">
          {([
            ['card', 'Cómo se verá en Tarjeta (Portada / Catálogo)'],
            ['full', 'Cómo se verá en la Ficha Completa (/product/...)'],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setView(k)}
              className={`px-3 py-2 rounded-xl text-[11px] md:text-xs font-bold cursor-pointer ${
                view === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-slate-50 mt-3">
          {view === 'card' ? (
            <div className="flex flex-wrap justify-center gap-6">
              {/* Tarjeta Portada (Más Vendidos) */}
              <div className="w-[260px] bg-white rounded-3xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
                <div className="relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                  <Media src={cover} className="w-full h-full object-contain" />
                  {outOfStock ? (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">Agotado</span>
                  ) : data.badge ? (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">{data.badge}</span>
                  ) : null}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-orange-500 tracking-wider">{data.category}</span>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 mt-0.5">{data.title}</h3>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {precio}
                    <span className="bg-orange-500 text-white px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta Catálogo */}
              <div className="w-[260px] bg-white rounded-3xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden">
                <div className="relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
                  <Media src={cover} className="w-full h-full object-contain" />
                  {outOfStock ? (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Agotado</span>
                  ) : data.badge ? (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">{data.badge}</span>
                  ) : null}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400">{data.category}</span>
                    <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2">{data.title}</h3>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    {precio}
                    <span className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md">
                      {outOfStock ? 'Agotado' : 'Comprar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-5 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
              <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 self-start md:sticky md:top-6">
                {data.images.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[420px] pb-2 md:pb-0">
                    {data.images.map((m, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 overflow-hidden bg-slate-50 flex-shrink-0 cursor-pointer ${
                          imgIdx === i ? 'border-orange-500 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isVideo(m) ? (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m} alt="" className="w-full h-full object-contain p-1" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative flex-1 aspect-square md:min-h-[420px] bg-slate-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center p-6">
                  {isVideo(current) ? (
                    <video src={current} controls muted loop className="w-full h-full object-contain rounded-2xl" />
                  ) : current ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current} alt={data.title} className="w-full h-full object-contain" />
                  ) : null}
                  {data.badge && (
                    <span className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-xl uppercase shadow-md">{data.badge}</span>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-orange-50 text-orange-600 font-black text-xs px-3 py-1 rounded-lg uppercase">{data.category}</span>
                  <span className={`font-bold text-xs px-3 py-1 rounded-lg ${outOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                    {outOfStock ? '✕ Agotado' : `✓ Stock: ${data.stock} disponibles`}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{data.title}</h1>

                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <Price value={data.price} showSecondary secondaryClassName="text-xs mt-0.5" className="text-3xl md:text-4xl font-black text-slate-900" />
                    {data.originalPrice ? (
                      <span className="text-lg text-gray-400 line-through"><Price value={data.originalPrice} /></span>
                    ) : null}
                    {descuento > 0 && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">-{descuento}%</span>
                    )}
                  </div>
                  {bs && <p className="text-sm font-bold text-slate-600">≈ Bs. {bs} (Tasa BCV)</p>}
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    {data.price >= siteConfig.shipping.freeShippingThreshold
                      ? '¡Califica para ENVÍO GRATIS a todo el país!'
                      : `Agrega ${siteConfig.currencySymbol}${(siteConfig.shipping.freeShippingThreshold - data.price).toFixed(2)} más para envío gratis.`}
                  </p>
                </div>

                {data.description && (
                  <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-2">
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Descripción del Producto</h3>
                    <DescriptionContent description={data.description} className="text-xs md:text-sm text-slate-700 leading-relaxed" />
                  </div>
                )}

                {data.benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-slate-900 tracking-wider">Beneficios destacados:</p>
                    {data.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-white p-2.5 rounded-xl border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {data.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-orange-500" /> Especificaciones Técnicas:
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                      {data.features.map((f, i) => (
                        <div key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                          <span className="text-orange-500 font-black">•</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {colors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-700">Color: {activeColor?.name}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {colors.map(c => (
                          <button
                            key={c.name}
                            type="button"
                            title={c.name}
                            aria-label={`Color ${c.name}`}
                            onClick={() => setPickedColor(c.name)}
                            className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all ${
                              activeColor?.name === c.name ? 'border-orange-500 ring-2 ring-orange-300 scale-110' : 'border-slate-300'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <span className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl text-xs flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Agregar al Carrito
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 md:p-5 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs cursor-pointer"
          >
            {isEditing ? 'Confirmar y Guardar Cambios' : 'Confirmar y Guardar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}
