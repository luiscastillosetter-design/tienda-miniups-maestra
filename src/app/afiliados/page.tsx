'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';

type FormData = {
  nombre: string;
  email: string;
  codigo: string;
};

// 👇 COLOCA AQUÍ EL NÚMERO DE WHATSAPP DONDE ESTÁ SOFÍA (con código de país, sin el +)
const WHATSAPP_NUMERO = "17543411559"; 

export default function Afiliados() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    codigo: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [waLink, setWaLink] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Armamos el mensaje que recibirá Sofía
    const mensaje = `Hola Sofía 🤖, quiero unirme al programa de embajadores para vender productos.\n\n*Mis datos de registro:*\n👤 Nombre: ${formData.nombre}\n📧 Email: ${formData.email}\n🎟️ Código deseado: ${formData.codigo.toUpperCase()}\n\n¡Estoy listo para recibir mi kit y empezar a vender!`;
    
    // Codificamos el mensaje para URL
    const link = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    setWaLink(link);
    setSubmitted(true);

    // Abrimos WhatsApp en una nueva pestaña
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 md:pt-36 pb-20">
      {/* Encabezado */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-xs font-black rounded-full uppercase tracking-widest mb-4">
            Programa de Embajadores
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Únete a nuestro equipo de ventas
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium max-w-lg mx-auto">
            Comparte tu código personalizado y gana comisiones atractivas por cada compra que hagan tus clientes.
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-12">
        <div className="max-w-md mx-auto">
          {!submitted ? (
            <div className="bg-white border border-gray-100 shadow-xl shadow-slate-200/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    placeholder="Tu nombre y apellido"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Crea tu código de afiliado personalizado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-gray-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold uppercase"
                    placeholder="EJ: MARIA2024"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Este es el código que compartirás con tus clientes. Úsalo sin espacios.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                >
                  Continuar en WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 shadow-xl shadow-slate-200/40 rounded-3xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                ¡Petición Generada!
              </h2>
              <p className="text-slate-600 mb-8 font-medium">
                Se ha abierto una ventana a WhatsApp. Nuestra asistente virtual <strong className="text-slate-900">Sofía</strong> te está esperando para enviarte tu Kit de Ventas.
              </p>

              <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 mb-8 text-left space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen de tu solicitud</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Nombre:</span>
                  <span className="font-bold text-slate-900">{formData.nombre}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Código deseado:</span>
                  <span className="font-black text-orange-500">{formData.codigo.toUpperCase()}</span>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-black text-white bg-[#25D366] hover:bg-[#20BD5A] shadow-md transition-all flex items-center justify-center gap-2 mb-4"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp de nuevo
              </a>

              <button
                onClick={() => setSubmitted(false)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Modificar mis datos
              </button>
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver al catálogo principal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}