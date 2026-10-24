'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Package, Users, Megaphone, UserCheck, DollarSign, 
  Lock, ArrowLeft, CheckCircle, Clock, Truck, CheckCircle2, 
  XCircle, AlertTriangle, TrendingUp, Plus, Trash2, Pencil, 
  X, Search, MessageCircle, ExternalLink, ShieldCheck, Eye, RefreshCw,
  Image as ImageIcon, Video, Sliders, Zap
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import { products as initialProducts, Product } from '@/data/products';

type UserRole = 'Super Admin' | 'Logística y Pagos' | 'Marketing y Afiliados';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'Pendiente de verificación' | 'Pago Aprobado' | 'En Preparación' | 'Despachado' | 'Entregado' | 'Cancelado';
  customer: {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
  };
  shipping: {
    courier: string;
    estado: string;
    ciudad: string;
    direccion: string;
    isFreeShipping: boolean;
    trackingNumber?: string;
  };
  payment: {
    method: string;
    reference: string;
    hasReceipt: boolean;
    receiptImage?: string;
  };
  items: OrderItem[];
  financials: {
    total: number;
    cost: number;
    utility: number;
  };
  attribution: {
    affiliateCode: string;
    channel: string;
  };
}

export default function AdminPage() {
  // Autenticación y Roles
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Admin');
  const [activeTab, setActiveTab] = useState<'pedidos' | 'inventario' | 'afiliados' | 'publicidad' | 'crm' | 'finanzas'>('pedidos');
  const [notification, setNotification] = useState('');

  // 1. Estado de Pedidos
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState('Todos');
  const [trackingInput, setTrackingInput] = useState('');

  // 2. Estado de Inventario y Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    originalPrice: '',
    cost: '',
    stock: '',
    category: 'Hogar',
    affiliateCommission: '10',
    description: '',
    features: '',
    benefits: '',
    badge: '',
    adCopy: '',
    isBestSeller: false,
    images: ['', '', '', ''], // Recuperados los 4 slots de imágenes/videos
  });

  // 3. Estado de Publicidad y Contenido (Recuperados editores Hero y Ofertas)
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [editingHeroId, setEditingHeroId] = useState<any>(null);
  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', badge: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });

  const [offers, setOffers] = useState<any[]>([]);
  const [editingOfferId, setEditingOfferId] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ tag: '', title: '', desc: '', discount: '', link: '/catalogo', gradient: 'from-slate-900 via-slate-800 to-orange-950', desktopImg: '', mobileImg: '' });

  const [adSpendInput, setAdSpendInput] = useState<number>(0);
  const [metaPixelId, setMetaPixelId] = useState(siteConfig.metaPixelId || '');

  // 4. Búsquedas
  const [searchTerm, setSearchTerm] = useState('');

  // 5. Utilidades Multimedia
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isVideoSource = (url: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
  };

  useEffect(() => {
    // Cargar sesión
    const savedAuth = localStorage.getItem('todomax_admin_auth');
    const savedRole = localStorage.getItem('todomax_admin_role') as UserRole;
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      if (savedRole) setCurrentRole(savedRole);
    }

    // Cargar Pedidos en tiempo real (Sincronización en vivo automática)
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('store_orders');
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (e) {
          console.error('Error cargando órdenes', e);
        }
      }
    };
    loadOrders();
    const orderInterval = setInterval(loadOrders, 3000);
    return () => clearInterval(orderInterval);

    // Cargar Productos desde la Nube (API)
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(initialProducts);
        }
      })
      .catch(() => setProducts(initialProducts));

    // Cargar Hero y Ofertas
    const savedHero = localStorage.getItem('store_hero_slides');
    if (savedHero) setHeroSlides(JSON.parse(savedHero as string));

    const savedOffers = localStorage.getItem('store_offers');
    if (savedOffers) setOffers(JSON.parse(savedOffers as string));

    // Cargar Gasto Publicitario para Finanzas
    const savedAdSpend = localStorage.getItem('store_ad_spend');
    if (savedAdSpend) {
      setAdSpendInput(Number(savedAdSpend));
    }
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Admin1234.') {
      setIsAuthenticated(true);
      setCurrentRole('Super Admin');
      localStorage.setItem('todomax_admin_auth', 'true');
      localStorage.setItem('todomax_admin_role', 'Super Admin');
    } else if (password === 'Logistica123.') {
      setIsAuthenticated(true);
      setCurrentRole('Logística y Pagos');
      setActiveTab('pedidos');
      localStorage.setItem('todomax_admin_auth', 'true');
      localStorage.setItem('todomax_admin_role', 'Logística y Pagos');
    } else if (password === 'Marketing123.') {
      setIsAuthenticated(true);
      setCurrentRole('Marketing y Afiliados');
      setActiveTab('afiliados');
      localStorage.setItem('todomax_admin_auth', 'true');
      localStorage.setItem('todomax_admin_role', 'Marketing y Afiliados');
    } else {
      notify('Contraseña incorrecta. Revisa tus credenciales.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('todomax_admin_auth');
    localStorage.removeItem('todomax_admin_role');
    setIsAuthenticated(false);
  };

  // ==========================================
  // OPERACIONES DE PEDIDOS (MÓDULO 1)
  // ==========================================
  const actualizarEstadoPedido = (orderId: string, nuevoEstado: Order['status'], tracking?: string) => {
    const ordenPrevia = orders.find(o => o.id === orderId);

    if (nuevoEstado === 'Pago Aprobado' && ordenPrevia && ordenPrevia.status === 'Pendiente de verificación') {
      const productosActualizados = [...products];
      ordenPrevia.items.forEach(item => {
        const prodIndex = productosActualizados.findIndex(p => p.id === item.id);
        if (prodIndex !== -1) {
          productosActualizados[prodIndex].stock = Math.max(0, productosActualizados[prodIndex].stock - item.quantity);
        }
      });
      setProducts(productosActualizados);
      localStorage.setItem('store_products', JSON.stringify(productosActualizados));
    }

    const ordenesActualizadas = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: nuevoEstado,
          shipping: {
            ...ord.shipping,
            trackingNumber: tracking || ord.shipping.trackingNumber,
          }
        };
      }
      return ord;
    });

    setOrders(ordenesActualizadas);
    localStorage.setItem('store_orders', JSON.stringify(ordenesActualizadas));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(ordenesActualizadas.find(o => o.id === orderId) || null);
    }
    notify(`Pedido ${orderId} actualizado a "${nuevoEstado}"`);
  };

  const enviarNotificacionCliente = (order: Order, tipo: 'aprobado' | 'despacho') => {
    const cleanPhone = order.customer.telefono.replace(/\D/g, '');
    let mensaje = '';

    if (tipo === 'aprobado') {
      mensaje = `¡Hola ${order.customer.nombre}! 👋 Te confirmamos que tu pago para la orden *${order.id}* en *TodoMax* ha sido VALIDADO con éxito. ✅ Tu pedido ya entró en preparación para despacho.`;
    } else if (tipo === 'despacho') {
      mensaje = `¡Buenas noticias ${order.customer.nombre}! 🚚 Tu pedido *${order.id}* ha sido DESPACHADO por *${order.shipping.courier}*. Número de Guía: *${order.shipping.trackingNumber || 'En tránsito'}*. ¡Gracias por confiar en TodoMax!`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // ==========================================
  // OPERACIONES DE INVENTARIO (MÓDULO 2)
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) return;

    const benefitsArray = productForm.benefits.split('\n').map(b => b.trim()).filter(Boolean);
    const featuresArray = productForm.features.split('\n').map(f => f.trim()).filter(Boolean);
    const imagesArray = productForm.images.filter(img => img.trim() !== '');

    let updated = [...products];

    if (editingProductId) {
      updated = products.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            title: productForm.title,
            price: Number(productForm.price),
            originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
            cost: Number(productForm.cost) || 0,
            stock: Number(productForm.stock) || 0,
            category: productForm.category,
            affiliateCommission: Number(productForm.affiliateCommission) || 10,
            description: productForm.description,
            features: featuresArray.length > 0 ? featuresArray : p.features,
            benefits: benefitsArray,
            badge: productForm.badge || undefined,
            adCopy: productForm.adCopy,
            isBestSeller: productForm.isBestSeller,
            images: imagesArray.length > 0 ? imagesArray : p.images,
          };
        }
        return p;
      });
      notify('Producto actualizado en la nube');
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        title: productForm.title,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        cost: Number(productForm.cost) || 0,
        stock: Number(productForm.stock) || 0,
        category: productForm.category,
        affiliateCommission: Number(productForm.affiliateCommission) || 10,
        description: productForm.description,
        features: featuresArray,
        benefits: benefitsArray,
        badge: productForm.badge || undefined,
        adCopy: productForm.adCopy,
        isBestSeller: productForm.isBestSeller,
        images: imagesArray.length > 0 ? imagesArray : [`data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' style='background:%23f8fafc'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23f97316'%3ENUEVO PRODUCTO%3C/text%3E%3C/svg%3E`],
        paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay'],
      };
      updated = [newProd, ...products];
      notify('Producto agregado a la nube');
    }

    setProducts(updated);
    localStorage.setItem('store_products', JSON.stringify(updated));
    
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Error sincronizando con Redis:', err);
    }

    setEditingProductId(null);
    setProductForm({
      title: '', price: '', originalPrice: '', cost: '', stock: '',
      category: 'Hogar', affiliateCommission: '10', description: '',
      features: '', benefits: '', badge: '', adCopy: '', isBestSeller: false, images: ['', '', '', ''],
    });
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    const existingImgs = [...(p.images || [])];
    while (existingImgs.length < 4) existingImgs.push('');

    setProductForm({
      title: p.title,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      cost: String(p.cost || 0),
      stock: String(p.stock || 0),
      category: p.category,
      affiliateCommission: String(p.affiliateCommission || 10),
      description: p.description,
      features: p.features ? p.features.join('\n') : '',
      benefits: p.benefits ? p.benefits.join('\n') : '',
      badge: p.badge || '',
      adCopy: p.adCopy || '',
      isBestSeller: !!p.isBestSeller,
      images: existingImgs,
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('store_products', JSON.stringify(updated));
      
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.error('Error eliminando en Redis:', err);
      }

      notify('Producto eliminado de la nube');
    }
  };

  // ==========================================
  // OPERACIONES DE MARKETING Y DISEÑO
  // ==========================================
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHeroId) {
      const updated = heroSlides.map(s => s.id === editingHeroId ? { ...s, ...heroForm } : s);
      setHeroSlides(updated); localStorage.setItem('store_hero_slides', JSON.stringify(updated)); setEditingHeroId(null); notify('Banner Hero actualizado');
    } else {
      const newItem = { id: Date.now(), ...heroForm };
      const updated = [...heroSlides, newItem];
      setHeroSlides(updated); localStorage.setItem('store_hero_slides', JSON.stringify(updated)); notify('Banner Hero agregado');
    }
    setHeroForm({ title: '', subtitle: '', badge: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });
  };

  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOfferId) {
      const updated = offers.map(o => o.id === editingOfferId ? { ...o, ...offerForm } : o);
      setOffers(updated); localStorage.setItem('store_offers', JSON.stringify(updated)); setEditingOfferId(null); notify('Promoción actualizada');
    } else {
      const newItem = { id: Date.now(), ...offerForm };
      const updated = [...offers, newItem];
      setOffers(updated); localStorage.setItem('store_offers', JSON.stringify(updated)); notify('Promoción agregada');
    }
    setOfferForm({ tag: '', title: '', desc: '', discount: '', link: '/catalogo', gradient: 'from-slate-900 via-slate-800 to-orange-950', desktopImg: '', mobileImg: '' });
  };

  // ==========================================
  // FINANZAS Y MÉTRICAS
  // ==========================================
  const totalVentasConfirmadas = orders
    .filter(o => o.status !== 'Cancelado' && o.status !== 'Pendiente de verificación')
    .reduce((acc, o) => acc + o.financials.total, 0);

  const totalCostoMercancia = orders
    .filter(o => o.status !== 'Cancelado' && o.status !== 'Pendiente de verificación')
    .reduce((acc, o) => acc + o.financials.cost, 0);

  const totalComisionesAfiliados = orders
    .filter(o => o.status === 'Entregado' && o.attribution.affiliateCode !== 'DIRECTO')
    .reduce((acc, o) => acc + (o.financials.total * 0.10), 0);

  const utilidadNetaEstimada = totalVentasConfirmadas - totalCostoMercancia - totalComisionesAfiliados - adSpendInput;

  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'Todos' || o.status === orderFilter;
    const matchesSearch = searchTerm === '' || 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.attribution.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const crmCustomers = Array.from(new Set(orders.map(o => o.customer.cedula))).map(cedula => {
    const clienteOrders = orders.filter(o => o.customer.cedula === cedula);
    const firstOrder = clienteOrders[0];
    const totalSpent = clienteOrders
      .filter(o => o.status !== 'Cancelado')
      .reduce((sum, o) => sum + o.financials.total, 0);

    return {
      cedula,
      nombre: `${firstOrder.customer.nombre} ${firstOrder.customer.apellido}`,
      telefono: firstOrder.customer.telefono,
      ciudad: `${firstOrder.shipping.ciudad}, ${firstOrder.shipping.estado}`,
      pedidosCount: clienteOrders.length,
      totalSpent,
      ultimoPedido: clienteOrders[0].date,
    };
  });

  const affiliateStats = Array.from(new Set(orders.map(o => o.attribution.affiliateCode)))
    .filter(code => code && code !== 'DIRECTO')
    .map(code => {
      const afOrders = orders.filter(o => o.attribution.affiliateCode === code);
      const confirmedOrders = afOrders.filter(o => o.status === 'Entregado');
      const pendingOrders = afOrders.filter(o => o.status !== 'Cancelado' && o.status !== 'Entregado');
      const totalVendido = confirmedOrders.reduce((sum, o) => sum + o.financials.total, 0);
      const comisionAcumulada = totalVendido * 0.10;

      return {
        codigo: code,
        totalOrdenes: afOrders.length,
        entregadas: confirmedOrders.length,
        pendientes: pendingOrders.length,
        totalVendido,
        comisionAcumulada,
      };
    });

  // ==========================================
  // PANTALLA DE LOGIN CON ROLES
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Panel Central TodoMax</h1>
            <p className="text-xs text-slate-500 font-medium">Acceso para Gerencia, Logística y Marketing</p>
          </div>

          {notification && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {notification}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Contraseña de Acceso</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingresa tu clave de acceso..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-orange-500 text-white rounded-xl font-black text-xs transition-colors cursor-pointer shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Contraseñas por Rol:</p>
            <p>• Super Admin (Todo): <span className="font-mono font-bold text-orange-600">Admin1234.</span></p>
            <p>• Logística y Pagos: <span className="font-mono font-bold text-slate-800">Logistica123.</span></p>
            <p>• Marketing y Afiliados: <span className="font-mono font-bold text-slate-800">Marketing123.</span></p>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANEL PRINCIPAL (Navegación y Módulos)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      
      {/* BARRA SUPERIOR */}
      <header className="bg-slate-900 text-white px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
            <span className="text-orange-500">TODOMAX</span> ERP
          </Link>
          <span className="bg-white/10 text-orange-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Rol: {currentRole}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1">
            <span>Ver Tienda</span> <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-bold bg-white/10 hover:bg-red-500/80 text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* MENÚ DE PESTAÑAS */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-2 overflow-x-auto scrollbar-hide shadow-xs">
        <div className="flex items-center gap-2 min-w-max">
          {(currentRole === 'Super Admin' || currentRole === 'Logística y Pagos') && (
            <>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'pedidos' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>1. Pedidos ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inventario')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'inventario' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>2. Inventario ({products.length})</span>
              </button>
            </>
          )}

          {(currentRole === 'Super Admin' || currentRole === 'Marketing y Afiliados') && (
            <>
              <button
                onClick={() => setActiveTab('afiliados')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'afiliados' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>3. Afiliados ({affiliateStats.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('publicidad')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'publicidad' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>4. Marketing, Banners y Píxeles</span>
              </button>
            </>
          )}

          {(currentRole === 'Super Admin' || currentRole === 'Logística y Pagos') && (
            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'crm' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>5. Clientes CRM ({crmCustomers.length})</span>
            </button>
          )}

          {currentRole === 'Super Admin' && (
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'finanzas' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>6. Finanzas & Rentabilidad</span>
            </button>
          )}
        </div>
      </nav>

      <main className="w-full px-4 md:px-12 lg:px-16 py-8">
        
        {notification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {notification}</span>
            <button onClick={() => setNotification('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* --- 1. PEDIDOS --- */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Gestión Central de Pedidos</h2>
                <p className="text-xs text-slate-500 font-medium">Valida comprobantes de pago, descuenta stock y registra números de guía.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {['Todos', 'Pendiente de verificación', 'Pago Aprobado', 'Despachado', 'Entregado', 'Cancelado'].map(f => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderFilter === f ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID de orden, nombre, cédula o código de afiliado..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold outline-none bg-transparent"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')}><X className="w-4 h-4 text-slate-400" /></button>}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Orden</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Productos</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Pago / Ref</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Afiliado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                          No hay pedidos con el filtro actual.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                            {order.id}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold text-slate-800 block">{order.customer.nombre} {order.customer.apellido}</span>
                            <span className="text-[10px] text-slate-400">{order.customer.cedula} • {order.customer.telefono}</span>
                          </td>
                          <td className="p-4">
                            <div className="max-w-[200px] truncate">
                              {order.items.map(it => `${it.quantity}x ${it.title}`).join(', ')}
                            </div>
                          </td>
                          <td className="p-4 font-black text-slate-900 whitespace-nowrap">
                            ${order.financials.total.toFixed(2)}
                            {order.shipping.isFreeShipping && (
                              <span className="block text-[9px] text-emerald-600 font-bold uppercase">Envío Gratis</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold block text-slate-800">{order.payment.method}</span>
                            <span className="text-[10px] text-slate-500">Ref: {order.payment.reference}</span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              order.status === 'Pendiente de verificación' ? 'bg-amber-100 text-amber-700' :
                              order.status === 'Pago Aprobado' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'Despachado' ? 'bg-purple-100 text-purple-700' :
                              order.status === 'Entregado' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="font-bold text-orange-600">{order.attribution.affiliateCode}</span>
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Administrar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL DETALLES DEL PEDIDO */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-100">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Detalle Operativo</span>
                      <h3 className="text-xl font-black text-slate-900">Orden {selectedOrder.id}</h3>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-500 uppercase text-[10px] mb-1">Cliente</p>
                      <p className="font-black text-slate-800 text-sm">{selectedOrder.customer.nombre} {selectedOrder.customer.apellido}</p>
                      <p>Cédula: {selectedOrder.customer.cedula}</p>
                      <p>WhatsApp: {selectedOrder.customer.telefono}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-500 uppercase text-[10px] mb-1">Destino ({selectedOrder.shipping.courier})</p>
                      <p className="font-bold text-slate-800">{selectedOrder.shipping.estado}, {selectedOrder.shipping.ciudad}</p>
                      <p className="text-slate-600">{selectedOrder.shipping.direccion}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Artículos en la orden</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                          <span className="font-bold text-slate-800">{it.quantity}x {it.title}</span>
                          <span className="font-black text-slate-900">${(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.payment?.receiptImage && (
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Comprobante de Pago Adjunto</h4>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                        <img src={selectedOrder.payment.receiptImage} alt="Comprobante" className="max-h-72 object-contain rounded-xl shadow-sm" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase text-slate-900">Acciones de Despacho y Pagos</h4>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status === 'Pendiente de verificación' && (
                        <button
                          onClick={() => {
                            actualizarEstadoPedido(selectedOrder.id, 'Pago Aprobado');
                            enviarNotificacionCliente(selectedOrder, 'aprobado');
                          }}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Validar Pago y Notificar</span>
                        </button>
                      )}

                      {selectedOrder.status === 'Pago Aprobado' && (
                        <div className="w-full flex gap-2">
                          <input
                            type="text"
                            placeholder="Ingresa N° Guía de envío (MRW/Zoom)..."
                            value={trackingInput}
                            onChange={e => setTrackingInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                          />
                          <button
                            onClick={() => {
                              if (!trackingInput) return alert('Ingresa el número de guía');
                              actualizarEstadoPedido(selectedOrder.id, 'Despachado', trackingInput);
                              enviarNotificacionCliente({
                                ...selectedOrder,
                                shipping: { ...selectedOrder.shipping, trackingNumber: trackingInput }
                              }, 'despacho');
                              setTrackingInput('');
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Registrar Guía
                          </button>
                        </div>
                      )}

                      {selectedOrder.status === 'Despachado' && (
                        <button
                          onClick={() => actualizarEstadoPedido(selectedOrder.id, 'Entregado')}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Marcar como Entregado (Liberar Comisión)
                        </button>
                      )}

                      {selectedOrder.status !== 'Cancelado' && (
                        <button
                          onClick={() => actualizarEstadoPedido(selectedOrder.id, 'Cancelado')}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Cancelar Pedido
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const clave = prompt('Ingresa la contraseña de administración para eliminar este pedido:');
                          if (clave === 'Admin1234.') {
                            const updatedOrders = orders.filter(o => o.id !== selectedOrder.id);
                            setOrders(updatedOrders);
                            localStorage.setItem('store_orders', JSON.stringify(updatedOrders));
                            setSelectedOrder(null);
                            notify('Pedido eliminado permanentemente');
                          } else if (clave !== null) {
                            alert('Contraseña incorrecta');
                          }
                        }}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer ml-auto"
                      >
                        🗑️ Eliminar Pedido (Con Clave)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 2. INVENTARIO Y PRODUCTOS (CON MULTIMEDIA Y TEXTOS LARGOS RECUPERADOS) --- */}
        {activeTab === 'inventario' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs h-fit space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                {editingProductId ? <Pencil className="w-4 h-4 text-orange-500" /> : <Plus className="w-4 h-4 text-orange-500" />}
                {editingProductId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    placeholder="Ej. Mini UPS 12V..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Precio Venta ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Costo Unitario ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.cost}
                      onChange={e => setProductForm({ ...productForm, cost: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                      placeholder="18"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Stock Disponible</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Categoría</label>
                    <select
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    >
                      <option value="Hogar">Hogar</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Cocina">Cocina</option>
                      <option value="Automóvil">Automóvil</option>
                      <option value="Belleza">Belleza</option>
                      <option value="Productos Virales">Productos Virales</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Comisión Afiliado (%)</label>
                  <input
                    type="number"
                    value={productForm.affiliateCommission}
                    onChange={e => setProductForm({ ...productForm, affiliateCommission: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Descripción corta (Home)</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                    placeholder="Detalles para la landing de venta..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Características / Ficha Técnica (1 por línea)</label>
                  <textarea
                    rows={3}
                    value={productForm.features}
                    onChange={e => setProductForm({ ...productForm, features: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                    placeholder="Voltaje: 12V&#10;Capacidad: 2kg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Beneficios Comerciales (1 por línea)</label>
                  <textarea
                    rows={3}
                    value={productForm.benefits}
                    onChange={e => setProductForm({ ...productForm, benefits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                    placeholder="Limpia fácil&#10;Ahorra tiempo"
                  />
                </div>

                {/* 4 SLOTS MULTIMEDIA (FOTOS / VIDEOS) */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-2">Multimedia (Hasta 4 Fotos o Videos MP4)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((index) => {
                      const media = productForm.images[index];
                      const isVideo = isVideoSource(media);
                      return (
                        <div key={index} className="border border-dashed border-slate-300 p-2 rounded-xl text-center relative bg-slate-50 hover:bg-slate-100 transition-colors">
                          {media ? (
                            <div className="relative h-24 w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                              {isVideo ? <video src={media} className="h-full w-full object-cover" muted autoPlay loop /> : <img src={media} alt="Preview" className="h-full w-full object-cover" />}
                              <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{isVideo ? 'Video' : 'Foto'}</span>
                              <button type="button" onClick={() => { const updated = [...productForm.images]; updated[index] = ''; setProductForm({ ...productForm, images: updated }); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs z-10 cursor-pointer"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-24 space-y-1">
                              <label className="cursor-pointer flex flex-col items-center">
                                <div className="flex items-center gap-1 text-slate-400"><ImageIcon size={16} /><Video size={16} /></div>
                                <span className="text-[10px] text-slate-500 font-semibold mt-1">Subir Foto/MP4</span>
                                <input type="file" accept="image/*,video/mp4" className="hidden" onChange={(e) => handleMediaUpload(e, (url) => { const updated = [...productForm.images]; updated[index] = url; setProductForm({ ...productForm, images: updated }); })} />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="bestSeller"
                    checked={productForm.isBestSeller}
                    onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                  />
                  <label htmlFor="bestSeller" className="font-bold text-slate-700 cursor-pointer">
                    Marcar como "Más Vendido" en Home
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-colors cursor-pointer"
                  >
                    {editingProductId ? 'Actualizar' : 'Guardar Producto'}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          title: '', price: '', originalPrice: '', cost: '', stock: '',
                          category: 'Hogar', affiliateCommission: '10', description: '',
                          features: '', benefits: '', badge: '', adCopy: '', isBestSeller: false, images: ['', '', '', ''],
                        });
                      }}
                      className="px-3 bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Control de Existencias ({products.length})</h3>
                <span className="text-xs text-slate-500">Alerta roja cuando stock ≤ 5</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b text-[10px] uppercase font-black text-slate-500">
                    <tr>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Costo</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Margen</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => {
                      const margen = p.price - (p.cost || 0);
                      const isLowStock = p.stock <= 5;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800 max-w-[180px] truncate">
                            <div className="flex items-center gap-2">
                               {p.images && p.images[0] && (
                                  <div className="w-8 h-8 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                     {isVideoSource(p.images[0]) ? <video src={p.images[0]} className="w-full h-full object-cover" /> : <img src={p.images[0]} className="w-full h-full object-cover" />}
                                  </div>
                               )}
                               {p.title}
                            </div>
                          </td>
                          <td className="p-3 text-slate-500">{p.category}</td>
                          <td className="p-3 text-slate-500">${(p.cost || 0).toFixed(2)}</td>
                          <td className="p-3 font-black text-slate-900">${p.price.toFixed(2)}</td>
                          <td className="p-3 font-bold text-emerald-600">+${margen.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                              isLowStock ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {p.stock} unid.
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- MÓDULO 3: AFILIADOS --- */}
        {activeTab === 'afiliados' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Rendimiento del Programa de Afiliados</h2>
              <p className="text-xs text-slate-500">Revisa ventas por embajador y montos de comisiones disponibles tras entrega.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Afiliados Activos</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{affiliateStats.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Ventas por Afiliados</p>
                <p className="text-3xl font-black text-orange-500 mt-2">
                  ${affiliateStats.reduce((s, a) => s + a.totalVendido, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <p className="text-xs font-bold text-slate-400 uppercase">Comisiones por Liquidar</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  ${totalComisionesAfiliados.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Código Afiliado</th>
                    <th className="p-4">Órdenes Totales</th>
                    <th className="p-4">Entregadas (Confirmadas)</th>
                    <th className="p-4">Volumen Facturado</th>
                    <th className="p-4">Comisión Disponible</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {affiliateStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        Aún no se han registrado ventas con códigos de afiliados.
                      </td>
                    </tr>
                  ) : (
                    affiliateStats.map(af => (
                      <tr key={af.codigo} className="hover:bg-slate-50">
                        <td className="p-4 font-black text-orange-600">{af.codigo}</td>
                        <td className="p-4">{af.totalOrdenes} pedidos</td>
                        <td className="p-4 text-emerald-600 font-bold">{af.entregadas} entregados</td>
                        <td className="p-4 font-black">${af.totalVendido.toFixed(2)}</td>
                        <td className="p-4 font-black text-emerald-600">${af.comisionAcumulada.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => notify(`Liquidación para ${af.codigo} procesada con éxito.`)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            Marcar Pagado
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MÓDULO 4: MARKETING, BANNERS Y PÍXELES (NUEVO GESTOR VISUAL) --- */}
        {activeTab === 'publicidad' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Editor de Hero Banners */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-500"/>
                <h3 className="text-lg font-black text-slate-900">Banners Principales (Hero)</h3>
              </div>
              <form onSubmit={handleSaveHero} className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div><label className="block font-bold uppercase mb-1">Título Grande</label><input type="text" required value={heroForm.title} onChange={e => setHeroForm({...heroForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div><label className="block font-bold uppercase mb-1">Subtítulo (Opcional)</label><input type="text" value={heroForm.subtitle} onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block font-bold uppercase mb-1">Etiqueta (Badge)</label><input type="text" value={heroForm.badge} onChange={e => setHeroForm({...heroForm, badge: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="Ej. PRODUCTO ESTRELLA" /></div>
                  <div><label className="block font-bold uppercase mb-1">Enlace del Botón</label><input type="text" value={heroForm.btnLink} onChange={e => setHeroForm({...heroForm, btnLink: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div><label className="block font-bold uppercase mb-1">Imagen PC</label><input type="file" accept="image/*" onChange={e => handleMediaUpload(e, url => setHeroForm({...heroForm, desktopImg: url}))} /></div>
                  <div><label className="block font-bold uppercase mb-1">Imagen Móvil</label><input type="file" accept="image/*" onChange={e => handleMediaUpload(e, url => setHeroForm({...heroForm, mobileImg: url}))} /></div>
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-orange-500 text-white font-black rounded-xl cursor-pointer transition-colors">
                  {editingHeroId ? 'Actualizar Banner Hero' : 'Agregar Banner Hero'}
                </button>
              </form>
              <div className="space-y-3 mt-6 max-h-[350px] overflow-y-auto pr-2">
                {heroSlides.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 hover:border-orange-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                         {s.desktopImg ? <img src={s.desktopImg} alt="Hero" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">Sin Foto</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[11px]">{s.title || s.badge || 'Banner (Sin título)'}</span>
                        <span className="text-[9px] text-slate-500 max-w-[150px] truncate">{s.subtitle || s.btnLink}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingHeroId(s.id); setHeroForm({ title: s.title || '', subtitle: s.subtitle || '', badge: s.badge || '', btnLink: s.btnLink || '/catalogo', desktopImg: s.desktopImg || '', mobileImg: s.mobileImg || '' }); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar Banner">
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button type="button" onClick={() => { if(confirm('¿Seguro que deseas eliminar este banner?')){ const u = heroSlides.filter(x => x.id !== s.id); setHeroSlides(u); localStorage.setItem('store_hero_slides', JSON.stringify(u)); } }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar Banner">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor de Promociones / Combos */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500"/>
                <h3 className="text-lg font-black text-slate-900">Promociones y Combos</h3>
              </div>
              <form onSubmit={handleSaveOffer} className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div><label className="block font-bold uppercase mb-1">Título de la Oferta</label><input type="text" required value={offerForm.title} onChange={e => setOfferForm({...offerForm, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div><label className="block font-bold uppercase mb-1">Descripción corta</label><input type="text" value={offerForm.desc} onChange={e => setOfferForm({...offerForm, desc: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block font-bold uppercase mb-1">Tag Superior</label><input type="text" value={offerForm.tag} onChange={e => setOfferForm({...offerForm, tag: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="Ej. COMBO AHORRO" /></div>
                  <div><label className="block font-bold uppercase mb-1">Descuento/Aviso</label><input type="text" value={offerForm.discount} onChange={e => setOfferForm({...offerForm, discount: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="Ej. 30% OFF" /></div>
                </div>
                <div><label className="block font-bold uppercase mb-1">Enlace del Producto</label><input type="text" value={offerForm.link} onChange={e => setOfferForm({...offerForm, link: e.target.value})} className="w-full px-3 py-2 border rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div><label className="block font-bold uppercase mb-1">Imagen PC</label><input type="file" accept="image/*" onChange={e => handleMediaUpload(e, url => setOfferForm({...offerForm, desktopImg: url}))} /></div>
                  <div><label className="block font-bold uppercase mb-1">Imagen Móvil</label><input type="file" accept="image/*" onChange={e => handleMediaUpload(e, url => setOfferForm({...offerForm, mobileImg: url}))} /></div>
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-orange-500 text-white font-black rounded-xl cursor-pointer transition-colors">
                  {editingOfferId ? 'Actualizar Oferta' : 'Agregar Oferta'}
                </button>
              </form>
              <div className="space-y-3 mt-6 max-h-[350px] overflow-y-auto pr-2">
                {offers.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50 hover:border-orange-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-slate-200 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                         {o.desktopImg ? <img src={o.desktopImg} alt="Oferta" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">Sin Foto</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[11px]">{o.title || 'Oferta (Sin título)'}</span>
                        <span className="text-[9px] text-orange-600 font-bold">{o.discount || 'Sin descuento'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingOfferId(o.id); setOfferForm({ tag: o.tag || '', title: o.title || '', desc: o.desc || '', discount: o.discount || '', link: o.link || '/catalogo', gradient: o.gradient || 'from-slate-900 via-slate-800 to-orange-950', desktopImg: o.desktopImg || '', mobileImg: o.mobileImg || '' }); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar Oferta">
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button type="button" onClick={() => { if(confirm('¿Seguro que deseas eliminar esta oferta?')){ const u = offers.filter(x => x.id !== o.id); setOffers(u); localStorage.setItem('store_offers', JSON.stringify(u)); } }} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar Oferta">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ads & Pixeles */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-slate-900">Píxeles y Gasto Publicitario</h3>
              <div className="flex flex-col md:flex-row gap-4 text-xs">
                <input type="text" value={metaPixelId} onChange={e => setMetaPixelId(e.target.value)} placeholder="Meta Pixel ID..." className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl font-bold" />
                <input type="number" value={adSpendInput} onChange={e => { setAdSpendInput(Number(e.target.value)); localStorage.setItem('store_ad_spend', e.target.value); }} placeholder="Inversión Mensual Ads ($)..." className="w-full md:w-64 px-4 py-3 bg-slate-50 border rounded-xl font-bold" />
                <button onClick={() => notify('Configuración de Ads y Pixel guardada con éxito')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl cursor-pointer">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* --- MÓDULO 5: CRM DE CLIENTES --- */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Directorio CRM de Clientes</h2>
              <p className="text-xs text-slate-500">Historial de compradores, recurrencia y contacto directo.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-[10px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Cédula / RIF</th>
                    <th className="p-4">Ubicación</th>
                    <th className="p-4">Pedidos Realizados</th>
                    <th className="p-4">Total Comprado</th>
                    <th className="p-4 text-right">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {crmCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        Aún no hay clientes registrados a través de compras.
                      </td>
                    </tr>
                  ) : (
                    crmCustomers.map(cl => (
                      <tr key={cl.cedula} className="hover:bg-slate-50">
                        <td className="p-4 font-black text-slate-800">{cl.nombre}</td>
                        <td className="p-4 text-slate-500">{cl.cedula}</td>
                        <td className="p-4 text-slate-600">{cl.ciudad}</td>
                        <td className="p-4 font-bold">{cl.pedidosCount} pedido(s)</td>
                        <td className="p-4 font-black text-slate-900">${cl.totalSpent.toFixed(2)}</td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${cl.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${cl.nombre}, te contactamos de TodoMax.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Escribir
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MÓDULO 6: FINANZAS Y RENTABILIDAD --- */}
        {activeTab === 'finanzas' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Estado Financiero y Rentabilidad Real</h2>
              <p className="text-xs text-slate-500">Cruza ingresos brutos, costos de importación, gasto publicitario y comisiones.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase">Facturación Bruta</span>
                <p className="text-3xl font-black text-slate-900 mt-2">${totalVentasConfirmadas.toFixed(2)}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">Pedidos confirmados y despachados</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase">Costo de Mercancía</span>
                <p className="text-3xl font-black text-slate-700 mt-2">${totalCostoMercancia.toFixed(2)}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">Costo de reposición de inventario</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase">Gastos Ads + Comisiones</span>
                <p className="text-3xl font-black text-amber-600 mt-2">${(totalComisionesAfiliados + adSpendInput).toFixed(2)}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">Publicidad: ${adSpendInput} • Afiliados: ${totalComisionesAfiliados.toFixed(2)}</span>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Utilidad Neta Estimada</span>
                <p className="text-3xl font-black mt-2 text-emerald-400">${utilidadNetaEstimada.toFixed(2)}</p>
                <span className="text-[10px] text-white/70 mt-1 block">
                  Margen Neto: {totalVentasConfirmadas > 0 ? ((utilidadNetaEstimada / totalVentasConfirmadas) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}