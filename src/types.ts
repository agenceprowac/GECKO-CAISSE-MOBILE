export type Tenant = {
  id: string;
  email: string;
  establishmentName: string;
  adminPin: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  stock: number;
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
  role: 'ADMIN' | 'BARMAN' | 'WAITER';
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



