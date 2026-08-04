import { create } from 'zustand';
import type { OrderItem, Product, Table, User, Sale, Tenant, StockHistoryEntry } from './types';

interface POSState {
  // SaaS Tenants
  tenants: Tenant[];
  currentTenant: Tenant | null;
  registerTenant: (email: string, establishmentName: string, adminPin: string) => boolean;
  loginTenant: (email: string) => Tenant | null;
  logoutTenant: () => void;
  deleteTenant: (tenantId: string) => void;
  hasEnteredApp: boolean;
  setHasEnteredApp: (val: boolean) => void;

  // PWA Install Prompt
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;

  // Offline / Network Sync System
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  isSyncing: boolean;
  syncSalesWithServer: () => Promise<void>;

  // Products & Inventory History
  products: Product[];
  getProductsByTenant: () => Product[];
  stockHistory: StockHistoryEntry[];
  getStockHistoryByTenant: () => StockHistoryEntry[];
  updateStock: (productId: string, quantityToAdd: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Tables
  tables: Table[];
  getTablesByTenant: () => Table[];
  addTable: (name: string) => void;
  updateTable: (table: Table) => void;
  deleteTable: (tableId: string) => void;
  
  // Users
  users: User[];
  getUsersByTenant: () => User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Sales
  sales: Sale[];
  getSalesByTenant: () => Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'synced' | 'rawDate'>) => void;

  // Cart / Orders
  cart: OrderItem[];
  currentTable: Table | null;
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setTable: (table: Table | null) => void;
  total: number;

  // Global Notification / Confirm Dialog System
  notification: { type: 'alert' | 'confirm'; message: string; onConfirm?: () => void } | null;
  showNotification: (type: 'alert' | 'confirm', message: string, onConfirm?: () => void) => void;
  hideNotification: () => void;
}

// Helper local storage key
const STORAGE_KEY = 'gecko_caisse_saas_data';

// Load state from localStorage or load default empty SaaS structure
const loadPersistedData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading localStorage data", e);
  }
  return {
    tenants: [],
    currentTenant: null,
    products: [],
    tables: [],
    users: [],
    sales: [],
    stockHistory: [],
    hasEnteredApp: false
  };
};

const persistedData = loadPersistedData();

export const usePOSStore = create<POSState>((set, get) => {
  // Helper to persist data to localStorage
  const persist = (updates: Partial<any>) => {
    const state = get();
    const dataToSave = {
      tenants: updates.tenants !== undefined ? updates.tenants : state.tenants,
      currentTenant: updates.currentTenant !== undefined ? updates.currentTenant : state.currentTenant,
      products: updates.products !== undefined ? updates.products : state.products,
      tables: updates.tables !== undefined ? updates.tables : state.tables,
      users: updates.users !== undefined ? updates.users : state.users,
      sales: updates.sales !== undefined ? updates.sales : state.sales,
      stockHistory: updates.stockHistory !== undefined ? updates.stockHistory : state.stockHistory,
      hasEnteredApp: updates.hasEnteredApp !== undefined ? updates.hasEnteredApp : state.hasEnteredApp,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  return {
    tenants: persistedData.tenants,
    currentTenant: persistedData.currentTenant,
    products: persistedData.products,
    tables: persistedData.tables,
    users: persistedData.users,
    sales: persistedData.sales,
    stockHistory: persistedData.stockHistory || [],
    hasEnteredApp: persistedData.hasEnteredApp || false,

    getStockHistoryByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().stockHistory.filter(h => h.tenantId === tenantId);
    },
    
    currentUser: null,
    cart: [],
    currentTable: null,
    total: 0,
    notification: null,
    
    deferredPrompt: null,
    setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),

    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,

    showNotification: (type, message, onConfirm) => set({ notification: { type, message, onConfirm } }),
    hideNotification: () => set({ notification: null }),

    setOnlineStatus: (status) => set({ isOnline: status }),

    syncSalesWithServer: async () => {
      const state = get();
      if (!state.isOnline || state.isSyncing) return;

      const tenantId = state.currentTenant?.id;
      const unsyncedSales = state.sales.filter(s => s.tenantId === tenantId && !s.synced);

      if (unsyncedSales.length === 0) return;

      set({ isSyncing: true });

      // Simuler une requête de synchronisation réseau vers le backend/base de données Prisma (1.5 seconde)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedSales = state.sales.map(sale => 
        (sale.tenantId === tenantId && !sale.synced) 
          ? { ...sale, synced: true } 
          : sale
      );

      set({ sales: updatedSales, isSyncing: false });
      persist({ sales: updatedSales });

      state.showNotification(
        'alert',
        `${unsyncedSales.length} transaction(s) locale(s) synchronisée(s) avec succès sur le cloud !`
      );
    },

    setHasEnteredApp: (val) => {
      set({ hasEnteredApp: val });
      persist({ hasEnteredApp: val });
    },

    // SaaS Tenants actions (Creates an empty establishment with only the admin user)
    registerTenant: (email, establishmentName, adminPin) => {
      const emailLower = email.toLowerCase().trim();
      const exists = get().tenants.some(t => t.email === emailLower);
      if (exists) {
        return false;
      }
      
      const newTenant: Tenant = {
        id: 'tnt_' + crypto.randomUUID(),
        email: emailLower,
        establishmentName,
        adminPin
      };

      const updatedTenants = [...get().tenants, newTenant];
      
      // Auto-create only the administrator user for this tenant
      const adminUser: User = {
        id: 'usr_' + crypto.randomUUID(),
        name: establishmentName + ' Admin',
        pinCode: adminPin,
        role: 'ADMIN',
        tenantId: newTenant.id
      };

      // Completely empty products and tables arrays for new tenant
      const updatedUsers = [...get().users, adminUser];

      set({
        tenants: updatedTenants,
        currentTenant: newTenant,
        users: updatedUsers,
        currentUser: adminUser, // Auto-login to admin profile
        hasEnteredApp: true,
        cart: [],
        currentTable: null,
        total: 0
      });

      persist({
        tenants: updatedTenants,
        currentTenant: newTenant,
        users: updatedUsers,
        hasEnteredApp: true
      });

      return true;
    },

    loginTenant: (email) => {
      const emailLower = email.toLowerCase().trim();
      const tenant = get().tenants.find(t => t.email === emailLower) || null;
      if (tenant) {
        set({ currentTenant: tenant, currentUser: null, hasEnteredApp: true, cart: [], currentTable: null, total: 0 });
        persist({ currentTenant: tenant, hasEnteredApp: true });
      }
      return tenant;
    },

    logoutTenant: () => {
      set({ currentTenant: null, currentUser: null, cart: [], currentTable: null, total: 0 });
      persist({ currentTenant: null });
    },

    deleteTenant: (tenantId) => {
      const state = get();
      
      const updatedTenants = state.tenants.filter(t => t.id !== tenantId);
      const updatedUsers = state.users.filter(u => u.tenantId !== tenantId);
      const updatedProducts = state.products.filter(p => p.tenantId !== tenantId);
      const updatedTables = state.tables.filter(t => t.tenantId !== tenantId);
      const updatedSales = state.sales.filter(s => s.tenantId !== tenantId);

      set({
        tenants: updatedTenants,
        users: updatedUsers,
        products: updatedProducts,
        tables: updatedTables,
        sales: updatedSales,
        currentTenant: null,
        currentUser: null,
        hasEnteredApp: false, // Retourner à la landing page
        cart: [],
        currentTable: null,
        total: 0
      });

      persist({
        tenants: updatedTenants,
        users: updatedUsers,
        products: updatedProducts,
        tables: updatedTables,
        sales: updatedSales,
        currentTenant: null,
        hasEnteredApp: false
      });
    },

    // Getters filtered by active tenant
    getProductsByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().products.filter(p => p.tenantId === tenantId);
    },

    getTablesByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().tables.filter(t => t.tenantId === tenantId);
    },

    getUsersByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().users.filter(u => u.tenantId === tenantId);
    },

    getSalesByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().sales.filter(s => s.tenantId === tenantId);
    },

    // Products actions
    updateStock: (productId, quantityToAdd) => {
      const product = get().products.find(p => p.id === productId);
      if (!product) return;

      const updatedProducts = get().products.map(p => 
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantityToAdd) } : p
      );

      const now = new Date();
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const formattedDate = `Le ${formatter.format(now).replace(',', ' à')}`;

      const newHistoryEntry: StockHistoryEntry = {
        id: 'stk_' + crypto.randomUUID(),
        productId,
        productName: product.name,
        quantityAdded: quantityToAdd,
        userLabel: get().currentUser?.name || 'Administrateur',
        createdAt: formattedDate,
        tenantId: product.tenantId
      };

      const updatedHistory = [newHistoryEntry, ...get().stockHistory];

      set({ 
        products: updatedProducts,
        stockHistory: updatedHistory
      });

      persist({ 
        products: updatedProducts,
        stockHistory: updatedHistory
      });
    },

    addProduct: (product) => {
      const tenantId = get().currentTenant?.id;
      const updatedProducts = [...get().products, { ...product, id: 'prd_' + crypto.randomUUID(), tenantId }];
      set({ products: updatedProducts });
      persist({ products: updatedProducts });
    },

    updateProduct: (updatedProduct) => {
      const updatedProducts = get().products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      set({ products: updatedProducts });
      persist({ products: updatedProducts });
    },

    deleteProduct: (productId) => {
      const updatedProducts = get().products.filter(p => p.id !== productId);
      set({ products: updatedProducts });
      persist({ products: updatedProducts });
    },

    // Tables actions
    addTable: (name) => {
      const tenantId = get().currentTenant?.id;
      const updatedTables = [...get().tables, { id: 'tbl_' + crypto.randomUUID(), name, tenantId }];
      set({ tables: updatedTables });
      persist({ tables: updatedTables });
    },

    updateTable: (updatedTable) => {
      const updatedTables = get().tables.map(t => t.id === updatedTable.id ? updatedTable : t);
      set({ tables: updatedTables });
      persist({ tables: updatedTables });
    },

    deleteTable: (tableId) => {
      const updatedTables = get().tables.filter(t => t.id !== tableId);
      set({ 
        tables: updatedTables,
        currentTable: get().currentTable?.id === tableId ? null : get().currentTable
      });
      persist({ tables: updatedTables });
    },

    // Users actions
    addUser: (user) => {
      const tenantId = get().currentTenant?.id;
      const updatedUsers = [...get().users, { ...user, id: 'usr_' + crypto.randomUUID(), tenantId }];
      set({ users: updatedUsers });
      persist({ users: updatedUsers });
    },

    updateUser: (updatedUser) => {
      const updatedUsers = get().users.map(u => u.id === updatedUser.id ? updatedUser : u);
      const isSelf = get().currentUser?.id === updatedUser.id;
      set({ 
        users: updatedUsers,
        currentUser: isSelf ? updatedUser : get().currentUser
      });
      persist({ users: updatedUsers });
    },

    deleteUser: (userId) => {
      const updatedUsers = get().users.filter(u => u.id !== userId);
      const isSelf = get().currentUser?.id === userId;
      set({ 
        users: updatedUsers,
        currentUser: isSelf ? null : get().currentUser
      });
      persist({ users: updatedUsers });
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    addSale: (newSale) => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const formattedDate = `Le ${formatter.format(now).replace(',', ' à')}`;
      const tenantId = get().currentTenant?.id;
      const isOnline = get().isOnline;
      
      const updatedSales = [
        {
          ...newSale,
          id: 'sale_' + crypto.randomUUID(),
          createdAt: formattedDate,
          tenantId,
          synced: isOnline,
          rawDate: now.toISOString()
        },
        ...get().sales
      ];

      set({ sales: updatedSales });
      persist({ sales: updatedSales });

      // Si on est en ligne, on synchronise immédiatement
      if (isOnline) {
        get().syncSalesWithServer();
      }
    },

    // Cart actions
    addToCart: (product) => set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...state.cart, { id: crypto.randomUUID(), product, quantity: 1 }];
      }
      const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return { cart: newCart, total: newTotal };
    }),
    
    removeFromCart: (itemId) => set((state) => {
      const newCart = state.cart.filter(item => item.id !== itemId);
      const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return { cart: newCart, total: newTotal };
    }),
    
    updateQuantity: (itemId, quantity) => set((state) => {
      if (quantity <= 0) {
        const newCart = state.cart.filter(item => item.id !== itemId);
        const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        return { cart: newCart, total: newTotal };
      }
      const newCart = state.cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return { cart: newCart, total: newTotal };
    }),
    
    clearCart: () => set({ cart: [], total: 0 }),
    
    setTable: (table) => set({ currentTable: table }),
  };
});
