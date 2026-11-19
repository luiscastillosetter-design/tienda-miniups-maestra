// Anti-autocompra de afiliados: compara los datos del comprador con los del afiliado dueño del código.

export interface AffiliateIdentity {
  codigo?: string;
  email?: string;
  telefono?: string;
  cedula?: string;
}

export interface BuyerIdentity {
  telefono?: string;
  email?: string;
  cedula?: string;
}

export const digitsOnly = (v?: string) => String(v ?? '').replace(/\D/g, '');
const normEmail = (v?: string) => String(v ?? '').trim().toLowerCase();
// Cédula/RIF: solo letras y dígitos, en minúscula (V-123 == v123)
const normDoc = (v?: string) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Teléfonos: compara los últimos 10 dígitos para tolerar prefijos (+58 / 0).
const samePhone = (a?: string, b?: string) => {
  const x = digitsOnly(a);
  const y = digitsOnly(b);
  if (x.length < 7 || y.length < 7) return false;
  return x.slice(-10) === y.slice(-10);
};

export function isSelfPurchase(
  buyer: BuyerIdentity,
  affiliate: AffiliateIdentity | null | undefined,
  sessionAffiliateCode?: string | null,
  refCode?: string
): boolean {
  if (sessionAffiliateCode && refCode && sessionAffiliateCode.toUpperCase() === refCode.toUpperCase()) return true;
  if (!affiliate) return false;
  if (samePhone(buyer.telefono, affiliate.telefono)) return true;
  if (buyer.email && affiliate.email && normEmail(buyer.email) === normEmail(affiliate.email)) return true;
  if (buyer.cedula && affiliate.cedula && normDoc(buyer.cedula) === normDoc(affiliate.cedula)) return true;
  return false;
}

export const SELF_PURCHASE_NOTICE =
  'Detectamos que esta compra coincide con tus datos de afiliado. Las autocompras con enlace propio no generan descuento ni comisión. Tu pedido se procesará normalmente, sin beneficio de afiliado.';
