export interface Product {
  id: string;
  title: string;
  price: string;
  badge?: string;
  images: string[];
  description: string;
  features: string[];
  paymentMethods: string[];
  category: string;
}

export const products: Product[] = [
  {
    id: 'mini-ups-smart-12v',
    title: 'Mini UPS Smart 12V para Router y Modem',
    price: '35.00',
    badge: 'Oferta',
    category: 'Tecnología / UPS',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1000&auto=format&fit=crop&blur=10&blend=blue',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop&brightness=1.1',
    ],
    description:
      'Mini UPS Smart 12V de última generación diseñado específicamente para mantener operativo tu router y módem en caso de cortes de energía. Con capacidad de batería optimizada, tecnología inteligente de carga y compatibilidad universal con dispositivos 12V.',
    features: [
      'Voltaje: 12V DC',
      'Capacidad: 2000mAh',
      'Tiempo de respaldo: 4-6 horas para router',
      'Carga rápida en 2 horas',
      'LED indicador de estado',
      'Protección contra sobrecarga',
      'Tamaño compacto y portátil',
      'Compatible con múltiples dispositivos',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay'],
  },
  {
    id: 'respaldo-energia-camaras',
    title: 'Respaldo de Energía DC 5V/9V/12V para Cámaras de Seguridad',
    price: '45.00',
    badge: 'Envío Gratis',
    category: 'Tecnología / UPS',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1000&auto=format&fit=crop&saturation=1.2',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop&hue=30',
    ],
    description:
      'Sistema de respaldo de energía profesional multi-voltaje para cámaras de seguridad y sistemas de vigilancia. Proporciona energía continua en caso de cortes, asegurando que tus cámaras sigan operativas las 24 horas.',
    features: [
      'Voltajes múltiples: 5V, 9V, 12V',
      'Capacidad: 5000mAh',
      'Tiempo de respaldo: 8-12 horas',
      'Salida USB y conectores DC',
      'Ideal para sistemas de vigilancia',
      'Batería LiFePO4 de larga duración',
      'Indicadores LED de estado',
      'Gestión térmica inteligente',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay', 'Transferencia Bancaria'],
  },
  {
    id: 'mini-ups-litio-usb',
    title: 'Mini UPS de Litio de Alta Capacidad con Salida USB',
    price: '60.00',
    category: 'Tecnología / UPS',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1000&auto=format&fit=crop&brightness=0.95',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop&contrast=1.2',
    ],
    description:
      'UPS de litio de alta capacidad con tecnología de punta para mantener tus dispositivos conectados durante cortes de energía. Cuenta con múltiples puertos USB para cargar varios dispositivos simultáneamente.',
    features: [
      'Batería de Litio de 10000mAh',
      'Salida USB Tipo-A y USB-C',
      'Voltaje: 5V/2A',
      'Tiempo de carga: 1.5 horas',
      'Tiempo de respaldo: 15-20 horas',
      'Pantalla LED digital',
      'Protección contra cortocircuitos',
      'Peso: 250g',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay'],
  },
  {
    id: 'protector-voltaje-inteligente',
    title: 'Protector de Voltaje Inteligente con Batería Interna',
    price: '28.00',
    badge: 'Envío Gratis',
    category: 'Tecnología / UPS',
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1000&auto=format&fit=crop&grayscale=0.3',
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?q=80&w=1200&auto=format&fit=crop&sepia=0.2',
    ],
    description:
      'Protector de voltaje inteligente con batería interna integrada para proteger tus dispositivos electrónicos de fluctuaciones de energía y mantener el suministro durante apagones.',
    features: [
      'Protección contra sobrevoltaje',
      'Batería interna de 3000mAh',
      'Estabilización automática de voltaje',
      'Entrada: 110-240V AC',
      'Salida regulada: 12V DC',
      'Protección contra cortocircuitos',
      'Indicador de batería baja',
      'Diseño compacto y discreto',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay'],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getAllProductIds(): string[] {
  return products.map((product) => product.id);
}
