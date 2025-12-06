import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Gallery from '../../components/Gallery';
import OutfitGenerator from '../../components/OutfitGenerator';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import AddToCartButton from '../../components/AddToCartButton';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/products/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

// FIX: Type params as a Promise and await it inside the component
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // <--- AWAIT HERE
  const product = await getProduct(slug);

  if (!product) return notFound();

  const discount = product.price_before_cents 
    ? Math.round(((product.price_before_cents - product.price_cents) / product.price_before_cents) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Gallery */}
          <div>
            <Gallery images={product.images} name={product.name} />
          </div>

          {/* Right Column: Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                {product.brand}
              </h1>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                {product.name}
              </h2>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <span className="font-bold text-sm">{product.rating}</span>
                  <Star className="w-3 h-3 fill-current text-yellow-500" />
                  <span className="text-xs text-gray-500 border-l border-gray-300 pl-2 ml-1">
                    {product.reviews_count} Ratings
                  </span>
                </div>
                {product.is_published && (
                   <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                     In Stock
                   </span>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-100 my-6" />

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${(product.price_cents / 100).toFixed(2)}
                </span>
                {product.price_before_cents && (
                  <span className="text-xl text-gray-400 line-through">
                    ${(product.price_before_cents / 100).toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Sizes */}
             {/* Sizes & Add Button REPLACED BY COMPONENT */}
            <AddToCartButton 
              productId={product._id} 
              price={product.price_cents} 
              variants={product.variants} 
            />

            {/* Delivery & Trust */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-8">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>30 Day Returns</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <h3 className="text-gray-900 font-bold">Product Details</h3>
              <p>{product.description}</p>
            </div>

            {/* AI Assistant */}
            <OutfitGenerator currentProduct={product.slug} />

          </div>
        </div>
      </main>
    </div>
  );
}