'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, X, Lock, ArrowLeft, CheckCircle, Image as ImageIcon, Settings, ShoppingBag, Layers, Sliders, Zap } from 'lucide-react';
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

  // 1. Productos
  const [products, setProducts] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    category: 'Smart Home',
    description: '',
    images: ['', '', '', '']
  });

  // 2. Carrusel Hero
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
  const [editingHeroId, setEditingHeroId] = useState<any>(null);
  const [heroForm, setHeroForm] = useState({ title: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });

  // 3. Carrusel Ofertas
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
  const [editingOfferId, setEditingOfferId] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({ title: '', description: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });

  // 4. Categorías
  const defaultCategories = [
    { id: 'Todos', name: 'Catálogo Completo', image: '/categories/todos.png' },
    { id: 'Phones', name: 'Smartphones', image: '/categories/phone.png' },
    { id: 'Audio', name: 'Audio Profesional', image: '/categories/sonido.png' },
    { id: 'Smart Home', name: 'Hogar Inteligente', image: '/categories/smarthome.png' },
    { id: 'Gaming', name: 'Zona Gaming', image: '/categories/gaming.png' },
    { id: 'Gadgets', name: 'Accesorios y Gadgets', image: '/categories/gadgets.png' },
  ];
  const [categories, setCategories] = useState<any[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', image: '' });

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

    const savedProducts = localStorage.getItem('store_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(initialStoreProducts);
      localStorage.setItem('store_products', JSON.stringify(initialStoreProducts));
    }

    const savedHero = localStorage.getItem('store_hero_slides');
    if (savedHero) {
      setHeroSlides(JSON.parse(savedHero));
    } else {
      setHeroSlides(defaultHeroSlides);
      localStorage.setItem('store_hero_slides', JSON.stringify(defaultHeroSlides));
    }

    const savedOffers = localStorage.getItem('store_offers');
    if (savedOffers) {
      setOffers(JSON.parse(savedOffers));
    } else {
      setOffers(defaultOffers);
      localStorage.setItem('store_offers', JSON.stringify(defaultOffers));
    }

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

  // --- CRUD: PRODUCTOS ---
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) return;

    if (editingProductId) {
      const updated = products.map(p =>
        p.id === editingProductId
          ? {
              ...p,
              title: productForm.title,
              price: productForm.price,
              category: productForm.category,
              description: productForm.description,
              images: productForm.images.filter(img => img !== '')
            }
          : p
      );
      setProducts(updated);
      localStorage.setItem('store_products', JSON.stringify(updated));
      setEditingProductId(null);
      showNotification('¡Producto y descripción actualizados con éxito!');
    } else {
      const newItem = {
        id: Date.now(),
        title: productForm.title,
        price: productForm.price,
        category: productForm.category,
        description: productForm.description,
        images: productForm.images.filter(img => img !== ''),
      };
      const updated = [newItem, ...products];
      setProducts(updated);
      localStorage.setItem('store_products', JSON.stringify(updated));
      showNotification('¡Producto agregado con éxito!');
    }
    setProductForm({ title: '', price: '', category: 'Smart Home', description: '', images: ['', '', '', ''] });
  };

  const startEditProduct = (product: any) => {
    setEditingProductId(product.id);
    const existingImgs = [...(product.images || [])];
    while (existingImgs.length < 4) existingImgs.push('');
    setProductForm({
      title: product.title || '',
      price: product.price?.toString() || '',
      category: product.category || 'Smart Home',
      description: product.description || '',
      images: existingImgs,
    });
  };

  const handleDeleteProduct = (id: any) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem('store_products', JSON.stringify(updated));
    if (editingProductId === id) {
      setEditingProductId(null);
      setProductForm({ title: '', price: '', category: 'Smart Home', description: '', images: ['', '', '', ''] });
    }
  };

  // --- CRUD: HERO ---
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.desktopImg) {
      showNotification('Debes asignar la imagen para ordenador');
      return;
    }

    if (editingHeroId) {
      const updated = heroSlides.map(s =>
        s.id === editingHeroId
          ? { ...s, title: heroForm.title, btnLink: heroForm.btnLink, desktopImg: heroForm.desktopImg, mobileImg: heroForm.mobileImg || heroForm.desktopImg }
          : s
      );
      setHeroSlides(updated);
      localStorage.setItem('store_hero_slides', JSON.stringify(updated));
      setEditingHeroId(null);
      showNotification('¡Banner de hero actualizado!');
    } else {
      const newItem = {
        id: Date.now(),
        title: heroForm.title || `Banner ${heroSlides.length + 1}`,
        btnLink: heroForm.btnLink || '/catalogo',
        desktopImg: heroForm.desktopImg,
        mobileImg: heroForm.mobileImg || heroForm.desktopImg,
      };
      const updated = [...heroSlides, newItem];
      setHeroSlides(updated);
      localStorage.setItem('store_hero_slides', JSON.stringify(updated));
      showNotification('¡Banner agregado al hero!');
    }
    setHeroForm({ title: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });
  };

  const startEditHero = (slide: any) => {
    setEditingHeroId(slide.id);
    setHeroForm({
      title: slide.title || '',
      btnLink: slide.btnLink || '/catalogo',
      desktopImg: slide.desktopImg || '',
      mobileImg: slide.mobileImg || '',
    });
  };

  const handleDeleteHero = (id: any) => {
    const updated = heroSlides.filter(s => s.id !== id);
    setHeroSlides(updated);
    localStorage.setItem('store_hero_slides', JSON.stringify(updated));
    if (editingHeroId === id) setEditingHeroId(null);
  };

  // --- CRUD: OFERTAS ---
  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.desktopImg) {
      showNotification('Debes asignar la imagen para ordenador');
      return;
    }

    if (editingOfferId) {
      const updated = offers.map(o =>
        o.id === editingOfferId
          ? { ...o, title: offerForm.title, description: offerForm.description, btnLink: offerForm.btnLink, desktopImg: offerForm.desktopImg, mobileImg: offerForm.mobileImg || offerForm.desktopImg }
          : o
      );
      setOffers(updated);
      localStorage.setItem('store_offers', JSON.stringify(updated));
      setEditingOfferId(null);
      showNotification('¡Tarjeta de oferta actualizada!');
    } else {
      const newItem = {
        id: Date.now(),
        title: offerForm.title || `Oferta ${offers.length + 1}`,
        description: offerForm.description,
        btnLink: offerForm.btnLink || '/catalogo',
        desktopImg: offerForm.desktopImg,
        mobileImg: offerForm.mobileImg || offerForm.desktopImg,
      };
      const updated = [...offers, newItem];
      setOffers(updated);
      localStorage.setItem('store_offers', JSON.stringify(updated));
      showNotification('¡Tarjeta de oferta agregada!');
    }
    setOfferForm({ title: '', description: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' });
  };

  const startEditOffer = (offer: any) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      btnLink: offer.btnLink || '/catalogo',
      desktopImg: offer.desktopImg || '',
      mobileImg: offer.mobileImg || '',
    });
  };

  const handleDeleteOffer = (id: any) => {
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    localStorage.setItem('store_offers', JSON.stringify(updated));
    if (editingOfferId === id) setEditingOfferId(null);
  };

  // --- CRUD: CATEGORÍAS ---
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.image) {
      showNotification('Ingresa nombre y sube la imagen');
      return;
    }

    if (editingCategoryId) {
      const updated = categories.map(c =>
        c.id === editingCategoryId
          ? { ...c, name: categoryForm.name, image: categoryForm.image }
          : c
      );
      setCategories(updated);
      localStorage.setItem('store_categories', JSON.stringify(updated));
      setEditingCategoryId(null);
      showNotification('¡Categoría actualizada!');
    } else {
      const newItem = {
        id: categoryForm.id || categoryForm.name,
        name: categoryForm.name,
        image: categoryForm.image,
      };
      const updated = [...categories, newItem];
      setCategories(updated);
      localStorage.setItem('store_categories', JSON.stringify(updated));
      showNotification('¡Categoría agregada!');
    }
    setCategoryForm({ id: '', name: '', image: '' });
  };

  const startEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      id: cat.id || '',
      name: cat.name || '',
      image: cat.image || '',
    });
  };

  const handleDeleteCategory = (id: any) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    localStorage.setItem('store_categories', JSON.stringify(updated));
    if (editingCategoryId === id) setEditingCategoryId(null);
  };

  // Categorías seleccionables para los productos (excluyendo "Todos")
  const productCategoryOptions = categories.filter(c => c.id !== 'Todos');

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

      {/* Menú de Pestañas */}
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

        {/* 1. PRODUCTOS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editingProductId ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-orange-500" />}
                  {editingProductId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h2>
                {editingProductId && (
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({ title: '', price: '', category: 'Smart Home', description: '', images: ['', '', '', ''] });
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título del Producto</label>
                  <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 font-semibold"
                    placeholder="Ej. Mini UPS Smart 12V..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Precio ($)</label>
                    <input
                      type="text"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 font-semibold"
                      placeholder="35"
                      required
                    />
                  </div>

                  {/* SELECTOR DE CATEGORÍAS REALES */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Categoría</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-500 font-semibold cursor-pointer"
                    >
                      {productCategoryOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.id})
                        </option>
                      ))}
                      {/* Preserva categoría previa si no coincide exactamente */}
                      {productForm.category && !productCategoryOptions.some(c => c.id === productForm.category) && (
                        <option value={productForm.category}>{productForm.category}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* DESCRIPCIÓN PERSUASIVA PARA LA LANDING */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">
                    Descripción Persuasiva (Copy / Beneficios)
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Escribe el texto persuasivo que saldrá en la página del producto para cerrar más ventas..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 font-normal leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Se verá reflejado en la página de detalles del producto.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Imágenes del Producto (Hasta 4)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="border border-dashed border-slate-300 p-2 rounded-xl text-center relative bg-slate-50 hover:bg-slate-100 transition-colors">
                        {productForm.images[index] ? (
                          <div className="relative h-20 w-full">
                            <img src={productForm.images[index]} alt={`Preview ${index}`} className="h-20 w-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...productForm.images];
                                updated[index] = '';
                                setProductForm({ ...productForm, images: updated });
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
                                const updated = [...productForm.images];
                                updated[index] = url;
                                setNewProductFormImages(updated);
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
                  className={`w-full font-bold py-3 rounded-xl transition-colors text-sm shadow-md text-white ${editingProductId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-orange-500'}`}
                >
                  {editingProductId ? 'Actualizar Producto' : 'Guardar Producto'}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar producto"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editingHeroId ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-orange-500" />}
                  {editingHeroId ? 'Editar Banner Hero' : 'Nuevo Banner Hero'}
                </h2>
                {editingHeroId && (
                  <button
                    onClick={() => { setEditingHeroId(null); setHeroForm({ title: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' }); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveHero} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título / Referencia</label>
                  <input
                    type="text"
                    value={heroForm.title}
                    onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Enlace al hacer click</label>
                  <input
                    type="text"
                    value={heroForm.btnLink}
                    onChange={(e) => setHeroForm({ ...heroForm, btnLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Ordenador (Desktop)</label>
                  {heroForm.desktopImg && <img src={heroForm.desktopImg} alt="Desktop Preview" className="h-16 w-full object-cover rounded-lg border mb-1" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setHeroForm({ ...heroForm, desktopImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Móvil (Mobile)</label>
                  {heroForm.mobileImg && <img src={heroForm.mobileImg} alt="Mobile Preview" className="h-16 w-24 object-cover rounded-lg border mb-1" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setHeroForm({ ...heroForm, mobileImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full font-bold py-3 rounded-xl transition-colors text-sm shadow-md text-white ${editingHeroId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {editingHeroId ? 'Actualizar Banner Hero' : 'Agregar Tarjeta al Hero'}
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
                        <img src={slide.mobileImg || slide.desktopImg} alt="Mobile" className="w-10 h-12 object-cover rounded-lg border shadow-xs" />
                        <span className="absolute bottom-0 right-0 bg-orange-600 text-white text-[9px] px-1 rounded">Móvil</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{slide.title}</h4>
                        <p className="text-xs text-slate-500">{slide.btnLink}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditHero(slide)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                        title="Editar banner"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteHero(slide.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Eliminar banner"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. OFERTAS */}
        {activeTab === 'ofertas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editingOfferId ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-orange-500" />}
                  {editingOfferId ? 'Editar Oferta' : 'Nueva Tarjeta de Oferta'}
                </h2>
                {editingOfferId && (
                  <button
                    onClick={() => { setEditingOfferId(null); setOfferForm({ title: '', description: '', btnLink: '/catalogo', desktopImg: '', mobileImg: '' }); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Título de la Oferta</label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Descripción / Subtítulo</label>
                  <input
                    type="text"
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Enlace al hacer click</label>
                  <input
                    type="text"
                    value={offerForm.btnLink}
                    onChange={(e) => setOfferForm({ ...offerForm, btnLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Ordenador (Desktop)</label>
                  {offerForm.desktopImg && <img src={offerForm.desktopImg} alt="Desktop Preview" className="h-16 w-full object-cover rounded-lg border mb-1" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setOfferForm({ ...offerForm, desktopImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase">Imagen Móvil (Mobile)</label>
                  {offerForm.mobileImg && <img src={offerForm.mobileImg} alt="Mobile Preview" className="h-16 w-24 object-cover rounded-lg border mb-1" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setOfferForm({ ...offerForm, mobileImg: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full font-bold py-3 rounded-xl transition-colors text-sm shadow-md text-white ${editingOfferId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {editingOfferId ? 'Actualizar Oferta' : 'Agregar Oferta'}
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
                        <img src={offer.desktopImg} alt="Desktop" className="w-20 h-12 object-cover rounded-lg border shadow-xs" />
                        <span className="absolute bottom-0 right-0 bg-slate-900 text-white text-[9px] px-1 rounded">PC</span>
                      </div>
                      <div className="relative">
                        <img src={offer.mobileImg || offer.desktopImg} alt="Mobile" className="w-10 h-12 object-cover rounded-lg border shadow-xs" />
                        <span className="absolute bottom-0 right-0 bg-orange-600 text-white text-[9px] px-1 rounded">Móvil</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{offer.title}</h4>
                        <p className="text-xs text-slate-500">{offer.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditOffer(offer)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                        title="Editar oferta"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Eliminar oferta"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CATEGORÍAS */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {editingCategoryId ? <Pencil size={20} className="text-blue-500" /> : <Plus size={20} className="text-orange-500" />}
                  {editingCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                {editingCategoryId && (
                  <button
                    onClick={() => { setEditingCategoryId(null); setCategoryForm({ id: '', name: '', image: '' }); }}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                  >
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Identificador (ID)</label>
                  <input
                    type="text"
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    disabled={!!editingCategoryId}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nombre Visible</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Imagen de Fondo</label>
                  {categoryForm.image && <img src={categoryForm.image} alt="Cat Preview" className="h-16 w-full object-cover rounded-lg border mb-1" />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setCategoryForm({ ...categoryForm, image: url }))}
                    className="text-xs w-full"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full font-bold py-3 rounded-xl transition-colors text-sm shadow-md text-white ${editingCategoryId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {editingCategoryId ? 'Actualizar Categoría' : 'Guardar Categoría'}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditCategory(cat)}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Editar categoría"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. BRANDING */}
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

  function setNewProductFormImages(updated: string[]) {
    setProductForm({ ...productForm, images: updated });
  }
}