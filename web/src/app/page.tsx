"use client";
import Navbar from "./(pages)/components/Navbar";
import ProductCard from "./(pages)/components/ProductCard";
import AutoBanner from "./(pages)/components/AutoBanner";
import MostViewedSlider from "./(pages)/components/MostViewedSlider";
import Link from "next/link";
import OfferSection from "@/components/home/OfferSection";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Fetch data directly from backend
async function getTrendingProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=8&sort=price_desc`
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function Home() {
  const products = await getTrendingProducts();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <AutoBanner />

      {/* OFFERS (Dark / Premium) */}
      <OfferSection />

      {/* TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        {/* HEADER */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs uppercase tracking-[4px] text-gray-500 mb-2">
              Discover
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
              Trending Now
            </h2>
          </div>

          <Link
            href="/product"
            className="text-sm font-medium text-gray-700 hover:text-black transition flex items-center gap-2"
          >
            View All <span className="text-lg">→</span>
          </Link>
        </div>

        {/* GRID */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-16">
            {products.map((p: any, index: number) => (
              <div
                key={p._id || p.id}
                className="opacity-0 animate-fade-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <ProductCard
                  product={{
                    _id: p._id,
                    slug: p.slug,
                    name: p.name,
                    price_cents: p.price_cents,
                    price_before_cents: p.price_before_cents,
                    images: p.images,
                    brand: p.brand,
                    offer_tag: p.offer_tag,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-gray-500 border border-dashed border-gray-300">
            Backend is sleeping. Please run <code>npm run dev</code> in{" "}
            <code>/api</code> folder.
          </div>
        )}
      </section>

      {/* MOST VIEWED SLIDER */}
      <MostViewedSlider products={products} />

      {/* PAGE ANIMATION */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(18px);
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
    </div>
  );
}
