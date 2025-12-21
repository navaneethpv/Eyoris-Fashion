"use client"
import { useState } from 'react';
import Image from "next/image";

interface GalleryProps {
  images: { url: string; dominant_color?: string }[];
  name: string;
}

const PLACEHOLDER = "https://via.placeholder.com/600x600?text=No+Image";

function normalizeImageSrc(url?: string) {
  if (!url) return PLACEHOLDER;
  const trimmed = url.toString().trim();
  if (!trimmed) return PLACEHOLDER;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_BASE as string) || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;
}

export default function Gallery({ images, name }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) return null;

  const mainSrc = normalizeImageSrc(
    typeof images?.[selectedIndex] === "string"
      ? (images![selectedIndex] as string)
      : (images?.[selectedIndex] as any)?.url
  );

  return (
    <>
      {/* Main Image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
        <Image
          src={mainSrc}
          alt={name || "Product image"}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4">
        {images?.map((img, i) => {
          const thumbSrc =
            typeof img === "string" ? img : (img as any)?.url;
          const src = normalizeImageSrc(thumbSrc);
          return (
            <button
              key={i}
              type="button"
              aria-label={`Thumbnail ${i}`}
              className={`relative h-20 w-20 overflow-hidden rounded ${i === selectedIndex ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedIndex(i)}
            >
              <Image src={src} alt={`Thumbnail ${i}`} fill className="object-cover" />
            </button>
          );
        })}
      </div>
    </>
  );
}