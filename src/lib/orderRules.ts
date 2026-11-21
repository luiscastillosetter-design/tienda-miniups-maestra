import { dbService } from '@/services/dbService';
import { siteConfig } from '@/config/site';
import { isSelfPurchase } from '@/lib/affiliateGuard';

/** Pedido NUEVO con código de afiliado: fija la comisión y bloquea la autocompra (se ejecuta siempre en servidor). */
export async function applyAffiliateRules(o: any): Promise<any> {
  const code0 = o?.attribution?.affiliateCode;
  if (!code0 || code0 === 'DIRECTO') return o;

  const affiliates = await dbService.get('store_affiliates');
  const list: any[] = Array.isArray(affiliates) ? affiliates : [];
  const code = String(code0).toUpperCase();
  const affiliate = list.find((a) => String(a?.codigo).toUpperCase() === code);
  const blocked =
    o.attribution.selfPurchaseBlocked === true ||
    isSelfPurchase(
      { telefono: o.customer?.telefono, email: o.customer?.email, cedula: o.customer?.cedula },
      affiliate,
      o.attribution.sessionAffiliateCode,
      code
    );
  const total = Number(o.financials?.total) || 0;
  const cost = Number(o.financials?.cost || 0);
  if (blocked) {
    return {
      ...o,
      financials: { ...o.financials, commission: 0, utility: total - cost },
      attribution: { ...o.attribution, affiliateCode: 'DIRECTO', channel: 'Directo', selfPurchaseBlocked: true, blockedCode: code },
    };
  }
  const commission = total * siteConfig.affiliateCommissionRate;
  return { ...o, financials: { ...o.financials, commission, utility: total - cost - commission } };
}
