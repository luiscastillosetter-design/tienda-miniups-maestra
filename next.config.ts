/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Cuando vayas a usar las imágenes de tu catálogo local o de tu propio dominio web, 
      // deberás agregar ese dominio aquí también siguiendo esta misma estructura.
    ],
  },
};

module.exports = nextConfig; 
// Nota: Si tu archivo se llama next.config.mjs, la última línea debe ser: export default nextConfig;