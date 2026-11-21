'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { MessageCircle, X, Send, ShoppingBag, ExternalLink } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Msg = {
  role: 'assistant',
  content:
    '¡Hola! 👋 Soy **Sofía**, de Importadora TodoMax. ¿En qué puedo ayudarte hoy?',
};

const QUICK = [
  'Ver productos disponibles',
  '¿Cuál es la tasa BCV?',
  'Hablar con Administración por WhatsApp',
];

/** Renderiza **negrita** dentro de una línea. */
function renderBold(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
    )
  );
}

function getSessionId() {
  try {
    let id = localStorage.getItem('sofia_sid');
    const stamp = Number(localStorage.getItem('sofia_sid_t') || 0);
    if (!id || Date.now() - stamp > 24 * 60 * 60 * 1000) {
      id = crypto.randomUUID();
      localStorage.setItem('sofia_sid', id);
      localStorage.setItem('sofia_sid_t', String(Date.now()));
    }
    return id;
  } catch {
    return '';
  }
}

const SITE_ORIGIN_RE = /^https?:\/\/(www\.)?importadoratodomax\.com/i;

function renderLine(line: string, lineKey: string, onNavigate: () => void) {
  const out: React.ReactNode[] = [];
  // Enlaces Markdown [Texto](url) o URLs sueltas https://... (respaldo).
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(...renderBold(line.slice(last, m.index), `${lineKey}-t${n}`));
    const label = m[1] ?? m[3];
    let url = m[2] ?? m[3];
    const key = `${lineKey}-l${n++}`;
    if (SITE_ORIGIN_RE.test(url)) url = url.replace(SITE_ORIGIN_RE, '') || '/';
    if (url.startsWith('/')) {
      out.push(
        <Link
          key={key}
          href={url}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 font-bold text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-700"
        >
          <ShoppingBag className="w-3 h-3 shrink-0" />
          {m[1] ? label : 'Ver en la tienda'}
          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
        </Link>
      );
    } else if (/^https:\/\/wa\.me\//.test(url)) {
      out.push(
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-1 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md no-underline"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {label}
        </a>
      );
    } else if (/^https:\/\//.test(url)) {
      out.push(
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-orange-600 underline">
          {m[1] ? label : url}
        </a>
      );
    } else {
      out.push(<Fragment key={key}>{label}</Fragment>);
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(...renderBold(line.slice(last), `${lineKey}-e`));
  return out;
}

function MessageContent({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <>
      {text.split('\n').map((raw, i) => {
        const bullet = /^\s*[-•*]\s+/.test(raw);
        const line = bullet ? raw.replace(/^\s*[-•*]\s+/, '') : raw;
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        return (
          <div key={i} className={bullet ? 'flex gap-1.5 pl-1' : undefined}>
            {bullet && <span className="text-orange-500 font-black">•</span>}
            <span>{renderLine(line, `m${i}`, onNavigate)}</span>
          </div>
        );
      })}
    </>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const BUBBLE = 56;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [hidden, setHidden] = useState(false);
  const drag = useRef({ active: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('sofia_hidden') === '1') setHidden(true);
    } catch {}
  }, []);

  useEffect(() => {
    const onResize = () =>
      setPos((p) =>
        p
          ? {
              x: Math.min(Math.max(0, p.x), window.innerWidth - BUBBLE),
              y: Math.min(Math.max(0, p.y), window.innerHeight - BUBBLE),
            }
          : p
      );
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  // Avisa a otros widgets (toasts) y bloquea el scroll del body en móvil mientras el chat está abierto.
  const [viewH, setViewH] = useState<number | null>(null);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sofia-chat', { detail: { open } }));
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
      window.dispatchEvent(new CustomEvent('sofia-chat', { detail: { open: false } }));
    };
  }, [open]);

  if (pathname?.startsWith('/admin') || hidden) return null;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = { active: true, moved: false, sx: e.clientX, sy: e.clientY, ox: rect.left, oy: rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) <= 5) return;
    d.moved = true;
    setPos({
      x: Math.min(Math.max(0, d.ox + dx), window.innerWidth - BUBBLE),
      y: Math.min(Math.max(0, d.oy + dy), window.innerHeight - BUBBLE),
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d.moved) setOpen((o) => !o);
  };

  const hideBubble = () => {
    setOpen(false);
    setHidden(true);
    try {
      sessionStorage.setItem('sofia_hidden', '1');
    } catch {}
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1), sessionId: getSessionId() }),
      });
      const json = await res.json();
      if (!res.ok || !json?.reply) throw new Error('chat');
      setMessages([...next, { role: 'assistant', content: json.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `Disculpa, tuve un breve inconveniente 🙏 Puedes ver el [catálogo](/catalogo) o escribirle a administración: [Hablar por WhatsApp](https://wa.me/${siteConfig.whatsapp.number.replace(/\D/g, '')})`,
        },
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
          aria-label="Chat con Sofía"
          style={viewH ? ({ '--chat-h': `${viewH}px` } as React.CSSProperties) : undefined}
          className="fixed inset-0 w-full h-[var(--chat-h,100dvh)] z-[9999] bg-white flex flex-col overflow-hidden md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:max-h-[calc(100vh-3rem)] md:rounded-2xl md:border md:border-gray-200 md:shadow-2xl"
        >
          <div className="shrink-0 bg-slate-900 text-white px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-orange-500 flex items-center justify-center font-black">S</div>
              <div className="min-w-0">
                <p className="text-sm font-black leading-tight truncate">
                  Sofía<span className="md:hidden"> — Importadora TodoMax</span>
                </p>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En línea
                  <span className="hidden md:inline"> · Asesora TodoMax</span>
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${siteConfig.whatsapp.sofiaNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hola Sofía, vengo de la web de Importadora TodoMax')}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Chatear con Sofía por WhatsApp (${siteConfig.whatsapp.sofiaNumber})`}
              className="ml-auto shrink-0 inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1.5 rounded-full no-underline transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:rotate-90 active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-gray-200 rounded-bl-md shadow-xs'
                  }`}
                >
                  {m.role === 'user' ? m.content : <MessageContent text={m.content} onNavigate={() => setOpen(false)} />}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="text-xs font-bold bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-full cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1" aria-label="Sofía está escribiendo">
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
              placeholder="Escribe tu mensaje..."
              maxLength={500}
              className="flex-1 min-w-0 px-4 py-2.5 bg-slate-100 rounded-full text-base md:text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 shrink-0 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div
        ref={bubbleRef}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        className={`fixed z-50 w-14 h-14 ${pos ? '' : 'bottom-20 md:bottom-5 right-3 md:right-5'} ${open ? 'hidden' : ''}`}
      >
        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={open ? 'Cerrar chat con Sofía' : 'Abrir chat con Sofía'}
          style={{ touchAction: 'none' }}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-colors active:scale-95 cursor-grab active:cursor-grabbing select-none"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
        <button
          type="button"
          onClick={hideBubble}
          aria-label="Ocultar a Sofía"
          title="Ocultar"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </>
  );
}
