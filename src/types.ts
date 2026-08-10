export type SubscriptionPlan = 'STANDARD' | 'PREMIUM' | 'ULTRA';

export type Tenant = {
  id: string;
  email: string;
  establishmentName: string;
  adminPin: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'SUSPENDED';
  subscriptionEndDate?: string;
  mobileMoneyQrCode?: string;
  _count?: {
    users: number;
  };
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  tenantId?: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  purchasePrice?: number;
  stock: number;
  isAvailable?: boolean;
  image?: string;
  tenantId?: string;
};

export type OrderItem = {
  id: string;
  product: Product;
  quantity: number;
};

export type Table = {
  id: string;
  name: string;
  tenantId?: string;
};

export type User = {
  id: string;
  name: string;
  pinCode: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'BARMAN' | 'WAITER';
  isActive?: boolean;
  tenantId?: string;
};

export type Sale = {
  id: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  createdAt: string; // "DD/MM/YYYY à HH:mm"
  tenantId?: string;
  synced: boolean;
  rawDate: string; // ISO String (ex: "2026-08-04T02:05:00.000Z")
};
export type StockHistoryEntry = {
  id: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  userLabel: string;
  createdAt: string; // "DD/MM/YYYY à HH:mm"
  tenantId?: string;
  rawDate?: string; // ISO String pour le tri et le filtrage
};
