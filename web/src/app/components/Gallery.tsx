"use client"
import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

interface GalleryProps {
  images: { url: string; dominant_color?: string }[];
  name: string;
}

export default function Gallery({ images, name }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 sticky top-24">
      {/* Thumbnails (Left on Desktop) */}
      <div className="flex md:flex-col gap-4 overflow-auto md:overflow-hidden pb-2 md:pb-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={clsx(
              "relative w-20 h-24 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all",
              selectedIndex === i ? "border-primary" : "border-transparent hover:border-gray-200"
            )}
          >
            <Image src={img.url} alt={`Thumbnail ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
        <Image 
          src={images[selectedIndex].url} 
          alt={name} 
          fill 
          className="object-cover"
          priority
        />
        {images[selectedIndex].dominant_color && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono shadow-sm">
            <div 
              className="w-3 h-3 rounded-full border border-gray-200" 
              style={{ backgroundColor: images[selectedIndex].dominant_color }} 
            />
            {images[selectedIndex].dominant_color}
          </div>
        )}
      </div>
    </div>
  );
}