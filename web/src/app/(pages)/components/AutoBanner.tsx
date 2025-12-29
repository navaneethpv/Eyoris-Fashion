"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "Summer Collection 2025",
    subtitle: "Discover the hottest trends",
    description: "Up to 50% off on selected items",
    buttonText: "Shop Now",
    link: "/product?gender=women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=800&fit=crop",
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Fresh styles every week",
    description: "Be the first to shop the latest collections",
    buttonText: "Explore",
    link: "/product",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=800&fit=crop",
  },
  {
    id: 3,
    title: "Premium Quality",
    subtitle: "Luxury fashion for everyone",
    description: "Exclusive designs at affordable prices",
    buttonText: "View Collection",
    link: "/product?gender=men",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=800&fit=crop",
  },
];

export default function AutoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full h-[520px] md:h-[650px] overflow-hidden group">

      {/* SLIDES */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${
            index === currentSlide
              ? "opacity-100 scale-100 z-20"
              : "opacity-0 scale-105 z-10"
          }`}
        >
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] scale-110"
            style={{ backgroundImage: `url(${banner.image})` }}
          />

          {/* LUXURY GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

          {/* CONTENT */}
          <div className="relative z-30 h-full flex items-center px-6 md:px-16">
            <div className="max-w-3xl text-left">

              <p className="text-xs md:text-sm text-white/80 uppercase tracking-[4px] mb-3 animate-slide-up">
                {banner.subtitle}
              </p>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-4 animate-slide-up delay-150">
                {banner.title}
              </h1>

              <p className="text-base md:text-lg text-white/85 mb-10 max-w-xl animate-slide-up delay-300">
                {banner.description}
              </p>

              <Link
                href={banner.link}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full tracking-wide hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 animate-slide-up delay-500"
              >
                {banner.buttonText}
                <span className="text-xl">→</span>
              </Link>

            </div>
          </div>
        </div>
      ))}

      {/* ARROWS */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-10 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* ANIMATIONS */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.9s ease-out both;
        }

        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
