"use client"
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { ShoppingBag, Loader2, Check, X, AlertTriangle, Ruler, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SizeGuideModal from './SizeGuideModal';
import StyleConfidenceCard from './StyleConfidenceCard';

interface Variant {
  size: string;
  stock: number;
  price?: number; // Selling Price in Rupees
  mrp?: number;   // MRP in Rupees
}

interface AddToCartButtonProps {
  productId: string;
  price: number; // Base price in cents
  mrp?: number;  // Base MRP in cents
  variants: Variant[];
  compact?: boolean;
  styleConfidence?: number; // New Prop
}

export default function AddToCartButton({ variants = [], productId, price, mrp, compact = false, styleConfidence }: AddToCartButtonProps) {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [showSizeError, setShowSizeError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // --- WISHLIST FETCH ON MOUNT ---
  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/wishlist?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          const inWishlist = data.wishlist?.some((item: any) =>
            (typeof item.productId === 'string' ? item.productId : item.productId?._id) === productId
          );
          if (inWishlist) setIsLiked(true);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist status:", error);
      }
    };
    fetchWishlistStatus();
  }, [isLoaded, user, productId]);

  // --- PRICING & STOCK LOGIC ---
  const selectedVariant = Array.isArray(variants) ? variants.find(v => v.size === selectedSize) : undefined;
  const availableStock = selectedVariant ? (selectedVariant.stock ?? 0) : 0;
  const isOutOfStock = !!selectedSize && availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 10;

  // Calculate Display Price
  // Base inputs are in CENTS. Variant inputs are in RUPEES.
  // We convert everything to RUPEES for display.
  const displayPrice = selectedVariant && selectedVariant.price
    ? selectedVariant.price
    : (price / 100);

  const displayMrp = selectedVariant && selectedVariant.mrp
    ? selectedVariant.mrp
    : (mrp ? mrp / 100 : undefined);

  const discount = displayMrp && displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : 0;

  const base = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const baseUrl = base.replace(/\/$/, "");

  const handleAddToCart = async () => {
    // 1. Auth Check
    if (!isLoaded) return;
    if (!user) {
      clerk.openSignIn();
      return;
    }

    const hasVariants = variants.length > 0;

    // 2. Validation
    if (hasVariants && !selectedSize) {
      setShowSizeError(true);
      return;
    }

    if (hasVariants && selectedSize && availableStock <= 0) {
      alert("Selected size is out of stock.");
      return;
    }

    setLoading(true);
    setShowSizeError(false);

    try {
      // 3. API Call
      const res = await fetch(`${baseUrl}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: productId,
          variant: hasVariants ? selectedSize : "One Size",
          quantity: 1
        })
      });

      if (res.ok) {
        setSuccess(true);
        window.dispatchEvent(new Event("cart-updated"));
        router.refresh();
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

  const handleWishlistToggle = async () => {
    if (!isLoaded || !user) {
      clerk.openSignIn();
      return;
    }
    const previousState = isLiked;
    setIsLiked(!previousState);
    setWishlistLoading(true);
    try {
      if (!previousState) {
        const res = await fetch(`${baseUrl}/api/wishlist/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId })
        });
        if (!res.ok && res.status !== 400) setIsLiked(previousState);
      } else {
        const res = await fetch(`${baseUrl}/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        if (!res.ok) setIsLiked(previousState);
      }
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(err);
      setIsLiked(previousState);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-8"}>

      {/* 🛑 DYNAMIC PRICE SECTION (Moved inside component) 🛑 */}
      {!compact && (
        <div className="mb-2">
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-3xl font-medium text-gray-900 tracking-tight">
              ₹{displayPrice.toFixed(0)}
            </span>
            {displayMrp && (
              <span className="text-lg text-gray-400 line-through font-light">
                ₹{displayMrp.toFixed(0)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wide border border-emerald-100">
                Save {discount}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-light">
            Price inclusive of all taxes
          </p>
        </div>
      )}

      {/* Style Confidence Score */}
      {!compact && styleConfidence !== undefined && (
        <StyleConfidenceCard score={styleConfidence} />
      )}

      {/* Size Selector */}
      <div className={compact ? "mb-2" : "mb-6"}>
        <div className="flex justify-between items-center mb-4">
          {!compact && <h3 className="text-xs font-semibold text-gray-900 tracking-wider uppercase">Select Size</h3>}
          {compact ? (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Size</span>
          ) : (
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center underline-offset-4 hover:underline"
            >
              <Ruler className="w-3.5 h-3.5 mr-1.5" /> Size Guide
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {variants.map((v: Variant, i: number) => (
            <button
              key={i}
              onClick={() => {
                setSelectedSize(v.size);
                setShowSizeError(false);
              }}
              disabled={v.stock <= 0}
              className={`min-w-[3.5rem] px-4 py-2.5 flex items-center justify-center text-sm font-medium transition-all duration-200 rounded-lg
                ${compact ? "px-3 py-1.5 text-xs min-w-0" : ""}
                ${v.stock <= 0
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice border border-dashed border-gray-200'
                  : selectedSize === v.size
                    ? 'bg-gray-900 text-white border border-gray-900 shadow-md'
                    : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-900'
                }`}
            >
              {v.size}
            </button>
          ))}
          {variants.length === 0 && <span className="text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full">One Size</span>}
        </div>
        {/* Size Selection Error */}
        {showSizeError && (
          <div className={`text-red-600 font-medium flex items-center mt-3 animate-in fade-in slide-in-from-top-1 ${compact ? "text-[10px]" : "text-xs"}`}>
            <AlertTriangle className={`mr-2 ${compact ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
            Please select a size
          </div>
        )}
      </div>

      {/* 🛑 STOCK MESSAGE 🛑 */}
      <div className={compact ? "mt-1 mb-2" : "mt-2"}>
        {isOutOfStock && (
          <span className="text-xs font-medium text-red-600 flex items-center tracking-wide">
            Out of Stock
          </span>
        )}
        {isLowStock && (
          <span className="text-xs font-medium text-amber-700 flex items-center tracking-wide">
            Only {availableStock} left!
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={loading || success}
          className={`flex-1 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group tracking-wide
            ${compact ? "h-10 text-xs" : "h-14 text-sm"}
            ${success
              ? 'bg-emerald-700 text-white'
              : 'bg-gray-900 text-white hover:bg-black shadow-sm hover:shadow-md'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 className={compact ? "w-3 h-3 animate-spin" : "w-4 h-4 animate-spin"} />
          ) : success ? (
            <>
              <Check className={compact ? "w-3 h-3" : "w-4 h-4"} /> {compact ? "Added" : "Added to Bag"}
            </>
          ) : (
            <>
              <ShoppingBag className={compact ? "w-3 h-3" : "w-4 h-4 transition-transform group-hover:-translate-y-0.5"} />
              {compact ? "Add" : "Add to Bag"}
            </>
          )}
        </button>
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className={`group flex items-center justify-center border border-gray-200 rounded-full hover:border-gray-900 transition-all duration-200 ${compact ? "w-10 h-10" : "w-14 h-14"}`}
        >
          <Heart className={`${compact ? "w-4 h-4" : "w-5 h-5"} ${wishlistLoading ? "animate-pulse" : ""} ${isLiked ? "fill-current text-red-600 stroke-red-600" : "text-gray-900 stroke-1.5"} transition-colors`} />
        </button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
