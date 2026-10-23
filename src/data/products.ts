export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number; // Para mostrar tachado
  cost: number; // Para calcular la utilidad en el Admin
  stock: number;
  badge?: string;
  isBestSeller?: boolean;
  isCombo?: boolean;
  affiliateCommission: number; // Porcentaje o monto fijo
  images: string[];
  demoVideo?: string;
  description: string;
  features: string[];
  benefits: string[]; // Beneficios rápidos para la ficha
  adCopy?: string; // Texto preaprobado para que el afiliado copie y pegue
  paymentMethods: string[];
  category: string;
}

// Generador de Placeholder seguro (SVG en base64 con colores de la marca)
const getPlaceholder = (text: string) => {
  const cleanText = text.replace(/\s+/g, '%20');
  return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' style='background:%23f8fafc'%3E%3Crect width='100%25' height='100%25' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' font-weight='bold' fill='%23f97316'%3E${cleanText}%3C/text%3E%3C/svg%3E`;
};

export const products: Product[] = [
  {
    id: 'combo-hogar-inteligente',
    title: 'Combo Hogar Inteligente (Aspiradora + Humidificador)',
    price: 85.00,
    originalPrice: 120.00,
    cost: 45.00,
    stock: 50,
    badge: 'Envío Gratis',
    isBestSeller: true,
    isCombo: true,
    affiliateCommission: 10,
    category: 'Hogar',
    images: [getPlaceholder('FOTO HOGAR 1'), getPlaceholder('FOTO HOGAR 2')],
    demoVideo: '',
    description: 'Moderniza tu hogar con este combo indispensable. Mantén tus espacios limpios y purificados sin esfuerzo.',
    features: ['Aspiradora recargable', 'Humidificador 500ml', 'Control por app'],
    benefits: ['Ahorra tiempo en limpieza', 'Mejora la calidad del aire', 'Fácil de usar'],
    adCopy: '¡Transforma tu hogar hoy! Llevate este combo con envío gratis. Compra aquí: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay', 'Transferencia Bancaria'],
  },
  {
    id: 'mini-ups-smart-12v',
    title: 'Mini UPS Smart 12V para Router',
    price: 35.00,
    cost: 18.00,
    stock: 120,
    badge: 'Oferta',
    isBestSeller: true,
    isCombo: false,
    affiliateCommission: 5,
    category: 'Tecnología',
    images: [getPlaceholder('FOTO UPS 1')],
    description: 'Mantén tu internet encendido durante cortes eléctricos. Batería de larga duración.',
    features: ['Voltaje: 12V DC', 'Capacidad: 2000mAh', 'Tiempo de respaldo: 4-6 horas'],
    benefits: ['Internet sin interrupciones', 'Protege tu router', 'Tamaño portátil'],
    adCopy: '¿Se fue la luz? ¡No te quedes sin internet! Consigue tu Mini UPS aquí: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay'],
  },
  {
    id: 'freidora-aire-digital',
    title: 'Freidora de Aire Digital 6L',
    price: 65.00,
    originalPrice: 90.00,
    cost: 35.00,
    stock: 30,
    badge: 'Envío Gratis',
    isBestSeller: false,
    isCombo: false,
    affiliateCommission: 8,
    category: 'Cocina',
    images: [getPlaceholder('FOTO COCINA 1')],
    description: 'Cocina saludable sin aceite. Gran capacidad para toda la familia.',
    features: ['Capacidad: 6 Litros', 'Panel Táctil Digital', '10 programas preestablecidos'],
    benefits: ['Comida más saludable', 'Cocción rápida', 'Fácil de lavar'],
    adCopy: 'Cocina rico y sano en minutos con nuestra freidora de 6L. Pídela hoy: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay', 'Transferencia Bancaria'],
  },
  {
    id: 'aspiradora-auto-portatil',
    title: 'Aspiradora Portátil para Automóvil',
    price: 25.00,
    cost: 12.00,
    stock: 200,
    badge: 'Popular',
    isBestSeller: true,
    isCombo: false,
    affiliateCommission: 4,
    category: 'Automóvil',
    images: [getPlaceholder('FOTO AUTO 1')],
    description: 'Limpia cada rincón de tu vehículo fácilmente. Alta potencia de succión.',
    features: ['Conexión 12V (Cigarrera)', 'Filtro lavable', 'Accesorios para esquinas'],
    benefits: ['Auto siempre impecable', 'Llega a lugares difíciles', 'No ocupa espacio'],
    adCopy: 'Mantén tu carro como nuevo con nuestra aspiradora portátil. Compra la tuya: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay'],
  },
  {
    id: 'secador-cepillo-2en1',
    title: 'Cepillo Secador Voluminizador 2 en 1',
    price: 22.00,
    originalPrice: 35.00,
    cost: 10.00,
    stock: 80,
    badge: 'Descuento',
    isBestSeller: false,
    isCombo: false,
    affiliateCommission: 3,
    category: 'Belleza',
    images: [getPlaceholder('FOTO BELLEZA 1')],
    description: 'Seca y peina tu cabello al mismo tiempo, logrando volumen de salón en casa.',
    features: ['3 niveles de temperatura', 'Recubrimiento cerámico', 'Cerdas mixtas antienredos'],
    benefits: ['Ahorra tiempo arreglándote', 'Cuida tu cabello', 'Volumen espectacular'],
    adCopy: '¡Logra un secado de peluquería en casa! Pide tu cepillo 2 en 1 aquí: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay'],
  },
  {
    id: 'proyector-galaxia-led',
    title: 'Proyector de Galaxia LED (Viral TikTok)',
    price: 28.00,
    cost: 14.00,
    stock: 150,
    badge: 'Viral',
    isBestSeller: true,
    isCombo: false,
    affiliateCommission: 5,
    category: 'Productos Virales',
    images: [getPlaceholder('FOTO VIRAL 1')],
    description: 'Transforma cualquier habitación en un espectáculo espacial. Ideal para regalos o decoración.',
    features: ['Control remoto incluido', 'Altavoz Bluetooth', 'Múltiples colores y efectos'],
    benefits: ['Ambiente relajante', 'Ideal para dormir', 'Sincroniza con tu música'],
    adCopy: 'El proyector que está rompiendo TikTok ya está en TodoMax. Consíguelo aquí: [ENLACE]',
    paymentMethods: ['Pago Móvil', 'Zelle', 'Binance Pay'],
  }
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProductIds(): string[] {
  return products.map((product) => product.id);
}