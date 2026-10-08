export interface Product {
  id: string;
  title: string;
  price: number;
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
    price: 35.00,
    badge: 'Oferta',
    category: 'Smart Home',
    images: [
      '/products/minupssmart12vpararouterymodem-smarthome.jpg',
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
    price: 45.00,
    badge: 'Envío Gratis',
    category: 'Smart Home',
    images: [
      '/products/respaldodeenergiadcparacamaras-gadgets.jpg',
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
    price: 60.00,
    category: 'Smart Home',
    images: [
      '/products/miniupsdelitiodealtacapacidadconsalidausb-smarthome.jpg',
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
    price: 28.00,
    badge: 'Envío Gratis',
    category: 'Smart Home',
    images: [
      '/products/protectordevoltajeinteligenteconbateria-smarthome.jpg',
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
  {
    id: 'iphone-15-pro',
    title: 'iPhone 15 Pro Max Titanio 256GB',
    price: 1200.00,
    badge: 'Premium',
    category: 'Phones',
    images: [
      '/products/iphone15promaxtitanio256gb-phones.jpg',
    ],
    description: 'El smartphone premium con pantalla Super Retina XDR, procesador A17 Pro y cámara de 48MP.',
    features: [
      'Pantalla OLED 6.7"',
      'Procesador A17 Pro',
      'Cámara 48MP',
      'Batería 4323mAh',
      'Titanio grado aeronáutico',
      'Resistencia IP68',
      'Almacenamiento 256GB',
      'Sensor de acción',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay'],
  },
  {
    id: 'airpods-pro-2',
    title: 'AirPods Pro (2ª generación) con cancelación activa',
    price: 249.00,
    badge: 'Envío Gratis',
    category: 'Audio',
    images: [
      '/products/airpodspro2dageneracion-audio.jpg',
    ],
    description: 'Auriculares inalámbricos con cancelación de ruido adaptativa y audio espacial inmersivo.',
    features: [
      'Cancelación activa de ruido',
      'Modo transparencia',
      'Audio espacial',
      'Batería 30 horas',
      'Carga rápida',
      'Resistencia IPX4',
      'Micrófono de calidad',
      'Controles adaptados',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay'],
  },
  {
    id: 'ps5-console-edition',
    title: 'PlayStation 5 Edición de Disco 1TB',
    price: 499.00,
    badge: 'Stock Limitado',
    category: 'Gaming',
    images: [
      '/products/playstation5ediciondedisco1tb-gaming.jpg',
    ],
    description: 'Consola de videojuegos de última generación con disco de 1TB y capacidad de juegos físicos.',
    features: [
      'Procesador AMD Ryzen',
      'GPU RDNA 2 10.28 teraflops',
      'RAM 16GB GDDR6',
      'Almacenamiento 1TB SSD',
      'Unidad de disco',
      '4K hasta 120fps',
      'DualSense incluido',
      'Retrocompatibilidad PS4',
    ],
    paymentMethods: ['Pago Móvil', 'Zelle', 'Efectivo', 'Binance Pay', 'Transferencia Bancaria'],
  },
  {
    id: 'smartwatch-ultra-2',
    title: 'Apple Watch Ultra 2 Titanio',
    price: 799.00,
    badge: 'Oferta',
    category: 'Gadgets',
    images: [
      '/products/applewatchultra2titanio-gadgets.jpg',
    ],
    description: 'Reloj inteligente robusto con pantalla grande, autonomía extendida y resistencia extrema.',
    features: [
      'Pantalla LTPO OLED 2.0"',
      'Titanio grado 5',
      'Batería 36 horas',
      'Resistencia 100m de profundidad',
      'GPS dual',
      'ECG integrado',
      'Botón de acción personalizable',
      'Cristal de zafiro',
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