'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import ProductCover from '@/components/ProductCover';
import Price from '@/components/Price';

const isVideo = (url?: string) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
};

interface ProductCardProps {
  product: Product;
  /** 'text' = botón "Comprar"; 'icon' = botón con bolsa */
  buyStyle?: 'text' | 'icon';
  /** Clases extra del contenedor (ej. snap-start h-full en los carruseles) */
  className?: string;
}

export default function ProductCard({ product, buyStyle = 'icon', className = '' }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [needSize, setNeedSize] = useState(false);

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [];

  // Sin selección: primer color con piezas (stock indefinido cuenta como disponible)
  const activeColor = colors.find((c) => c.name === pickedColor) || colors.find((c) => c.stock !== 0) || colors[0];
  const hasColorStock = typeof activeColor?.stock === 'number';
  const availableStock = hasColorStock ? (activeColor!.stock as number) : product.stock;
  const outOfStock = availableStock <= 0;
  // Foto del color elegido: solo se carga cuando el cliente hace clic (carga bajo demanda)
  const colorImage = pickedColor ? colors.find((c) => c.name === pickedColor)?.image : undefined;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    if (sizes.length > 0 && !pickedSize) {
      setNeedSize(true);
      return;
    }
    const firstValidImg = product.images?.find((img) => !isVideo(img)) || product.images?.[0] || '';
    addItem(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: colorImage || activeColor?.image || firstValidImg,
        stock: availableStock,
        selectedColor: activeColor?.name,
        selectedSize: sizes.length > 0 ? pickedSize || undefined : undefined,
      },
      1
    );
    router.push('/checkout');
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-2xl hover:shadow-slate-300/60 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer ${className}`}
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-slate-50/80 p-4 overflow-hidden">
        {colorImage ? (
          <img src={colorImage} alt={`${product.title} - ${pickedColor}`} className="w-full h-full object-contain" />
        ) : (
          <ProductCover images={product.images} title={product.title} />
        )}
        {outOfStock ? (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
            Agotado
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase text-orange-500 tracking-wider">{product.category}</span>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-orange-500 transition-colors mt-0.5">
              {product.title}
            </h3>
          </Link>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.stock === 0 ? `${c.name} (Agotado)` : c.name}
                  aria-label={`Color ${c.name}${c.stock === 0 ? ' agotado' : ''}`}
                  onClick={() => setPickedColor((prev) => (prev === c.name ? null : c.name))}
                  className={`relative w-5 h-5 rounded-full border-2 cursor-pointer transition-all overflow-hidden ${
                    c.stock === 0 ? 'opacity-40' : ''
                  } ${
                    pickedColor === c.name ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-300 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {c.stock === 0 && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="block w-[140%] h-px bg-red-600 rotate-45" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {hasColorStock && (
            <p className={`text-[10px] font-bold mt-1 ${outOfStock ? 'text-red-600 uppercase' : 'text-emerald-700'}`}>
              {outOfStock ? `Agotado${activeColor?.name ? ` (${activeColor.name})` : ''}` : `Disponible: ${availableStock}`}
            </p>
          )}

          {sizes.length > 0 && (
            <div
              role="group"
              aria-label="Tallas"
              className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5"
            >
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setPickedSize((prev) => (prev === s ? null : s));
                    setNeedSize(false);
                  }}
                  className={`shrink-0 min-w-[28px] px-1.5 h-6 rounded-md border text-[10px] font-bold cursor-pointer transition-colors ${
                    pickedSize === s
                      ? 'bg-slate-900 text-white border-slate-900'
                      : needSize
                        ? 'border-red-400 text-red-600 bg-red-50'
                        : 'border-slate-300 text-slate-700 hover:border-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {needSize && <p className="text-[10px] font-bold text-red-600 mt-1">Elige una talla</p>}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <Price value={product.price} original={product.originalPrice} className="text-base md:text-lg font-black text-slate-900" />
          {buyStyle === 'text' ? (
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              title={outOfStock ? 'Sin stock disponible' : 'Comprar'}
              className="bg-slate-900 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Agotado' : 'Comprar'}
            </button>
          ) : (
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              title={outOfStock ? 'Sin stock disponible' : 'Comprar ahora'}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 disabled:shadow-none transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-1 hover:shadow-orange-500/50 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
