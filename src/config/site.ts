export const siteConfig = {
  storeName: "AgroTienda Pro", // Cambias esto y cambia toda la marca
  theme: {
    // Si es ferretería usas naranja (#ea580c), si es ropa usas negro (#000000)
    primaryColor: "#16a34a", 
    textColor: "#1f2937",
    buttonTextColor: "#ffffff",
  },
  hero: {
    title: "Todo para tu siembra y cosecha",
    subtitle: "Insumos agrícolas de alta calidad directo a tu finca.",
    // Aquí pegas el link de la imagen de fondo según el rubro del cliente
    backgroundImage: "https://images.unsplash.com/photo-1592982537447-6f296d0b6727?q=80&w=2000&auto=format&fit=crop", 
  },
  currencySymbol: "$",
  whatsapp: {
    number: "1234567890",
    checkoutMessage: "Hola, quiero comprar el producto {product}. Mi código de referido es: {ref}",
  }
};