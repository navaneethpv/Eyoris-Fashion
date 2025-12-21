// /web/src/components/ProductCard.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";

interface Product {
  _id?: string | null;
  slug: string;
  name: string;
  brand?: string;
  price_cents?: number;
  price_before_cents?: number | null;
  images?: string | Array<string | { url?: string }>;
  rating?: number;
  offer_tag?: string | null;
}

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER = "https://via.placeholder.com/300x200?text=No+Image";

export default function ProductCard({ product }: ProductCardProps) {
  const [localProduct, setLocalProduct] = useState<Product>(product);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
  const { user } = useUser();

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !localProduct._id) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await fetch(
          `http://localhost:4000/api/wishlist/remove/${localProduct._id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id }),
          }
        );
        setIsWishlisted(false);
      } else {
        await fetch("http://localhost:4000/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            productId: localProduct._id,
          }),
        });
        setIsWishlisted(true);

        // Trigger heart burst animation when liked
        setBurstPosition({ x: 50, y: 50 }); // Center of image percentage
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 1000);
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    const hasImage =
      !!localProduct.images &&
      ((typeof localProduct.images === "string" &&
        localProduct.images.trim().length > 0) ||
        (Array.isArray(localProduct.images) && localProduct.images.length > 0));
    const hasId = !!localProduct._id;

    if (hasImage && hasId) return;

    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_API_BASE || window.location.origin;

    async function fetchDetails() {
      try {
        const url = `${base.replace(/\/$/, "")}/products/${encodeURIComponent(
          product.slug
        )}`;
        const res = await axios.get(url, { signal: controller.signal });
        if (res?.data) setLocalProduct((prev) => ({ ...prev, ...res.data }));
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        if (process.env.NODE_ENV === "development")
          console.debug("ProductCard fetch failed", err);
      }
    }

    fetchDetails();
    return () => controller.abort();
  }, [product.slug, localProduct.images, localProduct._id]);

  function prefixIfRelative(url?: string) {
    if (!url) return PLACEHOLDER;
    if (/^https?:\/\//i.test(url)) return url;
    const base =
      process.env.NEXT_PUBLIC_API_BASE ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  function resolveImageUrl(p?: Product) {
    if (!p) return PLACEHOLDER;
    const imgs = p.images;
    if (!imgs) return PLACEHOLDER;
    if (typeof imgs === "string")
      return imgs.trim() ? prefixIfRelative(imgs) : PLACEHOLDER;
    if (Array.isArray(imgs) && imgs.length > 0) {
      const first = imgs[0];
      if (!first) return PLACEHOLDER;
      if (typeof first === "string") return prefixIfRelative(first);
      return prefixIfRelative((first as any).url);
    }
    return PLACEHOLDER;
  }

  const imageUrl = resolveImageUrl(localProduct);
  const href = `/products/${localProduct.slug}${
    localProduct._id ? `?id=${localProduct._id}` : ""
  }`;

  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          <img
            src={imageUrl}
            alt={localProduct.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (t.src !== PLACEHOLDER) t.src = PLACEHOLDER;
            }}
          />
          {localProduct.offer_tag && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {localProduct.offer_tag}
            </span>
          )}
          {/* Wishlist Button - Ultra Unique & Attractive */}
          {user && (
            <div className="absolute top-2 right-2">
              {/* Particle burst effect container */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`group relative overflow-visible`}
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {/* Animated rings on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-full bg-pink-400/20 animate-ping"></div>
                  <div
                    className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                </div>

                {/* Main button with unique hexagon-inspired shape */}
                <div
                  className={`relative p-3.5 rounded-2xl transition-all duration-300 transform hover:scale-125 hover:rotate-12 disabled:opacity-50 ${
                    isWishlisted
                      ? "bg-gradient-to-tr from-pink-500 via-red-500 to-rose-600 shadow-2xl shadow-pink-500/60 animate-pulse"
                      : "bg-gradient-to-br from-white via-pink-50 to-white shadow-xl hover:shadow-2xl hover:shadow-red-300/40 border-2 border-pink-200"
                  }`}
                >
                  {/* Shimmer effect overlay */}
                  {!isWishlisted && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}

                  {/* Sparkle icons around heart */}
                  {isWishlisted && (
                    <>
                      <div
                        className="absolute -top-1 -right-1 text-yellow-300 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      >
                        ✨
                      </div>
                      <div
                        className="absolute -bottom-1 -left-1 text-yellow-300 animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      >
                        ✨
                      </div>
                    </>
                  )}

                  {/* Heart icon */}
                  <Heart
                    className={`w-7 h-7 relative z-10 transition-all duration-300 ${
                      isWishlisted
                        ? "fill-white text-white drop-shadow-2xl scale-110 animate-bounce-once filter brightness-125"
                        : "text-red-500 group-hover:fill-red-500 group-hover:scale-125 group-hover:rotate-12 drop-shadow-md"
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
            {localProduct.name}
          </h3>
          <p className="text-xs text-gray-500">{localProduct.brand}</p>

          <div className="mt-2 flex items-baseline">
            <span className="text-lg font-bold text-gray-900">
              ₹{((localProduct.price_cents ?? 0) / 100).toFixed(0)}
            </span>
            {localProduct.price_before_cents ? (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₹{((localProduct.price_before_cents ?? 0) / 100).toFixed(0)}
              </span>
            ) : null}
          </div>

          {localProduct.rating ? (
            <div className="mt-1 text-xs text-gray-600">
              Rating: {localProduct.rating.toFixed(1)} ★
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
