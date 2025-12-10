"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Loader2, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { user, isLoaded } = useUser();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Cart
  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/cart?userId=${user.id}`
      );
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove Item
  const removeItem = async (productId: string, variant: string) => {
    if (!user) return;
    try {
      // Optimistic UI update
      const newItems = cart.items.filter(
        (item: any) =>
          !(item.product._id === productId && item.variantSku === variant)
      );
      setCart({ ...cart, items: newItems });

      await fetch("http://localhost:4000/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId, variant }),
      });
    } catch (err) {
      console.error(err);
      fetchCart(); // Revert on error
    }
  };

  useEffect(() => {
    if (isLoaded && user) fetchCart();
  }, [isLoaded, user]);

  // Calculate Total
  const subtotal =
    cart?.items?.reduce((acc: number, item: any) => {
      return acc + item.product.price_cents * item.quantity;
    }, 0) || 0;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Please Sign In</h2>
          <p className="text-gray-500 mt-2">
            You need an account to view your bag.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black mb-8 text-gray-700">Shopping Bag</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <p className="text-gray-900 mb-4">Your bag is empty.</p>
            <Link
              href="/product"
              className="text-primary font-bold hover:underline text-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1 space-y-6">
              {cart.items.map((item: any) => (
                <div
                  key={`${item.product._id}-₹{item.variantSku}`}
                  className="flex gap-4 p-4 border rounded-xl"
                >
                  <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {item.product.brand}
                        </h3>
                        <p className="text-sm text-gray-900">
                          {item.product.name}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.product._id, item.variantSku)
                        }
                        className="text-gray-900 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-5 h-5 hover:cursor-pointer" />
                      </button>
                    </div>

                    <div className="mt-2 text-sm text-gray-800">
                      Size:{" "}
                      <span className="font-medium text-gray-900">
                        {item.variantSku}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <div className="font-medium text-gray-900">
                        Qty: {item.quantity}
                      </div>
                      <div className="font-bold text-lg text-gray-800">
                        ₹{(item.product.price_cents / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
                <h3 className="font-bold text-gray-700 text-lg mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Subtotal</span>
                    <span className="font-medium">
                      ₹{(subtotal / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>

                <div className="border-t text-gray-700 border-gray-200 pt-4 mb-8">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{(subtotal / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-6"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
