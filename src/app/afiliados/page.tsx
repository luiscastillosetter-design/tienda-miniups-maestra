'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';

const primaryColor = '#f97316';

type FormData = {
  nombre: string;
  codigoPais: string;
  numero: string;
  email: string;
  codigo: string;
};

type SubmittedData = {
  data: FormData;
  link: string;
};

export default function Afiliados() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigoPais: '+58',
    numero: '',
    email: '',
    codigo: '',
  });
  const [submitted, setSubmitted] = useState<SubmittedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (formData.codigo.length > 2) {
      setCheckingCode(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const api = process.env.NEXT_PUBLIC_API_UBUNTU;
          if (api) {
            const res = await fetch(`${api}/api/validar_afiliado?code=${formData.codigo}`);
            const d = await res.json();
            setCodeAvailable(d?.available === true);
          }
        } catch {
          setCodeAvailable(null);
        } finally {
          setCheckingCode(false);
        }
      }, 500);
    } else {
      setCodeAvailable(null);
    }
  }, [formData.codigo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const telefono = formData.codigoPais + formData.numero;
    setLoading(true);
    try {
      const res = await fetch('/api/afiliados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono,
          codigo: formData.codigo,
        }),
      });
      if (res.ok) {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        setSubmitted({ data: formData, link: `${base}/?ref=${formData.codigo}` });
      } else {
        alert('Ocurrió un error al registrar. Intenta nuevamente.');
      }
    } catch {
      alert('Ocurrió un error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Encabezado de página */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-10 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Programa de Afiliados
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Regístrate y gana 30% por cada referido
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-10">
        <div className="max-w-md mx-auto">
          {!submitted ? (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:opacity-60"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Teléfono integrado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp
                  </label>
                  <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-orange-200 focus-within:border-orange-400 overflow-hidden bg-white transition">
                    <select
                      value={formData.codigoPais}
                      onChange={(e) => setFormData({ ...formData, codigoPais: e.target.value })}
                      disabled={loading}
                      className="px-3 py-2.5 bg-white text-gray-700 border-r border-gray-200 focus:outline-none disabled:opacity-60"
                    >
                      <option value="+58">🇻🇪 +58</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>
                    <input
                      type="tel"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
                      placeholder="4121234567"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:opacity-60"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Código de afiliado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Código de afiliado
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toLowerCase() })}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition disabled:opacity-60"
                    placeholder="ej: juan2024"
                  />
                  <div className="mt-1.5 h-4">
                    {checkingCode && (
                      <p className="text-xs text-gray-400">Comprobando disponibilidad...</p>
                    )}
                    {!checkingCode && codeAvailable === true && (
                      <p className="text-xs text-green-600">✅ Código disponible</p>
                    )}
                    {!checkingCode && codeAvailable === false && (
                      <p className="text-xs text-red-500">❌ Código en uso</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || codeAvailable === false || checkingCode}
                  className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? 'Procesando...' : 'Registrarme'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 sm:p-8 text-center">
              <div className="text-5xl mb-4" style={{ color: primaryColor }}>✓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ¡Registro exitoso!
              </h2>
              <div className="text-left bg-slate-50 border border-gray-200 rounded-lg p-4 mb-6 space-y-2 text-sm text-gray-700">
                <div><span className="font-medium text-gray-900">Nombre:</span> {submitted.data.nombre}</div>
                <div><span className="font-medium text-gray-900">WhatsApp:</span> {submitted.data.codigoPais}{submitted.data.numero}</div>
                <div><span className="font-medium text-gray-900">Email:</span> {submitted.data.email}</div>
                <div><span className="font-medium text-gray-900">Código:</span> {submitted.data.codigo}</div>
                <div className="break-all"><span className="font-medium text-gray-900">Link:</span> {submitted.link}</div>
              </div>
              <button
                onClick={() => setSubmitted(null)}
                className="w-full py-3 rounded-lg font-semibold text-white transition"
                style={{ backgroundColor: primaryColor }}
              >
                Registrar otro afiliado
              </button>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition">
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

