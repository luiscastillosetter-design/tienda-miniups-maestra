'use client';

const isVideo = (url?: string) => {
  if (!url) return false;
  return url.endsWith('.mp4') || url.includes('.mp4?') || url.startsWith('data:video');
};

interface ProductCoverProps {
  images?: string[];
  title: string;
}

/** Portada de tarjeta: imagen 1; con hover (group-hover) hace fundido a la imagen 2 si existe. */
export default function ProductCover({ images, title }: ProductCoverProps) {
  const first = images?.[0] || '';
  const second = images && images.length > 1 && !isVideo(images[1]) ? images[1] : '';

  if (isVideo(first)) {
    return <video src={first} muted loop autoPlay playsInline className="w-full h-full object-cover rounded-xl" />;
  }

  return (
    <>
      <img
        src={first}
        alt={title}
        className={`w-full h-full object-contain transition-all duration-500 ${
          second ? 'group-hover:opacity-0' : 'group-hover:scale-108'
        }`}
      />
      {second && (
        <img
          src={second}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      )}
    </>
  );
}
