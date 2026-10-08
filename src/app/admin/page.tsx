'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, ArrowLeft, CheckCircle, Image as ImageIcon, Settings, ShoppingBag, Layers, Sliders, Zap } from 'lucide-react';
import Link from 'next/link';
import { products as initialStoreProducts } from '@/data/products';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'ofertas' | 'categories' | 'branding'>('products');
  const [successMsg, setSuccessMsg] = useState('');

  // Branding
  const [storeName, setStoreName] = useState('Todomax');
  const [logoUrl, setLogoUrl] = useState('/logo-todomax.png');

  // Productos
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'General',
    images: ['', '', '', '']
  });

  // Carrusel Hero (Desktop y Móvil)
  const defaultHeroSlides = [
    {
      id: 1,
      title: 'Catálogo Completo',
      btnLink: '/catalogo',
      desktopImg: '/hero/hero1catalogo.png',
      mobileImg: '/hero/hero1catalogo-mobile.png',
    },
    {
      id: 2,
      title: 'Programa de Afiliados',
      btnLink: '/afiliados',
      desktopImg: '/hero/hero2afiliados.png',
      mobileImg: '/hero/hero2afiliados-mobile.png',
    },
    {
      id: 3,
      title: 'Crea tu Cuenta / Registro',
      btnLink: '?auth=register',
      desktopImg: '/hero/hero3registro.png',
      mobileImg: '/hero/hero3registro-mobile.png',
    },
  ];
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [newHero, setNewHero] = useState({ title: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });

  // Carrusel Ofertas (Desktop y Móvil)
  const defaultOffers = [
    {
      id: 1,
      title: 'SÚPER OFERTA: 40% en Accesorios',
      description: 'Todos nuestros accesorios con descuento increíble',
      btnLink: '/catalogo',
      desktopImg: '/ofertas/oferta1.png',
      mobileImg: '/ofertas/oferta1-mobile.png',
    },
    {
      id: 2,
      title: 'PAQUETES ESPECIALES: 2x1',
      description: 'Compra dos productos y lleva uno gratis',
      btnLink: '/catalogo',
      desktopImg: '/ofertas/oferta2.png',
      mobileImg: '/ofertas/oferta2-mobile.png',
    },
    {
      id: 3,
      title: 'ENVÍO GRATIS A TODO EL PAÍS',
      description: 'En compras mayores a $50',
      btnLink: '/catalogo',
      desktopImg: '/ofertas/oferta3.png',
      mobileImg: '/ofertas/oferta3-mobile.png',
    },
  ];
  const [offers, setOffers] = useState<any[]>([]);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });

  // Categorías del Catálogo
  const defaultCategories = [
    { id: 'Todos', name: 'Catálogo Completo', image: '/categories/todos.png' },
    { id: 'Phones', name: 'Smartphones', image: '/categories/phone.png' },
    { id: 'Audio', name: 'Audio Profesional', image: '/categories/sonido.png' },
    { id: 'Smart Home', name: 'Hogar Inteligente', image: '/categories/smarthome.png' },
    { id: 'Gaming', name: 'Zona Gaming', image: '/categories/gaming.png' },
    { id: 'Gadgets', name: 'Accesorios y Gadgets', image: '/categories/gadgets.png' },
  ];
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', image: '' });

  const ADMIN_PIN = 'Admin1234.';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      showNotification('Contraseña incorrecta. Utilice Admin1234.');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }

    // Cargar Productos
    const savedProducts = localStorage.getItem('store_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialStoreProducts);
      localStorage.setItem('store_products', JSON.stringify(initialStoreProducts));
    }

    // Cargar Hero
    const savedHero = localStorage.getItem('store_hero_slides');
    if (savedHero) {
      setHeroSlides(JSON.parse(savedHero));
    } else {
      setHeroSlides(defaultHeroSlides);
      localStorage.setItem('store_hero_slides', JSON.stringify(defaultHeroSlides));
    }

    // Cargar Ofertas
    const savedOffers = localStorage.getItem('store_offers');
    if (savedOffers) {
      setOffers(JSON.parse(savedOffers));
    } else {
      setOffers(defaultOffers);
      localStorage.setItem('store_offers', JSON.stringify(defaultOffers));
    }

    // Cargar Categorías
    const savedCategories = localStorage.getItem('store_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(defaultCategories);
      localStorage.setItem('store_categories', JSON.stringify(defaultCategories));
    }
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Manejadores de Productos
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;
    const item = {
      id: Date.now(),
      title: newProduct.title,
      price: newProduct.price,
      category: newProduct.category,
      images: newProduct.images.filter(img => img !== ''),
    };
    const updated = [item, ...products];
    setProducts(updated);
    localStorage.setItem('store_products', JSON.stringify(updated));
    setNewProduct({ title: '', price: '', category: 'General', images: ['', '', '', ''] });
    showNotification('¡Producto agregado con éxito!');
  };

  const handleDeleteProduct = (id: any) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('store_products', JSON.stringify(updated));
  };

  // Manejadores de Hero
  const handleAddHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHero.desktopImg) {
      showNotification('Debes cargar al menos la imagen de ordenador');
      return;
    }
    const item = {
      id: Date.now(),
      title: newHero.title || `Banner ${heroSlides.length + 1}`,
      btnLink: newHero.btnLink || '/catalogo',
      desktopImg: newHero.desktopImg,
      mobileImg: newHero.mobileImg || newHero.desktopImg,
    };
    const updated = [...heroSlides, item];
    setHeroSlides(updated);
    localStorage.setItem('store_hero_slides', JSON.stringify(updated));
    setNewHero({ title: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });
    showNotification('¡Banner de carrusel agregado!');
  };

  const handleDeleteHero = (id: any) => {
    const updated = heroSlides.filter(s => s.id !== id);
    setHeroSlides(updated);
    localStorage.setItem('store_hero_slides', JSON.stringify(updated));
  };

  // Manejadores de Ofertas
  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.desktopImg) {
      showNotification('Debes cargar al menos la imagen de ordenador');
      return;
    }
    const item = {
      id: Date.now(),
      title: newOffer.title || `Oferta ${offers.length + 1}`,
      description: newOffer.description,
      btnLink: newOffer.btnLink || '/catalogo',
      desktopImg: newOffer.desktopImg,
      mobileImg: newOffer.mobileImg || newOffer.desktopImg,
    };
    const updated = [...offers, item];
    setOffers(updated);
    localStorage.setItem('store_offers', JSON.stringify(updated));
    setNewOffer({ title: '', description: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });
    showNotification('¡Tarjeta de oferta agregada!');
  };

  const handleDeleteOffer = (id: any) => {
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    localStorage.setItem('store_offers', JSON.stringify(updated));
  };

  // Manejadores de Categorías
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.image) {
      showNotification('Ingresa el nombre y sube una imagen');
      return;
    }
    const item = {
      id: newCategory.id || newCategory.name,
      name: newCategory.name,
      image: newCategory.image,
    };
    const updated = [...categories, item];
    setCategories(updated);
    localStorage.setItem('store_categories', JSON.stringify(updated));
    setNewCategory({ id: '', name: '', image: '' });
    showNotification('¡Categoría agregada!');
  };

  const handleDeleteCategory = (id: any) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('store_categories', JSON.stringify(updated));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-4 text-orange-500">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Panel Admin - Todomax</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Ingresa tu contraseña de acceso.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              Acceder al Panel
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-20">
      {/* Header del Admin */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-6 flex flex-wrap justify-between items-center gap-4 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 whitespace-nowrap">Admin - {storeName}</h1>
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Modo Autonomía Total</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-orange-500 transition-colors">Ver Tienda en Vivo</Link>
          <button
            onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
            className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Menú de Pestañas con Carrusel de Ofertas incluido */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-2 overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingBag size={18} /> Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'hero' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Sliders size={18} /> Carrusel Hero ({heroSlides.length})
          </button>
          <button
            onClick={() => setActiveTab('ofertas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ofertas' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Zap size={18} /> Carrusel Ofertas ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Layers size={18} /> Categorías ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'branding' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Settings size={18} /> Logo y Tienda
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="text-green-500" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* 1. PESTAÑA: PRODUCTOS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Agregar Nuevo Producto
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título del Producto</label>
                  <input
                    type="text"
                    placeholder="Ej. Mini UPS Inteligente"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Precio ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="49.99"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Categoría</label>
                    <input
                      type="text"
                      placeholder="Ej. Phones, Gaming..."
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Imágenes del Producto (Hasta 4)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="border border-dashed border-slate-300 p-2 rounded-xl text-center relative bg-slate-50 hover:bg-slate-100 transition-colors">
                        {newProduct.images[index] ? (
                          <div className="relative h-20 w-full">
                            <img src={newProduct.images[index]} alt={`Preview ${index}`} className="h-20 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...newProduct.images];
                                updated[index] = '';
                                setNewProduct({ ...newProduct, images: updated });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-20">
                            <ImageIcon size={20} className="text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500 font-semibold">Imagen {index + 1}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => {
                                const updated = [...newProduct.images];
                                updated[index] = url;
                                setNewProduct({ ...newProduct, images: updated });
                              })}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
                >
                  Guardar Producto
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Inventario Actual ({products.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded-lg border bg-white" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">Sin Foto</div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{product.title}</h3>
                        <p className="text-xs text-slate-500">${product.price} • <span className="text-orange-600 font-semibold">{product.category}</span></p>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{product.images?.filter(Boolean).length || 0} imágenes</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PESTAÑA: CARRUSEL HERO */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Nuevo Banner Hero
              </h2>
              <form onSubmit={handleAddHero} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título / Referencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Promoción Especial"
                    value={newHero.title}
                    onChange={(e) => setNewHero({ ...newHero, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Enlace al hacer click</label>
                  <input
                    type="text"
                    placeholder="/catalogo"
                    value={newHero.btnLink}
                    onChange={(e) => setNewHero({ ...newHero, btnLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Ordenador (Desktop)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setNewHero({ ...newHero, desktopImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Móvil (Mobile)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setNewHero({ ...newHero, mobileImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
                >
                  Agregar Tarjeta al Hero
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Banners Activos en Hero ({heroSlides.length})</h2>
              <div className="space-y-4">
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={slide.desktopImg} alt="Desktop" className="w-20 h-12 object-cover rounded-lg border" />
                        <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] px-1 rounded">PC</span>
                      </div>
                      <div className="relative">
                        <img src={slide.mobileImg || slide.desktopImg} alt="Mobile" className="w-10 h-12 object-cover rounded-lg border" />
                        <span className="absolute bottom-0 right-0 bg-orange-600 text-white text-[9px] px-1 rounded">Móvil</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{slide.title}</h4>
                        <p className="text-xs text-slate-500">{slide.btnLink}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHero(slide.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      title="Eliminar banner"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. PESTAÑA: CARRUSEL OFERTAS */}
        {activeTab === 'ofertas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Nueva Tarjeta de Oferta
              </h2>
              <form onSubmit={handleAddOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título de la Oferta</label>
                  <input
                    type="text"
                    placeholder="Ej. SÚPER OFERTA: 40% OFF"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Descripción / Subtítulo</label>
                  <input
                    type="text"
                    placeholder="Ej. En compras mayores a $50"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Enlace al hacer click</label>
                  <input
                    type="text"
                    placeholder="/catalogo"
                    value={newOffer.btnLink}
                    onChange={(e) => setNewOffer({ ...newOffer, btnLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Ordenador (Desktop)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setNewOffer({ ...newOffer, desktopImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Móvil (Mobile)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setNewOffer({ ...newOffer, mobileImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
                >
                  Agregar Oferta
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Ofertas Activas ({offers.length})</h2>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={offer.desktopImg} alt="Desktop" className="w-20 h-12 object-cover rounded-lg border" />
                        <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] px-1 rounded">PC</span>
                      </div>
                      <div className="relative">
                        <img src={offer.mobileImg || offer.desktopImg} alt="Mobile" className="w-10 h-12 object-cover rounded-lg border" />
                        <span className="absolute bottom-0 right-0 bg-orange-600 text-white text-[9px] px-1 rounded">Móvil</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{offer.title}</h4>
                        <p className="text-xs text-slate-500">{offer.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      title="Eliminar oferta"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. PESTAÑA: CATEGORÍAS */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-orange-500" /> Nueva Categoría
              </h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Identificador (ID en Inglés)</label>
                  <input
                    type="text"
                    placeholder="Ej. Phones, Gaming..."
                    value={newCategory.id}
                    onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nombre Visible</label>
                  <input
                    type="text"
                    placeholder="Ej. Zona Gaming"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Imagen de Fondo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setNewCategory({ ...newCategory, image: url }))}
                    className="text-xs w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
                >
                  Guardar Categoría
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Categorías Activas en la Tienda ({categories.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={cat.image} alt={cat.name} className="w-14 h-10 object-cover rounded-lg border bg-white" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">ID: {cat.id}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. PESTAÑA: BRANDING Y LOGO */}
        {activeTab === 'branding' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Configuración General de la Tienda</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nombre de la Tienda</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Logotipo Oficial</label>
                <div className="flex items-center gap-4">
                  <img src={logoUrl} alt="Logo" className="w-20 h-16 object-contain border rounded-lg p-1 bg-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setLogoUrl(url))}
                    className="text-xs"
                  />
                </div>
              </div>
              <button
                onClick={() => showNotification('¡Marca y logotipo actualizados con éxito!')}
                className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-orange-500 transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}