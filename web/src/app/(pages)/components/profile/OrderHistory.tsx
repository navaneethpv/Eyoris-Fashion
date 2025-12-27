// web/src/components/profile/OrderHistory.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Package, DollarSign, Clock } from "lucide-react";

interface OrderHistoryProps {
  clerkUser: any; // Using any since @clerk/types is not installed
}

export default function OrderHistory({ clerkUser }: OrderHistoryProps) {
  const { userId } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";
  const baseUrl = base.replace(/\/$/, "");

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/orders?userId=${userId}`
        );
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
        <a href="/product" className="inline-block px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
          Browse Products
        </a>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-[1px] transition-all"
        >
          <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200 flex-shrink-0">
                {order.items[0]?.image ? (
                  <img
                    src={order.items[0].image}
                    alt={order.items[0].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {order.items[0]?.name || "Product"}
                </h3>
                <p className="text-xs text-gray-500">
                  Qty: {order.items[0]?.quantity || 1}
                  {order.items.length > 1 && ` · +${order.items.length - 1} more item${order.items.length - 1 > 1 ? 's' : ''}`}
                </p>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Items</span>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  {order.items.length}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Total Amount</span>
                <p className="text-lg font-bold text-gray-900">
                  ₹{(order.total_cents / 100).toFixed(2)}
                </p>
              </div>
              <div className="sm:col-span-1">
                <span className="text-xs text-gray-500 block mb-1">Shipping Address</span>
                <p className="text-sm text-gray-900">
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
