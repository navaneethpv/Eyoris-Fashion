"use client";

import { useState } from "react";
import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import { Wand2, Loader2, Zap, ChevronDown, ArrowRight } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

interface OutfitItem {
  role: string;
  suggestedType: string;
  colorSuggestion: string;
  colorHexSuggestion: string;
  reason: string;
  product?: any; // 👉 contains DB product
}

interface OutfitResult {
  outfitTitle: string;
  outfitItems: OutfitItem[];
  overallStyleExplanation: string;
}

const STYLE_VIBES = [
  { value: "simple_elegant", label: "Simple & Elegant" },
  { value: "street_casual", label: "Street & Casual" },
  { value: "office_formal", label: "Office & Formal" },
  { value: "party_bold", label: "Party & Bold" },
];

export default function OutfitGenerator({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OutfitResult | null>(null);

  const [gender, setGender] = useState<"male" | "female">("female");
  const [styleVibe, setStyleVibe] = useState(STYLE_VIBES[0].value);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1.3, spacing: 15 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 2.5, spacing: 20 } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 25 } },
    },
  });

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    const userPreferences = {
      gender,
      styleVibe,
      avoidColors: ["neon green", "bright yellow"],
      preferredBrightness: "medium",
      maxItems: 4,
    };

    try {
      const res = await fetch("http://localhost:4000/api/ai/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userPreferences }),
      });

      const data = await res.json();
      setResult(data);
      setTimeout(() => instanceRef.current?.update(), 50);
    } catch (e) {
      console.error(e);
      alert("AI failed to suggest an outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 border border-violet-100 bg-gradient-to-r from-violet-50 to-white rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Stylist: Outfit Generator
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            AI builds a full matching outfit from your wardrobe.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {result ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Filter Inputs */}
      <div className="flex gap-4 pb-4 mb-4 border-b border-violet-100">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Gender</label>
          <div className="relative">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              className="w-full p-2 border border-gray-300 rounded-lg appearance-none text-sm pr-8 bg-white focus:border-primary"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-gray-500" />
          </div>
        </div>

        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
            Style Vibe
          </label>
          <div className="relative">
            <select
              value={styleVibe}
              onChange={(e) => setStyleVibe(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg appearance-none text-sm pr-8 bg-white focus:border-primary"
            >
              {STYLE_VIBES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="text-center py-8 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Generating your outfit...
        </div>
      )}

      {/* Carousel Display */}
      {result && (
        <div className="space-y-6">
          <h4 className="text-2xl font-bold text-gray-900">{result.outfitTitle}</h4>

          <div ref={sliderRef} className="keen-slider">
            {result.outfitItems.map((item, idx) => (
              <div key={idx} className="keen-slider__slide bg-white border rounded-xl p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">{item.role}</p>

                {item.product ? (
                  <>
                    <Link href={`/products/${item.product.slug}`} className="block">
                      <img
                        src={item.product.images?.[0]?.url}
                        alt={item.product.name}
                        className="w-full h-44 object-cover rounded-lg mb-3"
                      />
                      <p className="font-bold text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-sm font-bold mt-1">₹{(item.product.price_cents / 100).toFixed(0)}</p>
                    </Link>
                    <AddToCartButton
                      productId={item.product._id}
                      price={item.product.price_cents}
                      variants={item.product.variants}
                    />
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No matching item found.</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg shadow-sm">
            {result.overallStyleExplanation}
          </p>
        </div>
      )}
    </div>
  );
}
