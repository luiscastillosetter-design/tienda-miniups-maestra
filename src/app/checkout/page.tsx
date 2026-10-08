'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { siteConfig } from '@/config/site';
import BackButton from '@/components/BackButton';

export default function CheckoutPage() {
  const { items } = useCartStore();
  const router = useRouter();

  // Contacto
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');

  // Envío
  const [courier, setCourier] = useState('MRW');
  const [estado, setEstado] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');

  // Pago
  const [metodoPago, setMetodoPago] = useState('Zelle');
  const [refCode, setRefCode] = useState('DIRECTO');

  useEffect(() => {
    const storedRef = localStorage.getItem('todomax_ref');
    if (storedRef) {
      setRefCode(storedRef);
    }
  }, []);

  const subtotalPorItem = (price: number, quantity: number) => price * quantity;
  const total = items.reduce((acc, item) => acc + subtotalPorItem(item.price, item.quantity), 0);

  const enviarPedidoWhatsApp = () => {
    const listaProductos = items
      .map(
        (item) =>
          `- ${item.title} (x${item.quantity}) - ${siteConfig.currencySymbol}${subtotalPorItem(item.price, item.quantity).toFixed(2)}`
      )
      .join('%0A');

    // Mensaje limpio en texto plano sin emojis corruptibles
    const mensaje =
      `Hola, quiero realizar este pedido:%0A%0A` +
      `[PRODUCTOS]:%0A${listaProductos}%0A%0A` +
      `[TOTAL]: ${siteConfig.currencySymbol}${total.toFixed(2)}%0A%0A` +
      `[CLIENTE]: ${nombre} ${apellido}%0A` +
      `[TELEFONO]: ${telefono}%0A` +
      `[ENVIO]: ${courier} - ${estado}, ${ciudad}. ${direccion}%0A` +
      `[PAGO]: ${metodoPago}` +
      (refCode !== 'DIRECTO' ? `%0A%0A[REF]: ${refCode}` : '');

    const rawWhatsApp = siteConfig.whatsapp?.number || siteConfig.whatsappNumber || '';
    const whatsappNum = String(rawWhatsApp).replace(/\D/g, '');

    window.open(`https://wa.me/${whatsappNum}?text=` + mensaje, '_blank');
  };

  const handleConfirmarPedido = () => {
    if (!nombre.trim() || !apellido.trim() || !telefono.trim() || !estado.trim() || !ciudad.trim() || !direccion.trim()) {
      alert('Por favor completa todos los campos obligatorios antes de confirmar tu pedido.');
      return;
    }
    if (items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    enviarPedidoWhatsApp();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h2>
        <button
          onClick={() => router.push('/')}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <BackButton label="Volver a la tienda" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-4">
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <h1 className="text-xl font-bold text-slate-900 border-b pb-3">
              Detalles de Facturación y Envío
            </h1>

            {/* Contacto */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre *"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                />
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido *"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono / WhatsApp *"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition sm:col-span-2"
                />
              </div>
            </div>

            {/* Envío */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Envío</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Courier</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                  >
                    <option value="MRW">MRW</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Delivery Local">Delivery Local</option>
                    <option value="Retiro en Tienda">Retiro en Tienda</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="Estado *"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                  />
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ciudad *"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                  />
                </div>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección detallada (Calle, casa, edificio) *"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Pago */}
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Método de Pago</h2>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition"
              >
                <option value="Zelle">Zelle</option>
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Binance Pay">Binance Pay</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DE ORDEN */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs sticky top-24 h-fit space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Resumen de tu Orden</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                    <div>
                      <span className="font-medium text-slate-800 line-clamp-1">{item.title}</span>
                      <span className="text-xs text-gray-500 block">Cant: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {siteConfig.currencySymbol}{subtotalPorItem(item.price, item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xl font-bold text-slate-900">
              <span>Total Final</span>
              <span className="text-orange-500 text-2xl">
                {siteConfig.currencySymbol}{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleConfirmarPedido}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full py-4 rounded-xl font-bold text-lg transition-colors cursor-pointer shadow-sm"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}