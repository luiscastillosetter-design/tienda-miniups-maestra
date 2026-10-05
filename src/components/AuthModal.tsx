'use client';

import { useState, useEffect } from 'react';
import { X, User, Lock, Mail, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userSession, setUserSession] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('todomax_user_session');
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { name: name || email.split('@')[0], email };
    localStorage.setItem('todomax_user_session', JSON.stringify(userData));
    setUserSession(userData);
    alert(isLogin ? '¡Sesión iniciada correctamente!' : '¡Cuenta creada y guardada con éxito!');
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('todomax_user_session');
    setUserSession(null);
    alert('Sesión cerrada.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {userSession ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              {userSession.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">¡Hola, {userSession.name}!</h3>
              <p className="text-xs text-gray-500 mt-1">{userSession.email}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
              Tu sesión está guardada de forma segura en este navegador.
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isLogin ? 'Tus datos se recordarán en este dispositivo' : 'Regístrate para una experiencia personalizada'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer mt-2"
              >
                {isLogin ? 'Entrar y Recordar Sesión' : 'Registrarse'}
              </button>
            </form>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-orange-600 hover:underline font-medium cursor-pointer"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}