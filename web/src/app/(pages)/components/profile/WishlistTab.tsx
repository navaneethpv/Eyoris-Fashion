"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";

export default function WishlistTab() {
  const { user } = useUser();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";
  const baseUrl = base.replace(/\/$/, "");

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/wishlist?userId=${user?.id}`
      );
      const data = await response.json();
      setWishlist(data.wishlist || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await fetch(`${baseUrl}/api/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });

      setWishlist((prev) =>
        prev.filter((item) => item.productId._id !== productId)
      );
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 mb-6">Start adding products you love!</p>
        <Link
          href="/product"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-violet-700 transition"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-gray-500 font-light text-sm tracking-wide">
        {wishlist.length} {wishlist.length === 1 ? "ITEM" : "ITEMS"} SAVED
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6">
        {wishlist.map((item) => {
          const product = item.productId;
          return (
            <div
              key={item._id}
              className="group relative flex flex-col bg-transparent"
            >
              {/* Product Image Card */}
              <Link
                href={`/products/${product.slug}`}
                className="relative aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all duration-500 block"
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out will-change-transform"
                />

                {/* Remove Button Overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(product._id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all duration-300 backdrop-blur-sm z-10"
                  title="Remove"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </Link>

              {/* Product Info */}
              <div className="flex flex-col flex-1 px-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                  {product.brand || "Eyoris Basics"}
                </p>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-serif font-medium text-gray-900 text-sm sm:text-base leading-tight mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-auto">
                  <span className="text-base sm:text-lg font-medium text-gray-900 tracking-tight">
                    ₹{(product.price_cents / 100).toFixed(0)}
                  </span>
                  {product.price_before_cents && (
                    <span className="text-xs text-gray-400 line-through font-light">
                      ₹{(product.price_before_cents / 100).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Rating (Optional - keeping minimal for premium look, maybe remove if too cluttered? keeping as per req to not remove features) */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 fill-black text-black" />
                    <span className="text-xs font-medium text-gray-900">{product.rating}</span>
                    <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
