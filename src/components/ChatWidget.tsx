'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, ShoppingBag } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Msg = {
  role: 'assistant',
  content:
    '¡Hola! 👋 Soy **María**, asesora de Importadora TodoMax. Te ayudo a encontrar productos, ver precios (también en Bs.) y finalizar tu pedido. ¿Qué estás buscando?',
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

function renderLine(line: string, lineKey: string) {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push(...renderBold(line.slice(last, m.index), `${lineKey}-t${n}`));
    const [, label, url] = m;
    const key = `${lineKey}-l${n++}`;
    if (url.startsWith('/')) {
      out.push(
        <Link
          key={key}
          href={url}
          className="inline-flex items-center gap-1 font-bold text-orange-600 underline decoration-orange-300 hover:text-orange-700"
        >
          <ShoppingBag className="w-3 h-3" />
          {label}
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
          {label}
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
            <span>{renderLine(line, `m${i}`)}</span>
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
      if (sessionStorage.getItem('maria_hidden') === '1') setHidden(true);
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
      sessionStorage.setItem('maria_hidden', '1');
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
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const json = await res.json();
      if (!res.ok || !json?.reply) throw new Error('chat');
      setMessages([...next, { role: 'assistant', content: json.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: 'Disculpa, tuve un problema para responder. Intenta de nuevo en unos segundos 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed z-50 bottom-36 md:bottom-24 right-3 md:right-5 w-[calc(100vw-1.5rem)] max-w-[380px] h-[min(560px,calc(100vh-11rem))] bg-white rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-black">M</div>
              <div>
                <p className="text-sm font-black leading-tight">María</p>
                <p className="text-[11px] text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Asesora TodoMax · en línea
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-gray-200 rounded-bl-md shadow-xs'
                  }`}
                >
                  {m.role === 'user' ? m.content : <MessageContent text={m.content} />}
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
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1" aria-label="María está escribiendo">
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
            className="p-3 border-t bg-white flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              maxLength={500}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div
        ref={bubbleRef}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        className={`fixed z-50 w-14 h-14 ${pos ? '' : 'bottom-20 md:bottom-5 right-3 md:right-5'}`}
      >
        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={open ? 'Cerrar chat con María' : 'Abrir chat con María'}
          style={{ touchAction: 'none' }}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transition-colors active:scale-95 cursor-grab active:cursor-grabbing select-none"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
        <button
          type="button"
          onClick={hideBubble}
          aria-label="Ocultar a María"
          title="Ocultar"
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </>
  );
}
