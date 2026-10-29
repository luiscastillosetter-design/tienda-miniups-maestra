'use client';

import { useState, useEffect, FormEvent } from 'react';
import { siteConfig } from '@/config/site';
import { productService } from '@/services/productService';
import { products as defaultProducts, Product } from '@/data/products';
import { 
  CheckCircle2, MessageCircle, BarChart3, 
  Link as LinkIcon, Download, Copy, User, Wallet, LogIn
} from 'lucide-react';

type AffiliateUser = {
  nombre: string;
  email: string;
  codigo: string;
  joinedAt: string;
};

const DEFAULT_BASE_URL = 'https://www.importadoratodomax.com';

export default function AfiliadosPage() {
  const [user, setUser] = useState<AffiliateUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'biblioteca' | 'ia'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [liveProducts, setLiveProducts] = useState<Product[]>(defaultProducts);

  // Estados del Formulario (Registro e Inicio de Sesión)
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', codigo: '' });
  const [loginCode, setLoginCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estados de Métricas
  const [metrics, setMetrics] = useState({ ventasPendientes: 0, ventasConfirmadas: 0, comisionesDisponibles: 0 });

  // Estados UI
  const [copiedLink, setCopiedLink] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'ia' | 'user', text: string}[]>([
    { role: 'ia', text: '¡Hola! Soy Sofía, tu asistente IA de TodoMax. Dime, ¿qué producto quieres vender hoy y te entregaré tu kit de publicidad?' }
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      setBaseUrl(window.location.origin);
    }

    const init = async () => {
      const prods = await productService.getProducts();
      if (Array.isArray(prods) && prods.length > 0) {
        setLiveProducts(prods);
      }

      const storedUser = localStorage.getItem('todomax_affiliate_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          await calcularMetricas(parsedUser.codigo, prods);
        } catch (e) {}
      }
      setIsLoaded(true);
    };

    init();
  }, []);

  const calcularMetricas = async (codigo: string, catalogProducts: Product[]) => {
    let orders: any[] = [];

    try {
      const res = await fetch(`/api/store?key=store_orders&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          orders = json.data;
          try {
            localStorage.setItem('store_orders', JSON.stringify(orders));
          } catch (_) {}
        }
      }
    } catch (e) {}

    if (orders.length === 0) {
      const ordersStr = localStorage.getItem('store_orders');
      if (ordersStr) {
        try {
          orders = JSON.parse(ordersStr);
        } catch (e) {}
      }
    }

    // Consulta de comisiones ya pagadas para descontarlas del saldo disponible
    let paidAmount = 0;
    try {
      const resPaid = await fetch(`/api/store?key=store_paid_affiliates&t=${Date.now()}`, { cache: 'no-store' });
      if (resPaid.ok) {
        const jPaid = await resPaid.json();
        if (jPaid.data) {
          if (typeof jPaid.data === 'object' && !Array.isArray(jPaid.data)) {
            paidAmount = Number(jPaid.data[codigo] || 0);
          } else if (Array.isArray(jPaid.data) && jPaid.data.includes(codigo)) {
            paidAmount = 999999;
          }
        }
      }
    } catch (e) {}

    let pendientes = 0;
    let confirmadas = 0;
    let comisiones = 0;

    orders.forEach((order: any) => {
      if (order.attribution?.affiliateCode === codigo) {
        if (order.status !== 'Cancelado' && order.status !== 'Entregado' && order.status !== 'Completado') {
          pendientes++;
        } else if (order.status === 'Entregado' || order.status === 'Completado') {
          confirmadas++;
          if (order.financials?.commission !== undefined) {
            comisiones += Number(order.financials.commission);
          } else if (Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const prod = catalogProducts.find(p => String(p.id) === String(item.id));
              const pct = prod ? Number(prod.affiliateCommission || 10) : 10;
              comisiones += (item.price * item.quantity * (pct / 100));
            });
          } else {
            comisiones += (order.financials.total * 0.10);
          }
        }
      }
    });

    const comisionDisponibleReal = Math.max(0, comisiones - paidAmount);

    setMetrics({
      ventasPendientes: pendientes,
      ventasConfirmadas: confirmadas,
      comisionesDisponibles: comisionDisponibleReal,
    });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert('Debes aceptar las condiciones comerciales para continuar.');
      return;
    }
    const cleanCode = formData.codigo.toUpperCase().replace(/\s+/g, '');

    // Validación de código duplicado antes de registrar
    let currentAffiliates: AffiliateUser[] = [];
    try {
      const res = await fetch(`/api/store?key=store_affiliates&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) currentAffiliates = json.data;
      }
    } catch (e) {}

    const isCodeTaken = currentAffiliates.some(a => a.codigo === cleanCode);
    if (isCodeTaken) {
      alert(`El código "${cleanCode}" ya pertenece a otro embajador. Por favor elige uno diferente.`);
      return;
    }

    const newUser: AffiliateUser = {
      nombre: formData.nombre,
      email: formData.email,
      codigo: cleanCode,
      joinedAt: new Date().toISOString()
    };

    localStorage.setItem('todomax_affiliate_user', JSON.stringify(newUser));
    setUser(newUser);

    try {
      const updated = [newUser, ...currentAffiliates.filter(a => a.codigo !== cleanCode)];
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'store_affiliates', value: updated }),
      });
    } catch (e) {}

    await calcularMetricas(cleanCode, liveProducts);
  };

  const handleLoginExisting = async (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = loginCode.toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) return;

    let foundUser: AffiliateUser | null = null;
    try {
      const res = await fetch(`/api/store?key=store_affiliates&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          foundUser = json.data.find((a: AffiliateUser) => a.codigo === cleanCode) || null;
        }
      }
    } catch (e) {}

    if (!foundUser) {
      alert(`El código "${cleanCode}" no está registrado. Por favor verifica o crea tu cuenta.`);
      return;
    }

    localStorage.setItem('todomax_affiliate_user', JSON.stringify(foundUser));
    setUser(foundUser);
    await calcularMetricas(cleanCode, liveProducts);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const buildAdText = (product: Product, affiliateUrl: string) => {
    const rawCopy = product.adCopy || `¡Compra ${product.title} hoy mismo con garantía y envío rápido!`;
    if (rawCopy.includes('[ENLACE]')) {
      return rawCopy.replace('[ENLACE]', affiliateUrl);
    }
    return `${rawCopy}\n\nCómpralo aquí: ${affiliateUrl}`;
  };

  const isVideo = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMsgs);
    const query = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let responseText = "No encontré un producto exacto con ese nombre. ¿Puedes intentar con palabras como 'Aspiradora', 'Freidora', 'UPS', 'Cepillo' o 'Proyector'?";
      
      const foundProduct = liveProducts.find(
        p =>
          p.title.toLowerCase().includes(query) ||
          query.includes(p.title.split(' ')[0].toLowerCase()) ||
          query.includes(p.category.toLowerCase())
      );
      
      if (foundProduct) {
        const prodLink = `${baseUrl}/product/${foundProduct.id}?ref=${user?.codigo}`;
        const copyReady = buildAdText(foundProduct, prodLink);
        responseText = `¡Excelente elección! Aquí tienes tu kit para *${foundProduct.title}*:\n\n` +
          `💰 *Tu Comisión:* ${foundProduct.affiliateCommission}% (${siteConfig.currencySymbol}${(foundProduct.price * (foundProduct.affiliateCommission / 100)).toFixed(2)} por venta)\n` +
          `📸 *Material Visual:* Descárgalo en la pestaña 'Biblioteca de Anuncios'.\n\n` +
          `📝 *Texto listo para publicar:*\n${copyReady}\n\n` +
          `🔗 *Tu Enlace Directo:* ${prodLink}`;
      }

      setChatMessages([...newMsgs, { role: 'ia', text: responseText }]);
    }, 600);
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 pt-32 flex items-center justify-center font-bold">Cargando...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 md:pt-36 pb-20">
        <div className="w-full px-4 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
          
          <div className="flex-1 space-y-6">
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-xs font-black rounded-full uppercase tracking-widest">
              Programa de Embajadores
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Gana Dinero Vendiendo <span className="text-orange-500">Sin Inventario</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Únete al equipo comercial de {siteConfig.storeName}. Te damos los videos, las imágenes y tu enlace personalizado. Tú solo publicas; nosotros cobramos, despachamos y te pagamos tu comisión.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">1</div>
                <p className="text-sm font-bold text-slate-800">Regístrate y crea tu código único.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">2</div>
                <p className="text-sm font-bold text-slate-800">Descarga las fotos y videos de nuestros productos.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black">3</div>
                <p className="text-sm font-bold text-slate-800">Cobra comisiones por cada compra entregada.</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-black text-slate-900">{isLoginMode ? 'Iniciar Sesión' : 'Crea tu Cuenta'}</h2>
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)} 
                className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
              >
                {isLoginMode ? '¿Nuevo? Regístrate' : '¿Ya tienes código? Entra aquí'}
              </button>
            </div>

            {isLoginMode ? (
              <form onSubmit={handleLoginExisting} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tu Código de Afiliado</label>
                  <input 
                    type="text" 
                    required 
                    value={loginCode} 
                    onChange={e => setLoginCode(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black uppercase focus:outline-none focus:border-orange-500 focus:bg-white transition-colors" 
                    placeholder="EJ: CARLOS2026" 
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" /> Acceder a Mi Panel
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nombre Completo</label>
                  <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors" placeholder="Tu nombre y apellido" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Correo Electrónico</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-colors" placeholder="tu@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Crea tu Código de Afiliado</label>
                  <input type="text" required value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black uppercase focus:outline-none focus:border-orange-500 focus:bg-white transition-colors" placeholder="EJ: CARLOS2026" />
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1" />
                  <label htmlFor="terms" className="text-[10px] text-slate-700 font-medium leading-tight cursor-pointer">
                    Acepto que {siteConfig.storeName} se encarga del cobro y despacho al cliente final. Mis comisiones se liberarán únicamente cuando el pedido marque estado &quot;Entregado&quot;.
                  </label>
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md">
                  Unirme al Programa
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    );
  }

  const universalLink = `${baseUrl}/?ref=${user.codigo}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 md:pt-36 pb-20">
      <div className="w-full px-4 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-8">
        
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-black shadow-lg">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-wider">Panel de Afiliado</p>
              <h1 className="text-2xl md:text-3xl font-black text-white">{user.nombre}</h1>
              <p className="text-slate-400 text-xs">Código: <span className="text-white font-bold">{user.codigo}</span></p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('todomax_affiliate_user'); setUser(null); }}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px scrollbar-hide">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <BarChart3 className="w-4 h-4 inline-block mr-2" /> Resumen y Ganancias
          </button>
          <button onClick={() => setActiveTab('biblioteca')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'biblioteca' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Download className="w-4 h-4 inline-block mr-2" /> Biblioteca de Anuncios
          </button>
          <button onClick={() => setActiveTab('ia')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === 'ia' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <MessageCircle className="w-4 h-4 inline-block mr-2" /> Asistente IA (Sofía)
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Tu Enlace Universal de Tienda</h3>
                <p className="text-xs text-slate-500 mt-1">Cualquier persona que entre con este link y compre, generará comisión para ti durante 30 días.</p>
              </div>
              <div className="flex items-center w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <span className="px-4 text-xs font-bold text-slate-600 truncate max-w-[220px] md:max-w-sm">
                  {universalLink}
                </span>
                <button 
                  onClick={() => copyToClipboard(universalLink, 'general')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink === 'general' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink === 'general' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><User className="w-5 h-5" /></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas en Proceso</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics.ventasPendientes}</div>
                <p className="text-[10px] text-slate-400 mt-2">En verificación o tránsito de envío</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas Entregadas</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics.ventasConfirmadas}</div>
                <p className="text-[10px] text-slate-400 mt-2">Confirmadas y completadas</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 rounded-3xl shadow-md text-white flex flex-col justify-between hover:shadow-lg transition-shadow hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Wallet className="w-5 h-5" /></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Comisión Disponible</span>
                </div>
                <div className="text-4xl font-black">{siteConfig.currencySymbol}{metrics.comisionesDisponibles.toFixed(2)}</div>
                <p className="text-[10px] text-white/80 mt-2">Solicita tu retiro al llegar a $20</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biblioteca' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Kits de Venta por Producto ({liveProducts.length})</h2>
              <p className="text-xs text-slate-500">Descarga, copia y publica en tus redes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveProducts.map((product) => {
                const productRefUrl = `${baseUrl}/product/${product.id}?ref=${user.codigo}`;
                const fullAdCopy = buildAdText(product, productRefUrl);
                const commAmount = (product.price * ((product.affiliateCommission || 10) / 100)).toFixed(2);
                const coverMedia = product.images?.[0] || '';

                return (
                  <div key={product.id} className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
                    <div className="aspect-video bg-slate-50 relative p-4 flex items-center justify-center border-b border-gray-100">
                      {isVideo(coverMedia) ? (
                        <video src={coverMedia} className="h-full w-full object-cover rounded-xl" muted autoPlay loop />
                      ) : (
                        <img src={coverMedia} alt={product.title} className="h-full object-contain mix-blend-multiply" />
                      )}
                      <span className="absolute top-3 left-3 bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{product.category}</span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 line-clamp-2">{product.title}</h3>
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          Ganas {product.affiliateCommission || 10}% por venta: {siteConfig.currencySymbol}{commAmount}
                        </p>
                      </div>
                      
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                        <button 
                          onClick={() => copyToClipboard(productRefUrl, `link-${product.id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          {copiedLink === `link-${product.id}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                          {copiedLink === `link-${product.id}` ? 'Enlace Copiado' : 'Copiar Tu Enlace'}
                        </button>

                        <button 
                          onClick={() => copyToClipboard(fullAdCopy, `copy-${product.id}`)}
                          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          {copiedLink === `copy-${product.id}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copiedLink === `copy-${product.id}` ? 'Texto Copiado' : 'Copiar Texto para Redes'}
                        </button>

                        <a 
                          href={coverMedia} 
                          download={`${product.id}-todomax`}
                          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Descargar Material (Foto/Video)
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ia' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-[600px] animate-in fade-in">
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-black text-sm">Sofía (IA {siteConfig.storeName})</h3>
                <p className="text-emerald-400 text-[10px] font-bold">En línea • Sincronizada con el catálogo actual</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'ia' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                    msg.role === 'ia' 
                      ? 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-sm whitespace-pre-line' 
                      : 'bg-orange-500 text-white rounded-tr-none shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ej: Quiero vender la Freidora de Aire..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button type="submit" className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm cursor-pointer">
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}