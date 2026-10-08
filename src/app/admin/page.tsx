'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, ArrowLeft, CheckCircle, Image as ImageIcon, Settings, ShoppingBag, Layers, Sliders } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'ofertas' | 'categories' | 'branding'>('products');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados de datos editables
  const [storeName, setStoreName] = useState('Todomax');
  const [logoUrl, setLogoUrl] = useState('/logo-todomax.png');
  
  // Productos (Soporte multicategoría y múltiples imágenes)
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    category: 'General',
    images: ['', '', '', ''] // Hasta 4 imágenes
  });

  // Carrusel Hero
  const [heroSlides, setHeroSlides] = useState<any[]>([
    { id: 1, title: 'Banner Principal 1', desktopImg: '/hero/slide1-desktop.jpg', mobileImg: '/hero/slide1-mobile.jpg' }
  ]);
  const [newHero, setNewHero] = useState({ title: '', desktopImg: '', mobileImg: '' });

  // Categorías
  const [categories, setCategories] = useState<any[]>([
    { id: 1, name: 'Herramientas', image: '/categories/herramientas.jpg' }
  ]);
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });

  // Contraseña de acceso requerida: Admin1234.
  const ADMIN_PIN = 'Admin1234.'; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Contraseña incorrecta. Utilice Admin1234.');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    // Cargar datos iniciales o desde localStorage si existen
    const savedProducts = localStorage.getItem('admin_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      setProducts([
        { id: 1, title: 'Taladro Inalámbrico Profesional', price: 45.00, category: 'Herramientas', images: ['/products/taladro1.jpg', '', '', ''] },
        { id: 2, title: 'Set de Llaves Allen', price: 15.00, category: 'Herramientas', images: ['/products/llaves1.jpg', '', '', ''] }
      ]);
    }
  }, []);

  const saveProductsToStorage = (updatedProducts: any[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const productToAdd = {
      id: Date.now(),
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      images: newProduct.images.filter(img => img !== '')
    };

    saveProductsToStorage([productToAdd, ...products]);
    setNewProduct({ title: '', price: '', category: 'General', images: ['', '', '', ''] });
    setSuccessMsg('¡Producto agregado y guardado con éxito!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteProduct = (id: number) => {
    saveProductsToStorage(products.filter(p => p.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-4 text-orange-500">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Panel de Control Admin</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Ingresa la contraseña segura para administrar la tienda.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña (Admin1234.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              Acceder al Super Panel
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
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-900">Admin - {storeName}</h1>
          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">Modo Autonomía Total</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-orange-500">Ver Tienda en Vivo</Link>
          <button
            onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
            className="text-sm font-semibold text-red-500 hover:text-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Menú de pestañas */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex gap-2 overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <ShoppingBag size={18} /> Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'hero' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Sliders size={18} /> Carrusel Hero
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            <Layers size={18} /> Categorías
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'branding' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
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

        {/* PESTAÑA: PRODUCTOS */}
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
                    placeholder="Ej. Taladro Inalámbrico"
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
                      placeholder="Ej. Herramientas"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Subida de Múltiples Imágenes (hasta 4) */}
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
                                const updatedImages = [...newProduct.images];
                                updatedImages[index] = '';
                                setNewProduct({ ...newProduct, images: updatedImages });
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
                                const updatedImages = [...newProduct.images];
                                updatedImages[index] = url;
                                setNewProduct({ ...newProduct, images: updatedImages });
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
                  Guardar Producto en la Tienda
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Inventario Actual de Productos</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No hay productos cargados todavía.</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">Sin Foto</div>
                        )}
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{product.title}</h3>
                          <p className="text-xs text-slate-500">${product.price.toFixed(2)} • <span className="text-orange-600 font-semibold">{product.category}</span></p>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{product.images?.filter(Boolean).length || 0} imágenes cargadas</span>
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: HERO / CARRUSEL */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Gestión de Tarjetas del Carrusel Hero (Escritorio y Móvil)</h2>
            <p className="text-sm text-slate-500 mb-6">Aquí puedes agregar nuevas tarjetas o modificar las imágenes que se muestran en el carrusel principal de la página de inicio para cada formato.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 space-y-3">
                <h3 className="font-bold text-sm text-slate-700">Agregar Nueva Tarjeta al Carrusel</h3>
                <input
                  type="text"
                  placeholder="Título o Referencia del Banner"
                  value={newHero.title}
                  onChange={(e) => setNewHero({ ...newHero, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Imagen Desktop</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setNewHero({ ...newHero, desktopImg: url }))}
                      className="text-xs w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Imagen Móvil</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setNewHero({ ...newHero, mobileImg: url }))}
                      className="text-xs w-full"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!newHero.title) return;
                    setHeroSlides([...heroSlides, { id: Date.now(), ...newHero }]);
                    setNewHero({ title: '', desktopImg: '', mobileImg: '' });
                    setSuccessMsg('¡Tarjeta de carrusel añadida!');
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-sm"
                >
                  Añadir al Carrusel
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-700">Banners Activos ({heroSlides.length})</h3>
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-xs">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{slide.title}</h4>
                      <span className="text-xs text-slate-400">Configurado para Desktop y Móvil</span>
                    </div>
                    <button
                      onClick={() => setHeroSlides(heroSlides.filter(s => s.id !== slide.id))}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: CATEGORÍAS */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Gestión de Categorías del Catálogo</h2>
            <p className="text-sm text-slate-500 mb-6">Administra las tarjetas de categorías que aparecen en la tienda.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-4 rounded-xl bg-slate-50 space-y-3">
                <h3 className="font-bold text-sm text-slate-700">Nueva Categoría</h3>
                <input
                  type="text"
                  placeholder="Nombre de la Categoría"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, (url) => setNewCategory({ ...newCategory, image: url }))}
                  className="text-xs w-full"
                />
                <button
                  onClick={() => {
                    if (!newCategory.name) return;
                    setCategories([...categories, { id: Date.now(), ...newCategory }]);
                    setNewCategory({ name: '', image: '' });
                    setSuccessMsg('¡Categoría creada!');
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }}
                  className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg text-sm"
                >
                  Guardar Categoría
                </button>
              </div>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white border rounded-xl">
                    <span className="font-bold text-sm text-slate-800">{cat.name}</span>
                    <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: BRANDING Y LOGO */}
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
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Logotipo de la Tienda</label>
                <div className="flex items-center gap-4">
                  <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain border rounded-lg p-1 bg-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setLogoUrl(url))}
                    className="text-xs"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  setSuccessMsg('¡Cambios de marca guardados con éxito!');
                  setTimeout(() => setSuccessMsg(''), 3000);
                }}
                className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm"
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