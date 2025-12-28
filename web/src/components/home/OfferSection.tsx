"use client";

import { useRouter } from "next/navigation";
import OfferCard, { OfferFilters } from "./OfferCard";

interface OfferConfig {
  title: string;
  subtitle: string;
  filters: OfferFilters;
}

const OFFERS: OfferConfig[] = [
  {
    title: "Men’s Shirts Under ₹999",
    subtitle: "Smart casual shirts for work, dates, and everything in between.",
    filters: {
      gender: "Men",
      category: ["Shirts"],
      maxPrice: 999,
    },
  },
  {
    title: "Winter Collection",
    subtitle: "Layer up with premium sweatshirts, jackets and knitwear.",
    filters: {
      category: ["Jackets", "Sweatshirts", "Hoodies"],
      colors: ["Navy", "Charcoal", "Beige"],
    },
  },
  {
    title: "Dark Color Picks",
    subtitle: "Deep blacks, charcoal tones and rich night-ready outfits.",
    filters: {
      colors: ["Black", "Charcoal", "Midnight Blue"],
    },
  },
  {
    title: "Premium Styles",
    subtitle: "Elevated fits, finer fabrics and statement pieces for occasions.",
    filters: {
      category: ["Dresses", "Blazers", "Co-ords"],
      maxPrice: 4999,
    },
  },
];

function buildQueryString(filters: OfferFilters): string {
  const params = new URLSearchParams();

  if (filters.gender) params.set("gender", filters.gender);
  if (filters.category?.length) params.set("articleType", filters.category[0]);
  if (typeof filters.maxPrice === "number")
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.colors?.length)
    params.set("colors", filters.colors.join(","));

  return params.toString();
}

export default function OfferSection() {
  const router = useRouter();

  const handleOfferClick = (filters: OfferFilters) => {
    const query = buildQueryString(filters);
    router.push(query ? `/product?${query}` : "/product");
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-white">
      {/* HEADER */}
      <div className="mb-16">
        <p className="text-xs uppercase tracking-[4px] text-gray-500 mb-2">
          Shop by mood
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          Curated offers for how you dress today
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {OFFERS.map((offer, index) => (
          <div
            key={offer.title}
            className="opacity-0 animate-fade-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <OfferCard
              title={offer.title}
              subtitle={offer.subtitle}
              onClick={() => handleOfferClick(offer.filters)}
            />
          </div>
        ))}
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
