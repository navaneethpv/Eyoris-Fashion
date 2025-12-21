"use client";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

interface Props {
  product: any;
  onAdd?: (id: string, variant?: any) => void;
}

export default function SuggestedProductCard({ product, onAdd }: Props) {
  const [loading, setLoading] = useState(false);

  const price = (product.price_cents / 100).toFixed(0);
  const oldPrice = product.price_before_cents
    ? (product.price_before_cents / 100).toFixed(0)
    : null;

  const discount = oldPrice
    ? Math.round(((product.price_before_cents - product.price_cents) / product.price_before_cents) * 100)
    : 0;

  async function handleAdd() {
    if (!onAdd) return;
    setLoading(true);
    await onAdd(product._id, product.variants?.[0]); // pass first variant
    setLoading(false);
  }

  return (
    <div className="w-44 bg-white border rounded-xl shadow-sm overflow-hidden flex-shrink-0 hover:shadow-md transition">
      <Link href={`/products/${product.slug}`}>
        <img
          src={product.images?.[0]?.url}
          className="w-full h-44 object-cover"
        />
      </Link>

      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold line-clamp-1">{product.name}</p>

        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          {product.rating?.toFixed(1) || "4.0"}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">₹{price}</span>
          {oldPrice && (
            <span className="line-through text-xs text-gray-400">₹{oldPrice}</span>
          )}
        </div>
        {discount > 0 && (
          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
            {discount}% OFF
          </span>
        )}

        <button
          className="mt-2 w-full bg-primary text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 active:scale-95"
          onClick={handleAdd}
        >
          <ShoppingCart className="w-3 h-3" />
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
