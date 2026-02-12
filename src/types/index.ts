export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  logo?: string;
  banner?: string;
  primaryColor: string;
  secondaryColor: string;
  description?: string;
  email: string;
  address?: string;
  socialMedia?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  stock: number;
  onSale: boolean;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  maxProducts: number;
  features: string[];
  maxStores: number;
  createdAt: string;
  updatedAt: string;
}
