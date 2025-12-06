import Link from 'next/link';

interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price_cents: number;
  price_before_cents: number | null;
  image: string;
  offer_tag: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}?id=${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
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
              ${(product.price_cents / 100).toFixed(2)}
            </span>
            {product.price_before_cents && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ${(product.price_before_cents / 100).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}