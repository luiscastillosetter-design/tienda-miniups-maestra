export const siteConfig = {
  storeName: "Importadora TodoMax",
  description: "Importadora Multiproductos. Envíos rápidos a nivel nacional.",
  currencySymbol: "$",
  // Oficina / Administración: atención humana y cierre de pedidos (checkout, footer, derivación)
  whatsappNumber: "+584225160056",
  whatsapp: {
    number: "+584225160056",
    // Bot Sofía (acceso directo para chatear con la IA por WhatsApp). NUNCA usar para atención humana.
    sofiaNumber: "+17543411559",
  },
  email: "ventas@todomax.com",
  location: "Venezuela",
  storeUrl: "https://www.importadoratodomax.com",
  shipping: {
    freeShippingThreshold: 50,
    companies: ["MRW", "Zoom", "Tealca", "Delivery Local", "Retiro en Tienda"],
  },
  paymentMethods: {
    pagoMovil: {
      banco: "Bancamiga (0172)",
      telefono: "0412-1234567",
      cedula: "J-50000000-1"
    },
    transferencia: {
      banco: "Banesco",
      cuenta: "0134-0000-0000-0000-0000",
      titular: "Inversiones TodoMax C.A.",
      rif: "J-50000000-1"
    },
    zelle: {
      email: "pagos@todomax.com",
      titular: "TodoMax LLC"
    },
    binance: {
      payId: "123456789",
      usdtAddress: "Txxxxxxxxxxxxxxxxxxxx (TRC20)"
    }
  },
  // Comisión fija de afiliados (10%). ÚNICA fuente de verdad en todo el proyecto.
  affiliateCommissionRate: 0.10,
  roles: ["Super Admin", "Logística y Pagos", "Marketing y Afiliados"],
  metaPixelId: "",
};