export const siteConfig = {
  storeName: "Importadora TodoMax",
  description: "Importadora Multiproductos. Envíos rápidos a nivel nacional.",
  currencySymbol: "$",
  whatsappNumber: "+17543411559", 
  whatsapp: {
    number: "+17543411559",
  },
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
  roles: ["Super Admin", "Logística y Pagos", "Marketing y Afiliados"],
  metaPixelId: "TU_PIXEL_ID_AQUI",
};