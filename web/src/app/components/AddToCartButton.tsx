"use client"
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
  price: number;
  variants: any[];
}

export default function AddToCartButton({ productId, price, variants }: AddToCartButtonProps) {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const handleAddToCart = async () => {
    // 1. Auth Check
    if (!isLoaded) return;
    if (!user) {
      clerk.openSignIn();
      return;
    }

    // 2. Validation
    if (variants.length > 0 && !selectedSize) {
      alert("Please select a size first.");
      return;
    }

    setLoading(true);

    try {
      // 3. API Call
      const res = await fetch('http://localhost:4000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: productId,
          variant: selectedSize || 'default',
          quantity: 1
        })
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh(); // Refresh to update navbar badge if we connected it
        setTimeout(() => setSuccess(false), 2000);
      } else {
        alert("Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase">Select Size</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {variants.map((v: any, i: number) => (
            <button 
              key={i}
              onClick={() => setSelectedSize(v.size)}
              className={`w-12 h-12 rounded-lg border flex items-center justify-center font-bold text-sm transition focus:outline-none ${
                selectedSize === v.size 
                  ? 'bg-black text-white border-black' 
                  : 'border-gray-200 hover:border-black'
              }`}
            >
              {v.size}
            </button>
          ))}
          {variants.length === 0 && <span className="text-sm text-gray-500">One Size</span>}
        </div>
      </div>

      {/* Button */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleAddToCart}
          disabled={loading || success}
          className={`flex-1 h-14 rounded-xl font-bold text-lg transition shadow-xl flex items-center justify-center gap-2 ${
            success 
              ? 'bg-green-600 text-white shadow-green-200' 
              : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : success ? (
            <>
              <Check className="w-5 h-5" /> Added
            </>
          ) : (
            <>
               Add to Bag
            </>
          )}
        </button>
      </div>
    </div>
  );
}