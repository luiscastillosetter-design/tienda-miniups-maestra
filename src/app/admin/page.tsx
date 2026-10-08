'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', image: '', category: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Clave de acceso rápida para el cliente (puedes cambiarla por la que prefieras)
  const ADMIN_PIN = '1234'; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    // Cargar productos de prueba o de tu estado actual
    setProducts([
      { id: 1, title: 'Producto Destacado 1', price: 45.00, category: 'General' },
      { id: 2, title: 'Producto Destacado 2', price: 60.00, category: 'General' },
    ]);
  }, []);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const productToAdd = {
      id: Date.now(),
      title: newProduct.title,
      price: parseFloat(newProduct.price),
      category: newProduct.category || 'General',
    };

    setProducts([productToAdd, ...products]);
    setNewProduct({ title: '', price: '', image: '', category: '' });
    setSuccessMsg('¡Producto agregado con éxito!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex justify-center mb-4 text-orange-500">
            <Lock size={40} />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Panel de Administración</h1>
          <p className="text-sm text-slate-500 text-center mb-6">Ingresa la clave de acceso para gestionar la tienda.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Contraseña (ej: 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold"
            />
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              Entrar al Panel
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
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header del Admin */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-900">Admin - Todomax</h1>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Modo Llave en Mano</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-orange-500">Ver Tienda</Link>
          <button
            onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
            className="text-sm font-semibold text-red-500 hover:text-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {successMsg && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="text-green-500" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formulario para agregar productos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-orange-500" /> Agregar Producto
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
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="49.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
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
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-md"
              >
                Guardar y Publicar
              </button>
            </form>
          </div>

          {/* Listado de productos actuales */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Inventario Actual ({products.length})</h2>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{product.title}</h3>
                    <p className="text-xs text-slate-500">${product.price.toFixed(2)} • <span className="text-orange-600 font-semibold">{product.category}</span></p>
                  </div>
                  <button
                    onClick={() => handleDelete(product.id)}
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
      </div>
    </main>
  );
}