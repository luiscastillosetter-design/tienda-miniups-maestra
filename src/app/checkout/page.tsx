'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import { products as defaultProducts, Product } from '@/data/products';
import { ChevronLeft, Copy, CheckCircle2, ShieldCheck, Upload, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();

  const [liveProducts, setLiveProducts] = useState<Product[]>(defaultProducts);

  const [liveSettings, setLiveSettings] = useState({
    whatsappNumber: siteConfig.whatsappNumber,
    freeShippingThreshold: siteConfig.shipping.freeShippingThreshold,
    shippingCompanies: siteConfig.shipping.companies,
    pagoMovil: siteConfig.paymentMethods.pagoMovil,
    transferencia: siteConfig.paymentMethods.transferencia,
    zelle: siteConfig.paymentMethods.zelle,
    binance: {
      payId: siteConfig.paymentMethods.binance.payId,
      email: '',
    },
  });

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');

  const [courier, setCourier] = useState(siteConfig.shipping.companies[0] || 'MRW');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');

  const [metodoPago, setMetodoPago] = useState('Pago Móvil');
  const [referencia, setReferencia] = useState('');
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null);

  // Estados UI y Atribución
  const [refCode, setRefCode] = useState('DIRECTO');
  const [adChannel, setAdChannel] = useState('Directo');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    productService.getProducts().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setLiveProducts(data);
      }
    });

    // Cargar configuración de tienda en vivo desde Redis
    fetch(`/api/store?key=store_site_config&t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          const cfg = json.data;
          const companies = typeof cfg.shippingCompanies === 'string'
            ? cfg.shippingCompanies.split(',').map((c: string) => c.trim()).filter(Boolean)
            : siteConfig.shipping.companies;

          setLiveSettings({
            whatsappNumber: cfg.whatsappNumber || siteConfig.whatsappNumber,
            freeShippingThreshold: Number(cfg.freeShippingThreshold) || siteConfig.shipping.freeShippingThreshold,
            shippingCompanies: companies.length > 0 ? companies : siteConfig.shipping.companies,
            pagoMovil: {
              banco: cfg.pagoMovilBanco || siteConfig.paymentMethods.pagoMovil.banco,
              telefono: cfg.pagoMovilTelefono || siteConfig.paymentMethods.pagoMovil.telefono,
              cedula: cfg.pagoMovilCedula || siteConfig.paymentMethods.pagoMovil.cedula,
            },
            transferencia: {
              banco: cfg.transfBanco || siteConfig.paymentMethods.transferencia.banco,
              cuenta: cfg.transfCuenta || siteConfig.paymentMethods.transferencia.cuenta,
              titular: cfg.transfTitular || siteConfig.paymentMethods.transferencia.titular,
              rif: cfg.transfRif || siteConfig.paymentMethods.transferencia.rif,
            },
            zelle: {
              email: cfg.zelleEmail || siteConfig.paymentMethods.zelle.email,
              titular: cfg.zelleTitular || siteConfig.paymentMethods.zelle.titular,
            },
            binance: {
              payId: cfg.binancePayId || siteConfig.paymentMethods.binance.payId,
              email: cfg.binanceEmail || '',
            },
          });

          if (companies.length > 0) {
            setCourier(companies[0]);
          }
        }
      })
      .catch(() => {});

    const storedRef = localStorage.getItem('todomax_ref');
    if (storedRef) {
      setRefCode(storedRef);
    }

    const storedAttribution = localStorage.getItem('todomax_attribution');
    if (storedAttribution) {
      try {
        const parsed = JSON.parse(storedAttribution);
        if (parsed.affiliateRef && parsed.affiliateRef !== 'DIRECTO') {
          setRefCode(parsed.affiliateRef);
        }
        if (parsed.channel) {
          setAdChannel(parsed.channel);
        }
      } catch (e) {}
    }
  }, []);

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
  };

  // Cálculos Financieros Reales sincronizados
  const subtotalPorItem = (price: number, quantity: number) => price * quantity;
  const total = items.reduce((acc, item) => acc + subtotalPorItem(item.price, item.quantity), 0);
  const isFreeShipping = total >= liveSettings.freeShippingThreshold;

  const totalCost = items.reduce((acc, item) => {
    const dbProduct = liveProducts.find((p) => String(p.id) === String(item.id));
    const itemCost = dbProduct ? Number(dbProduct.cost || 0) : 0;
    return acc + itemCost * item.quantity;
  }, 0);

  const totalAffiliateCommission = items.reduce((acc, item) => {
    const dbProduct = liveProducts.find((p) => String(p.id) === String(item.id));
    const commPercent = dbProduct ? Number(dbProduct.affiliateCommission ?? 10) : 10;
    return acc + item.price * item.quantity * (commPercent / 100);
  }, 0);

  const expectedUtility = total - totalCost - (refCode !== 'DIRECTO' ? totalAffiliateCommission : 0);

  const handleCopyBankData = () => {
    let data = '';
    if (metodoPago === 'Pago Móvil') {
      const pm = liveSettings.pagoMovil;
      data = `Pago Móvil TodoMax\nBanco: ${pm.banco}\nTeléfono: ${pm.telefono}\nCédula/RIF: ${pm.cedula}`;
    } else if (metodoPago === 'Transferencia') {
      const tr = liveSettings.transferencia;
      data = `Transferencia TodoMax\nBanco: ${tr.banco}\nCuenta: ${tr.cuenta}\nTitular: ${tr.titular}\nRIF: ${tr.rif}`;
    } else if (metodoPago === 'Zelle') {
      const zl = liveSettings.zelle;
      data = `Zelle TodoMax\nCorreo: ${zl.email}\nTitular: ${zl.titular}`;
    } else if (metodoPago === 'Binance Pay') {
      const bn = liveSettings.binance;
      data = `Binance Pay TodoMax\nPay ID: ${bn.payId}` + (bn.email ? `\nCorreo Binance: ${bn.email}` : '');
    }

    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let w = img.width,
          h = img.height;
        if (w > MAX_WIDTH) {
          h *= MAX_WIDTH / w;
          w = MAX_WIDTH;
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setComprobantePreview(canvas.toDataURL('image/webp', 0.6));
      };
    };
  };

  const safeSaveLocalOrders = (ordersToSave: any[]) => {
    try {
      localStorage.setItem('store_orders', JSON.stringify(ordersToSave));
    } catch (e) {
      try {
        const lightOrders = ordersToSave.map((o) => ({
          ...o,
          payment: { ...o.payment, receiptImage: undefined },
        }));
        localStorage.setItem('store_orders', JSON.stringify(lightOrders));
      } catch (_) {}
    }
  };

  const procesarYEnviarPedido = async () => {
    if (!nombre || !apellido || !cedula || !telefono || !estado || !ciudad || !direccion) {
      alert('Por favor completa todos los datos personales y de envío.');
      return;
    }
    if (metodoPago !== 'Efectivo' && !referencia.trim()) {
      alert('Debes ingresar el número de referencia de tu pago.');
      return;
    }
    if (metodoPago !== 'Efectivo' && !comprobantePreview) {
      alert('Por favor adjunta la captura o foto del comprobante de pago.');
      return;
    }

    setIsProcessing(true);
    const orderId = `TMX-${Date.now().toString().slice(-6)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: 'Pendiente de verificación',
      customer: { nombre, apellido, cedula, telefono },
      shipping: { courier, estado, ciudad, direccion, isFreeShipping },
      payment: {
        method: metodoPago,
        reference: referencia,
        hasReceipt: !!comprobantePreview,
        receiptImage: comprobantePreview,
      },
      items: items,
      financials: {
        total,
        cost: totalCost,
        commission: refCode !== 'DIRECTO' ? totalAffiliateCommission : 0,
        utility: expectedUtility,
      },
      attribution: {
        affiliateCode: refCode,
        channel: refCode !== 'DIRECTO' ? 'Afiliado' : adChannel,
      },
    };

    try {
      let currentCloudOrders: any[] = [];
      const resGet = await fetch(`/api/store?key=store_orders&t=${Date.now()}`, { cache: 'no-store' });
      if (resGet.ok) {
        const json = await resGet.json();
        if (Array.isArray(json.data)) {
          currentCloudOrders = json.data;
        }
      }

      if (currentCloudOrders.length === 0) {
        const existingLocal = localStorage.getItem('store_orders');
        if (existingLocal) {
          try {
            currentCloudOrders = JSON.parse(existingLocal);
          } catch (e) {}
        }
      }

      const updatedOrders = [newOrder, ...currentCloudOrders.filter((o: any) => o.id !== newOrder.id)];
      safeSaveLocalOrders(updatedOrders);

      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_orders', value: updatedOrders }),
      });
    } catch (error) {
      console.error('Error guardando pedido en la nube, respaldado en local:', error);
      const existingOrdersStr = localStorage.getItem('store_orders');
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      safeSaveLocalOrders([newOrder, ...existingOrders]);
    }

    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', { value: total, currency: 'USD' });
    }

    const listaProductos = items
      .map(
        (item) =>
          `▪ ${item.quantity}x ${item.title} (${siteConfig.currencySymbol}${(item.price * item.quantity).toFixed(2)})`
      )
      .join('%0A');

    const mensajeWhatsApp =
      `*NUEVO PEDIDO: ${orderId}*%0A%0A` +
      `*CLIENTE:* ${nombre} ${apellido}%0A` +
      `*CÉDULA:* ${cedula}%0A` +
      `*TELÉFONO:* ${telefono}%0A%0A` +
      `*📦 PRODUCTOS:*%0A${listaProductos}%0A%0A` +
      `*TOTAL:* ${siteConfig.currencySymbol}${total.toFixed(2)}%0A` +
      `*ENVÍO:* ${isFreeShipping ? 'GRATIS' : 'Cobro en Destino'} vía ${courier}%0A` +
      `*DIRECCIÓN:* ${estado}, ${ciudad}. ${direccion}%0A%0A` +
      `*💳 PAGO:* ${metodoPago}%0A` +
      (metodoPago !== 'Efectivo'
        ? `*REFERENCIA:* ${referencia}%0A*(Comprobante adjunto en el sistema y en esta conversación)*%0A`
        : '') +
      (refCode !== 'DIRECTO' ? `%0A*AFILIADO REF:* ${refCode}` : '');

    const rawWhatsApp = liveSettings.whatsappNumber || siteConfig.whatsappNumber;
    const whatsappNum = String(rawWhatsApp).replace(/\D/g, '');

    clearCart();

    setTimeout(() => {
      window.location.href = `https://wa.me/${whatsappNum}?text=${mensajeWhatsApp}`;
    }, 600);
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 pt-24">
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 font-medium">Aún no has agregado productos a tu compra.</p>
        <Link
          href="/catalogo"
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-1"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-500 font-bold text-xs mb-8 transition-transform hover:-translate-x-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Modificar Carrito</span>
        </button>

        {isProcessing ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100 max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">¡Procesando tu pedido!</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Estamos registrando tu orden en la nube de TodoMax. En un momento se abrirá WhatsApp para finalizar tu atención.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LADO IZQUIERDO: FORMULARIOS */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Datos Personales */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Tus Datos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      placeholder="Ej. Carlos"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Apellido</label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      placeholder="Ej. Pérez"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Cédula o RIF</label>
                    <input
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                      placeholder="V-12345678"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">WhatsApp / Teléfono</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                      placeholder="0412-1234567"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Datos de Envío */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Datos de Envío</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Empresa de Envío</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      {liveSettings.shippingCompanies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Estado</label>
                      <input
                        type="text"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        required
                        placeholder="Ej. Distrito Capital"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Ciudad</label>
                      <input
                        type="text"
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        required
                        placeholder="Ej. Caracas"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Dirección Detallada (Agencia o Dirección Exacta)
                    </label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                      placeholder="Agencia MRW / Av. Principal, Edificio..."
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Pago y Comprobante */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-200 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Validación de Pago</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                      Selecciona cómo deseas pagar
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Pago Móvil', 'Transferencia', 'Zelle', 'Binance Pay'].map((metodo) => (
                        <button
                          key={metodo}
                          type="button"
                          onClick={() => setMetodoPago(metodo)}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            metodoPago === metodo
                              ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                          }`}
                        >
                          {metodo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Datos Bancarios Copiables */}
                  <div className="bg-slate-900 rounded-2xl p-5 text-white relative group">
                    <h3 className="text-xs font-black uppercase text-orange-400 mb-3 tracking-wider">
                      Datos para {metodoPago}
                    </h3>
                    <div className="space-y-2 text-sm font-medium">
                      {metodoPago === 'Pago Móvil' && (
                        <>
                          <p>
                            <span className="text-slate-400">Banco:</span> {liveSettings.pagoMovil.banco}
                          </p>
                          <p>
                            <span className="text-slate-400">Teléfono:</span> {liveSettings.pagoMovil.telefono}
                          </p>
                          <p>
                            <span className="text-slate-400">Cédula/RIF:</span> {liveSettings.pagoMovil.cedula}
                          </p>
                        </>
                      )}
                      {metodoPago === 'Transferencia' && (
                        <>
                          <p>
                            <span className="text-slate-400">Banco:</span> {liveSettings.transferencia.banco}
                          </p>
                          <p>
                            <span className="text-slate-400">Cuenta:</span> {liveSettings.transferencia.cuenta}
                          </p>
                          <p>
                            <span className="text-slate-400">Titular:</span> {liveSettings.transferencia.titular}
                          </p>
                          <p>
                            <span className="text-slate-400">RIF:</span> {liveSettings.transferencia.rif}
                          </p>
                        </>
                      )}
                      {metodoPago === 'Zelle' && (
                        <>
                          <p>
                            <span className="text-slate-400">Correo:</span> {liveSettings.zelle.email}
                          </p>
                          <p>
                            <span className="text-slate-400">Titular:</span> {liveSettings.zelle.titular}
                          </p>
                        </>
                      )}
                      {metodoPago === 'Binance Pay' && (
                        <>
                          <p>
                            <span className="text-slate-400">Pay ID:</span> {liveSettings.binance.payId}
                          </p>
                          {liveSettings.binance.email && (
                            <p>
                              <span className="text-slate-400">Correo Binance:</span> {liveSettings.binance.email}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBankData}
                      className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? '¡Datos copiados!' : 'Copiar Datos de Pago'}
                    </button>
                  </div>

                  {/* Carga de Comprobante */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                        Número de Referencia
                      </label>
                      <input
                        type="text"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        required
                        placeholder="Ej. 123456"
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                        Adjuntar Comprobante (Captura)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="comprobante-upload"
                        />
                        <label
                          htmlFor="comprobante-upload"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-sm font-semibold text-slate-600 hover:border-orange-500 hover:text-orange-500 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          {comprobantePreview ? 'Cambiar imagen' : 'Subir foto o captura'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {comprobantePreview && (
                    <div className="mt-4 p-2 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center">
                      <img src={comprobantePreview} alt="Comprobante" className="h-32 object-contain rounded-xl mb-2" />
                      <p className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Comprobante adjuntado con éxito
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LADO DERECHO: RESUMEN DE ORDEN */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-lg sticky top-32 space-y-6">
                <h2 className="text-xl font-black text-slate-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Resumen de tu Compra
                </h2>

                <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl p-1 flex-shrink-0 border border-slate-100 flex items-center justify-center overflow-hidden">
                          {isVideo(item.image) ? (
                            <video src={item.image} muted className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                            Cant: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-sm text-slate-900 flex-shrink-0">
                        {siteConfig.currencySymbol}
                        {subtotalPorItem(item.price, item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                    <span>Subtotal de productos</span>
                    <span>
                      {siteConfig.currencySymbol}
                      {total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Envío ({courier})</span>
                    <span className={`font-black ${isFreeShipping ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isFreeShipping ? '¡GRATIS!' : 'Cobro en Destino'}
                    </span>
                  </div>
                </div>

                {!isFreeShipping && (
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
                    <p className="text-[11px] font-bold text-orange-700 leading-relaxed text-center">
                      ¡Agrega {siteConfig.currencySymbol}
                      {(liveSettings.freeShippingThreshold - total).toFixed(2)} más en productos y tu envío sale GRATIS!
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-base font-black text-slate-900">Total a Pagar</span>
                  <span className="text-3xl font-black text-orange-500">
                    {siteConfig.currencySymbol}
                    {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={procesarYEnviarPedido}
                  disabled={isProcessing}
                  className="bg-slate-900 hover:bg-orange-500 text-white w-full py-4.5 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Registrar Pago y Enviar Pedido
                </button>

                <p className="text-[10px] text-gray-400 text-center font-medium px-4">
                  Al confirmar, tu orden quedará registrada en TodoMax y se abrirá WhatsApp para atención inmediata.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}