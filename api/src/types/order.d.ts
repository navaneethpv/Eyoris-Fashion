// TypeScript interfaces for Order functionality
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  variantSku: string;
  quantity: number;
  price_cents: number;
  image?: string | null;
}

export interface CreateOrderRequest {
  userId: string;
  shippingAddress: ShippingAddress;
  total_cents?: number; // Optional, will be calculated server-side
}

export interface CreateOrderResponse {
  _id: string;
  userId: string;
  items: OrderItem[];
  total_cents: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentInfo: {
    id: string;
    status: string;
    method: string;
  };
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  revenue: number;
  orders: number;
  products: number;
  users: number;
  recentOrders: any[];
}

export interface MonthlySalesData {
  year: number;
  monthlySales: {
    month: number;
    totalSales: number;
    orderCount: number;
  }[];
}

export interface PriceMismatchError {
  message: string;
  calculated_total: number;
  requested_total: number;
}
