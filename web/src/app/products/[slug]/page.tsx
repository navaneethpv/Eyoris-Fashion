// /web/src/app/products/[slug]/page.tsx

import { notFound } from 'next/navigation';
import AddToCartButton from '../../components/AddToCartButton'; // Assuming you have this client component
import Gallery from '../../components/Gallery'; // Assuming you have this client component

// Define the shape of the Product data we expect from the API
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  price_cents: number;
  price_before_cents?: number;
  images: { url: string }[];
  variants: {
    size: string;
    color: string;
    stock: number;
  }[];
  rating?: number;
  reviewsCount?: number;
}

// This function fetches the data for a single product from your backend API
async function getProduct(slug: string): Promise<Product | null> {
  try {
    // IMPORTANT: Make sure the URL matches your API endpoint structure
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/slug/${slug}`, {
      next: { revalidate: 60 } // Revalidate data every 60 seconds
    }); 

    // If the API returns a 404 or any other error, handle it
    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

// This is the main page component
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  // If no product was found, display the 404 page. This is why you're seeing it.
  if (!product) {
    notFound();
  }

  // Extract image URLs for the Gallery component
  const imageUrls = product.images.map(img => img.url);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Image Gallery */}
        <div>
          {/* Assuming you have a Gallery component that takes an array of image URLs */}
          <Gallery images={imageUrls} />
        </div>

        {/* Right Side: Product Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">Brand: {product.brand}</p>
          
          <div className="mb-4">
            <span className="text-3xl font-bold text-red-600">
              ₹{(product.price_cents / 100).toFixed(0)}
            </span>
            {product.price_before_cents && (
              <span className="ml-3 text-lg text-gray-400 line-through">
                ₹{(product.price_before_cents / 100).toFixed(0)}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* This should be a Client Component for interactivity */}
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

// Optional: Add metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }
  return {
    title: product.name,
    description: product.description,
  };
}