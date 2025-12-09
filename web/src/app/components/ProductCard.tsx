// /web/src/components/ProductCard.tsx

import Link from 'next/link';

// --- FIXED: Interface now perfectly matches the SIMPLIFIED API response ---
interface Product {
  _id: string;
  slug: string;
  name: string;
  brand: string;
  price_cents: number;
  price_before_cents?: number | null;
  images: string; // The API now sends a single image URL string
  rating?: number;
  offer_tag?: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  console.log('Product_id', product._id);
  // Get the URL of the first image, or a placeholder if the array is empty.
  // Plain JS to avoid type assertion/annotation lint issues.
  const imageUrl = (function () {
    const first = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
    if (!first) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') return first.url || first.path || 'https://via.placeholder.com/300x200?text=No+Image';
    return 'https://via.placeholder.com/300x200?text=No+Image';
  })();
  return (
    <Link href={`/products/${product.slug}?id=${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          {/* Use safe imageUrl computed above */}
          <img src={imageUrl} alt={product.name} className="w-full h-48 object-cover" />
          {product.offer_tag && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.offer_tag}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.brand}</p>
          <div className="mt-2 flex items-baseline">
            <span className="text-lg font-bold text-gray-900">
              ₹{(product.price_cents / 100).toFixed(0)}
            </span>
            {product.price_before_cents && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₹{(product.price_before_cents / 100).toFixed(0)}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="mt-1 text-xs text-gray-600">
              Rating: {product.rating.toFixed(1)} ★
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}