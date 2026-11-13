const IMG_LINE = /^\s*!\[([^\]]*)\]\(\s*((?:https?:\/\/|\/|data:image\/)[^)\s]+)\s*\)\s*$/;

type Block = { type: 'text'; text: string } | { type: 'img'; alt: string; url: string };

function parse(description: string): Block[] {
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join('\n').trim();
    if (text) blocks.push({ type: 'text', text });
    buf = [];
  };
  for (const line of description.split('\n')) {
    const m = IMG_LINE.exec(line);
    if (m) {
      flush();
      blocks.push({ type: 'img', alt: m[1] || 'Imagen del producto', url: m[2] });
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

/** Descripción: texto plano con párrafos + imágenes en sintaxis Markdown `![alt](url)` en su propia línea. */
export default function DescriptionContent({ description, className = '' }: { description: string; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {parse(description).map((b, i) =>
        b.type === 'img' ? (
          <img
            key={i}
            src={b.url}
            alt={b.alt}
            loading="lazy"
            className="block w-full max-w-xl mx-auto h-auto rounded-xl border border-slate-200 bg-white shadow-sm"
          />
        ) : (
          <div key={i} className="whitespace-pre-line">{b.text}</div>
        )
      )}
    </div>
  );
}
