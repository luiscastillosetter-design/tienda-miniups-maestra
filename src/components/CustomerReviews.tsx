'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, X } from 'lucide-react';

interface Review {
  id: string | number;
  customer_name: string;
  city?: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

function Stars({ value, size = 'w-4 h-4' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `Hace ${w} ${w === 1 ? 'semana' : 'semanas'}`;
  }
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && Array.isArray(d.reviews)) setReviews(d.reviews);
      })
      .catch(() => {});
  }, []);

  const total = reviews.length;
  const average = total ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / total) * 10) / 10 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: name, city, rating, comment, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'No se pudo enviar tu opinión.');
        return;
      }
      if (data?.review) setReviews(prev => [data.review, ...prev]);
      setName('');
      setCity('');
      setComment('');
      setRating(5);
      setShowForm(false);
      setThanks(true);
      setTimeout(() => setThanks(false), 6000);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

  return (
    <section className="w-full" id="opiniones">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5 md:mb-8">
        <div>
          <span className="text-orange-500 font-black text-xs uppercase tracking-wider">Opiniones de Clientes</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Lo que dicen nuestros clientes</h2>
          {total > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Stars value={average} size="w-5 h-5" />
              <span className="text-sm font-bold text-slate-800">{average.toFixed(1)} / 5</span>
              <span className="text-xs text-slate-500">basado en {total} {total === 1 ? 'opinión' : 'opiniones'}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowForm(s => !s)}
          className="inline-flex items-center justify-center gap-2 self-start md:self-auto rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-orange-600 active:scale-95"
        >
          {showForm ? <X className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
          {showForm ? 'Cerrar' : 'Escribir una opinión'}
        </button>
      </div>

      {thanks && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> ¡Gracias por tu opinión! Ya aparece publicada.
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="relative mb-6 md:mb-8 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xs space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1.5">Tu calificación</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star className={`w-8 h-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={60} required />
            <input className={inputCls} placeholder="Ciudad (opcional)" value={city} onChange={e => setCity(e.target.value)} maxLength={40} />
          </div>
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            placeholder="Cuéntanos tu experiencia (mínimo 10 caracteres)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            minLength={10}
            maxLength={400}
            required
          />

          {/* Honeypot anti-bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{comment.length}/400</span>
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-60"
            >
              {sending ? 'Enviando...' : 'Publicar opinión'}
            </button>
          </div>
        </form>
      )}

      {total === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Aún no hay opiniones. ¡Sé el primero en compartir tu experiencia!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {reviews.map(r => (
            <article
              key={r.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 md:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{r.customer_name}</p>
                  {r.city && <p className="truncate text-xs text-slate-500">{r.city}</p>}
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatDate(r.created_at)}</span>
              </div>
              <Stars value={r.rating} />
              <p className="break-words text-sm leading-relaxed text-slate-700">{r.comment}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
