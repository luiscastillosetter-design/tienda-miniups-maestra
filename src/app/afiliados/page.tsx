'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { products } from '@/data/products';
import { 
  DollarSign, CheckCircle2, MessageCircle, BarChart3, 
  Link as LinkIcon, Download, Copy, PlaySquare, ArrowRight, User, Wallet
} from 'lucide-react';

type AffiliateUser = {
  nombre: string;
  email: string;
  codigo: string;
  joinedAt: string;
};

export default function AfiliadosPage() {
  const [user, setUser] = useState<AffiliateUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'biblioteca' | 'ia'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Estados del Formulario
  const [formData, setFormData] = useState({ nombre: '', email: '', codigo: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estados de Métricas (Leídas del localStorage ERP)
  const [metrics, setMetrics] = useState({ ventasPendientes: 0, ventasConfirmadas: 0, comisionesDisponibles: 0 });

  // Estados UI
  const [copiedLink, setCopiedLink] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'ia' | 'user', text: string}[]>([
    { role: 'ia', text: '¡Hola! Soy Sofía, tu asistente IA de TodoMax. Dime, ¿qué producto quieres vender hoy y te entregaré tu kit de publicidad?' }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('todomax_affiliate_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      calcularMetricas(parsedUser.codigo);
    }
    setIsLoaded(true);
  }, []);

  const calcularMetricas = (codigo: string) => {
    const ordersStr = localStorage.getItem('store_orders');
    if (ordersStr) {
      const orders = JSON.parse(ordersStr);
      let pendientes = 0;
      let confirmadas = 0;
      let comisiones = 0;

      orders.forEach((order: any) => {
        if (order.attribution?.affiliateCode === codigo) {
          if (order.status === 'Pendiente de verificación') {
            pendientes++;
          } else if (order.status === 'Entregado' || order.status === 'Completado') {
            confirmadas++;
            // Calculamos comisión (Ej. 10% base o lectura de la DB si se guardó)
            comisiones += (order.financials.total * 0.10); 
          }
        }
      });
      setMetrics({ ventasPendientes: pendientes, ventasConfirmadas: confirmadas, comisionesDisponibles: comisiones });
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      alert("Debes aceptar las condiciones comerciales para continuar.");
      return;
    }
    const cleanCode = formData.codigo.toUpperCase().replace(/\s+/g, '');
    const newUser = {
      nombre: formData.nombre,
      email: formData.email,
      codigo: cleanCode,
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem('todomax_affiliate_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMsgs);
    const query = chatInput.toLowerCase();
    setChatInput('');

    setTimeout(() => {
      let responseText = "No encontré un producto exacto con ese nombre. ¿Puedes intentar con palabras como 'Aspiradora', 'Freidora', 'UPS' o 'Proyector'?";
      
      const foundProduct = products.find(p => query.includes(p.title.split(' ')[0].toLowerCase()) || query.includes(p.category.toLowerCase()));
      
      if (foundProduct) {
        responseText = `¡Excelente elección! Aquí tienes tu kit para *${foundProduct.title}*:\n\n` +
          `📸 *Material Visual:* Accede desde la pestaña 'Biblioteca'.\n` +
          `📝 *Texto sugerido:* ${foundProduct.adCopy || '¡Compra este increíble producto hoy mismo con envío gratis!'}\n\n` +
          `🔗 *Tu Enlace:* https://todomax.com/product/${foundProduct.id}?ref=${user?.codigo}`;
      }

      setChatMessages([...newMsgs, { role: 'ia', text: responseText }]);
    }, 1000);
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 pt-32 flex items-center justify-center font-bold">Cargando...</div>;

  // ==========================================
  // VISTA 1: REGISTRO (LANDING DE AFILIADOS)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-20">
        <div className="w-full px-4 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
          
          <div className="flex-1 space-y-6">
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-xs font-black rounded-full uppercase tracking-widest">
              Programa de Embajadores
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Gana Dinero Vendiendo <span className="text-orange-500">Sin Inventario</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              Únete al equipo comercial de TodoMax. Te damos los videos, las imágenes y tu enlace personalizado. Tú solo publicas; nosotros cobramos, despachamos y te pagamos tu comisión.
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">1</div>
                <p className="text-sm font-bold text-slate-800">Regístrate y crea tu código único.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">2</div>
                <p className="text-sm font-bold text-slate-800">Descarga los videos de nuestros productos.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black">3</div>
                <p className="text-sm font-bold text-slate-800">Cobra comisiones por cada compra exitosa.</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Crea tu Cuenta</h2>
            <form onSubmit={handleRegister} className="space-y-5">
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
                <input type="text" required value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black uppercase focus:outline-none focus:border-orange-500 focus:bg-white transition-colors" placeholder="EJ: CARLOS2024" />
                <p className="text-[10px] text-gray-400 mt-1">Este será el código que compartirás (ej. ?ref=CARLOS2024).</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1" />
                <label htmlFor="terms" className="text-[10px] text-slate-700 font-medium leading-tight cursor-pointer">
                  Acepto que TodoMax se encarga del cobro y despacho al cliente final. Mis comisiones se liberarán únicamente cuando el pedido marque estado "Entregado".
                </label>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md">
                Unirme al Programa
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: PANEL PRIVADO DEL AFILIADO
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 pt-24 md:pt-32 pb-20">
      <div className="w-full px-4 md:px-12 lg:px-16 max-w-7xl mx-auto space-y-8">
        
        {/* Header del Panel */}
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
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Navegación Interna */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-px scrollbar-hide">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <BarChart3 className="w-4 h-4 inline-block mr-2" /> Resumen y Ganancias
          </button>
          <button onClick={() => setActiveTab('biblioteca')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'biblioteca' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <Download className="w-4 h-4 inline-block mr-2" /> Biblioteca de Anuncios
          </button>
          <button onClick={() => setActiveTab('ia')} className={`px-6 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'ia' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <MessageCircle className="w-4 h-4 inline-block mr-2" /> Asistente IA (Sofía)
          </button>
        </div>

        {/* CONTENIDO: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Link Principal Copiable */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">Tu Enlace Universal de Tienda</h3>
                <p className="text-xs text-slate-500 mt-1">Cualquier persona que entre con este link y compre, generará comisión para ti.</p>
              </div>
              <div className="flex items-center w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <span className="px-4 text-xs font-bold text-slate-600 truncate max-w-[200px] md:max-w-xs">
                  https://todomax.com/?ref={user.codigo}
                </span>
                <button 
                  onClick={() => copyToClipboard(`https://todomax.com/?ref=${user.codigo}`, 'general')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 text-xs font-black transition-colors flex items-center gap-1.5"
                >
                  {copiedLink === 'general' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink === 'general' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><User className="w-5 h-5" /></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas Pendientes</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics.ventasPendientes}</div>
                <p className="text-[10px] text-slate-400 mt-2">En proceso de verificación y envío</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-slate-500 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Ventas Confirmadas</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{metrics.ventasConfirmadas}</div>
                <p className="text-[10px] text-slate-400 mt-2">Entregadas exitosamente</p>
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

        {/* CONTENIDO: BIBLIOTECA DE MATERIAL */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Kits de Venta por Producto</h2>
              <p className="text-xs text-slate-500">Descarga, copia y publica en tus redes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col">
                  <div className="aspect-video bg-slate-50 relative p-4 flex items-center justify-center border-b border-gray-100">
                    <img src={product.images[0]} alt={product.title} className="h-full object-contain mix-blend-multiply" />
                    <span className="absolute top-3 left-3 bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">{product.category}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 line-clamp-2">{product.title}</h3>
                      <p className="text-xs text-emerald-600 font-bold mt-1">Comisión aprox: {siteConfig.currencySymbol}{(product.price * (product.affiliateCommission / 100)).toFixed(2)}</p>
                    </div>
                    
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      {/* Enlace Específico */}
                      <button 
                        onClick={() => copyToClipboard(`https://todomax.com/product/${product.id}?ref=${user.codigo}`, `link-${product.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        {copiedLink === `link-${product.id}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <LinkIcon className="w-4 h-4" />}
                        {copiedLink === `link-${product.id}` ? 'Enlace Copiado' : 'Copiar Tu Enlace'}
                      </button>

                      {/* Texto Publicitario */}
                      <button 
                        onClick={() => copyToClipboard(`${product.adCopy}\n\nCómpralo aquí: https://todomax.com/product/${product.id}?ref=${user.codigo}`, `copy-${product.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        {copiedLink === `copy-${product.id}` ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {copiedLink === `copy-${product.id}` ? 'Texto Copiado' : 'Copiar Texto para Redes'}
                      </button>

                      {/* Descargar Video/Foto */}
                      <a 
                        href={product.images[0]} 
                        download
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        <Download className="w-4 h-4" /> Descargar Material (Foto/Video)
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO: ASISTENTE IA SOFÍA */}
        {activeTab === 'ia' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-[600px] animate-in fade-in">
            {/* Header del Chat */}
            <div className="bg-slate-900 px-6 py-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-black text-sm">Sofía (IA TodoMax)</h3>
                <p className="text-emerald-400 text-[10px] font-bold">En línea</p>
              </div>
            </div>

            {/* Área de Mensajes */}
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

            {/* Input del Chat */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ej: Quiero vender la Freidora de Aire..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button type="submit" className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
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