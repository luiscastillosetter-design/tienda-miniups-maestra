'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { BarChart3, Clock, Megaphone, PackageX, Send, X, ShieldCheck } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Msg = {
  role: 'assistant',
  content:
    '¡Hola! Soy **Sofía Admin** 📊 Te doy reportes con datos reales y en vivo de la tienda. Toca un acceso rápido o escríbeme tu consulta.',
};

const QUICK = [
  { label: 'Reporte del día', prompt: 'Reporte del día', Icon: BarChart3 },
  { label: 'Pedidos pendientes', prompt: 'Pedidos pendientes', Icon: Clock },
  { label: 'Resumen de marketing', prompt: 'Resumen de marketing', Icon: Megaphone },
  { label: 'Productos con stock bajo', prompt: 'Productos con stock bajo', Icon: PackageX },
];

function renderBold(text: string, key: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={`${key}-${i}`}>{part}</Fragment>
    )
  );
}

function MessageContent({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const bullet = /^\s*[-•*]\s+/.test(raw);
        const line = bullet ? raw.replace(/^\s*[-•*]\s+/, '') : raw;
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        return (
          <div key={i} className={bullet ? 'flex gap-1.5 pl-1' : undefined}>
            {bullet && <span className="text-orange-500 font-black">•</span>}
            <span>{renderBold(line, `m${i}`)}</span>
          </div>
        );
      })}
    </>
  );
}

export default function SofiaAdminWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewH, setViewH] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  // Móvil: pantalla completa ajustada al visualViewport (teclado) y sin scroll del body.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const prevOverflow = document.body.style.overflow;
    const vv = window.visualViewport;
    const sync = () => {
      document.body.style.overflow = mq.matches ? 'hidden' : prevOverflow;
      setViewH(mq.matches && vv ? Math.round(vv.height) : null);
      if (mq.matches) window.scrollTo(0, 0);
    };
    sync();
    mq.addEventListener('change', sync);
    vv?.addEventListener('resize', sync);
    return () => {
      mq.removeEventListener('change', sync);
      vv?.removeEventListener('resize', sync);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      if (res.status === 401) {
        setMessages([
          ...next,
          {
            role: 'assistant',
            content:
              '🔒 Tu sesión de servidor no está activa. Cierra sesión en el panel y vuelve a ingresar tu contraseña para usar Sofía Admin.',
          },
        ]);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json?.reply) throw new Error('chat');
      setMessages([...next, { role: 'assistant', content: json.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Tuve un inconveniente consultando los datos 🙏 Intenta de nuevo en unos segundos.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Sofía Admin"
          style={viewH ? ({ '--chat-h': `${viewH}px` } as React.CSSProperties) : undefined}
          className="fixed inset-0 w-full h-[var(--chat-h,100dvh)] z-[9999] bg-white flex flex-col overflow-hidden md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[620px] md:max-h-[calc(100vh-3rem)] md:rounded-2xl md:border md:border-gray-200 md:shadow-2xl"
        >
          <div className="shrink-0 bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black leading-tight truncate">Sofía Admin — Reportes y Gestión</p>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Datos reales en vivo · Solo administración
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar Sofía Admin"
              className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:rotate-90 active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="shrink-0 flex gap-2 overflow-x-auto px-3 py-2 bg-indigo-50 border-b border-indigo-100 [scrollbar-width:none]">
            {QUICK.map(({ label, prompt, Icon }) => (
              <button
                key={label}
                type="button"
                disabled={loading}
                onClick={() => send(prompt)}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 px-3 py-2 rounded-full cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-gray-200 rounded-bl-md shadow-xs'
                  }`}
                >
                  {m.role === 'user' ? m.content : <MessageContent text={m.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1" aria-label="Sofía Admin está consultando">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3 border-t bg-white flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta por ventas, stock, marketing..."
              maxLength={500}
              className="flex-1 min-w-0 px-4 py-2.5 bg-slate-100 rounded-full text-base md:text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir Sofía Admin"
          className="fixed z-50 bottom-5 right-4 md:right-5 h-14 pl-4 pr-5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/40 flex items-center gap-2 font-black text-sm transition-colors active:scale-95 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" /> Sofía Admin
        </button>
      )}
    </>
  );
}
