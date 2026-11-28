import { adminWaLink } from '@/lib/adminWhatsapp';

const CASHEA_MSG = 'Hola, quiero comprar con Cashea en la tienda virtual de TodoMax. ¿Me pueden guiar?';

export default function CasheaBanner() {
  return (
    <section className="w-full overflow-hidden rounded-3xl bg-slate-900 border-2 border-[#FFE600] shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8 px-5 py-5 md:px-10 md:py-7">
        <div className="flex items-start gap-4 min-w-0">
          <span className="shrink-0 inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#FFE600] text-slate-900 font-black text-2xl">
            C
          </span>
          <div className="min-w-0">
            <span className="text-[#FFE600] font-black text-[11px] uppercase tracking-wider">Cashea · Tienda virtual oficial</span>
            <h2 className="text-xl md:text-3xl font-black text-white leading-tight">Compra en cuotas con Cashea</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-300 font-medium">
              Importadora TodoMax cuenta con tienda virtual oficial en Cashea. Nuestro equipo de administración te guía al instante para concretar tu compra.
            </p>
          </div>
        </div>
        <a
          href={adminWaLink(CASHEA_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto shrink-0 text-center px-6 py-3.5 rounded-2xl bg-[#FFE600] hover:bg-[#FACC15] text-slate-900 font-black text-sm no-underline shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
        >
          Comprar con Cashea por WhatsApp
        </a>
      </div>
    </section>
  );
}
