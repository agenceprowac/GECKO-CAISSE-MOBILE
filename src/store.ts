import { create } from 'zustand';
import type { OrderItem, Product, Table, User, Sale, Tenant, StockHistoryEntry, SubscriptionPlan } from './types';

interface POSState {
  // SaaS Tenants
  tenants: Tenant[];
  currentTenant: Tenant | null;
  registerTenant: (email: string, establishmentName: string, adminPin: string) => Promise<boolean>;
  loginTenant: (email: string) => Promise<Tenant | null>;
  logoutTenant: () => void;
  deleteTenant: (tenantId: string) => Promise<void>;
  updateTenantSubscription: (tenantId: string, plan: SubscriptionPlan, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  hasEnteredApp: boolean;
  setHasEnteredApp: (val: boolean) => void;
  isAuthenticatingSuperAdmin: boolean;
  setAuthenticatingSuperAdmin: (val: boolean) => void;

  // PWA Install Prompt
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;

  // Offline / Network Sync System
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  isSyncing: boolean;
  syncSalesWithServer: () => Promise<void>;
  syncCloudData: (tenantIdOverride?: string) => Promise<void>;

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
  notification: { type: 'success' | 'alert' | 'error' | 'confirm'; message: string; onConfirm?: () => void } | null;
  showNotification: (type: 'success' | 'alert' | 'error' | 'confirm', message: string, onConfirm?: () => void) => void;
  hideNotification: () => void;
}

// Helper local storage key
const STORAGE_KEY = 'gecko_caisse_saas_data';

// Load state from localStorage or load default empty SaaS structure
const loadPersistedData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // S'assurer que le tableau stockHistory existe s'il n'a pas été sauvegardé auparavant
      if (!parsed.stockHistory) parsed.stockHistory = [];
      return parsed;
    }
  } catch (e) {
    console.error("Error loading localStorage data", e);
  }

  // Initialisation d'un établissement de démonstration universel par défaut
  const demoTenantId = 'tnt_demo_gecko';
  const demoUserId = 'usr_demo_admin';
  const superAdminUserId = 'usr_super_admin';
  
  return {
    tenants: [
      {
        id: demoTenantId,
        email: 'test@test.com',
        establishmentName: 'Le Gecko Bar',
        adminPin: '1111',
        plan: 'STANDARD',
        status: 'ACTIVE'
      }
    ],
    currentTenant: null,
    products: [],
    tables: [],
    users: [
      {
        id: demoUserId,
        name: 'Lionel Admin',
        pinCode: '1111',
        role: 'ADMIN',
        tenantId: demoTenantId
      },
      {
        id: superAdminUserId,
        name: 'Lionel Super-Admin',
        pinCode: '9999',
        role: 'SUPER_ADMIN'
      }
    ],
    sales: [],
    stockHistory: [],
    hasEnteredApp: false,
    isAuthenticatingSuperAdmin: false
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
    isAuthenticatingSuperAdmin: false,
    setAuthenticatingSuperAdmin: (val) => set({ isAuthenticatingSuperAdmin: val }),

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
      await get().syncCloudData();
    },

    syncCloudData: async (tenantIdOverride) => {
      const state = get();
      const tenantId = tenantIdOverride || state.currentTenant?.id;
      if (!tenantId) return;

      // Si le client est offline, on ne tente pas d'appeler l'API
      if (!state.isOnline) return;

      set({ isSyncing: true });

      try {
        // Filtrer les données locales appartenant à ce tenant
        const unsyncedSales = state.sales.filter(s => s.tenantId === tenantId && !s.synced);
        const tenantProducts = state.products.filter(p => p.tenantId === tenantId);
        const tenantTables = state.tables.filter(t => t.tenantId === tenantId);
        const tenantUsers = state.users.filter(u => u.tenantId === tenantId);
        const tenantStockHistory = state.stockHistory.filter(h => h.tenantId === tenantId);

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tenantId,
            localSales: unsyncedSales,
            localProducts: tenantProducts,
            localTables: tenantTables,
            localUsers: tenantUsers,
            localStockHistory: tenantStockHistory
          })
        });

        if (!response.ok) {
          throw new Error('Erreur de réponse de l\'API de synchronisation.');
        }

        const data = await response.json();

        // Mettre à jour l'état local avec les données issues du Cloud
        // 1. Fusionner les ventes (en marquant celles qui viennent d'être synchronisées)
        const syncedSaleIds = new Set(unsyncedSales.map(s => s.id));
        const updatedLocalSales = state.sales.map(s => 
          syncedSaleIds.has(s.id) ? { ...s, synced: true } : s
        );

        // Intégrer les ventes récupérées du serveur en évitant les doublons
        const localSaleIds = new Set(updatedLocalSales.map(s => s.id));
        const finalSales = [
          ...updatedLocalSales,
          ...data.sales.filter((s: any) => !localSaleIds.has(s.id))
        ];

        // 2. Remplacer/Fusionner les listes de produits, tables, utilisateurs, historique de stock
        const otherTenantsProducts = state.products.filter(p => p.tenantId !== tenantId);
        const finalProducts = [...otherTenantsProducts, ...data.products];

        const otherTenantsTables = state.tables.filter(t => t.tenantId !== tenantId);
        const finalTables = [...otherTenantsTables, ...data.tables];

        const otherTenantsUsers = state.users.filter(u => u.tenantId !== tenantId);
        const finalUsers = [...otherTenantsUsers, ...data.users];

        const otherTenantsStockHistory = state.stockHistory.filter(h => h.tenantId !== tenantId);
        const finalStockHistory = [...otherTenantsStockHistory, ...data.stockHistory];

        set({
          products: finalProducts,
          tables: finalTables,
          users: finalUsers,
          stockHistory: finalStockHistory,
          sales: finalSales,
          isSyncing: false
        });

        // Mettre à jour le tenant actuel s'il a changé (ex: son plan ou statut modifié par le Super-Admin)
        if (data.tenant && state.currentTenant && data.tenant.id === state.currentTenant.id) {
          set({ currentTenant: data.tenant });
        }

        // Si on est le Super-Admin, on récupère tous les tenants en plus
        if (data.allTenants && data.allTenants.length > 0) {
          set({ tenants: data.allTenants });
        }

        // Sauvegarder dans le localStorage local pour le mode offline
        persist({
          products: finalProducts,
          tables: finalTables,
          users: finalUsers,
          stockHistory: finalStockHistory,
          sales: finalSales,
          tenants: data.allTenants && data.allTenants.length > 0 ? data.allTenants : state.tenants
        });

        if (unsyncedSales.length > 0) {
          state.showNotification('alert', `${unsyncedSales.length} ticket(s) de vente synchronisé(s) en ligne !`);
        }

      } catch (err) {
        console.error('Échec de la synchronisation cloud :', err);
        set({ isSyncing: false });
      }
    },

    setHasEnteredApp: (val) => {
      set({ hasEnteredApp: val });
      persist({ hasEnteredApp: val });
    },

    registerTenant: async (email, establishmentName, adminPin) => {
      const emailLower = email.toLowerCase().trim();
      const state = get();

      // Si le client est offline, on ne peut pas créer un compte global
      if (!state.isOnline) {
        state.showNotification('alert', 'Connexion internet requise pour créer un nouvel établissement.');
        return false;
      }

      try {
        const response = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email: emailLower,
            establishmentName,
            adminPin
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          state.showNotification('alert', errData.error || 'Erreur lors de la création de l\'établissement.');
          return false;
        }

        const newTenant = await response.json();

        // Créer l'employé admin par défaut en local pour cet appareil
        const adminUser: User = {
          id: 'usr_' + crypto.randomUUID(),
          name: establishmentName + ' Admin',
          pinCode: adminPin,
          role: 'ADMIN',
          tenantId: newTenant.id
        };

        const updatedTenants = [...state.tenants, newTenant];
        const updatedUsers = [...state.users, adminUser];

        set({
          tenants: updatedTenants,
          currentTenant: newTenant,
          users: updatedUsers,
          currentUser: adminUser,
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

        // Lancer la première synchronisation cloud pour initialiser la base
        await state.syncCloudData(newTenant.id);

        return true;
      } catch (error) {
        console.error('Erreur inscription tenant:', error);
        state.showNotification('alert', 'Une erreur réseau est survenue. Veuillez réessayer.');
        return false;
      }
    },

    loginTenant: async (email) => {
      const emailLower = email.toLowerCase().trim();
      const state = get();

      // Intercepter la connexion Super-Admin
      if (emailLower === 'admin@gecko.com') {
        const superAdminTenant: Tenant = {
          id: 'tnt_super_admin',
          email: 'admin@gecko.com',
          establishmentName: 'Administration Cloud',
          adminPin: '9999',
          plan: 'ULTRA',
          status: 'ACTIVE'
        };

        // Activer l'état temporaire d'authentification Super-Admin
        set({ 
          currentTenant: null, // Aucun tenant de caisse !
          currentUser: null,
          isAuthenticatingSuperAdmin: true,
          hasEnteredApp: true
        });

        // Charger tous les tenants depuis le serveur (en mode fantôme)
        await get().syncCloudData('tnt_super_admin');

        return superAdminTenant;
      }

      let tenant: Tenant | null = null;

      // 1. Tenter la récupération en ligne (si on est connecté à internet)
      if (state.isOnline) {
        try {
          const response = await fetch('/api/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'login',
              email: emailLower
            })
          });

          if (response.ok) {
            tenant = await response.json();
          }
        } catch (err) {
          console.warn('Échec appel API Login, fallback local...', err);
        }
      }

      // 2. Fallback local si offline ou si l'API a échoué (sécurité hors-ligne)
      if (!tenant) {
        tenant = state.tenants.find(t => t.email === emailLower) || null;
      }

      // Injection de secours pour test@test.com
      if (!tenant && emailLower === 'test@test.com') {
        const demoTenantId = 'tnt_demo_gecko';
        const demoUserId = 'usr_demo_admin';
        
        const demoTenant: Tenant = {
          id: demoTenantId,
          email: 'test@test.com',
          establishmentName: 'Le Gecko Bar',
          adminPin: '1111',
          plan: 'STANDARD',
          status: 'ACTIVE'
        };

        const demoUser: User = {
          id: demoUserId,
          name: 'Lionel Admin',
          pinCode: '1111',
          role: 'ADMIN' as const,
          tenantId: demoTenantId
        };

        set({
          tenants: [...state.tenants, demoTenant],
          users: [...state.users, demoUser]
        });

        tenant = demoTenant;
      }

      if (tenant) {
        // Bloquer la connexion si l'établissement est suspendu
        if (tenant.status === 'SUSPENDED') {
          state.showNotification('alert', 'Votre espace de caisse a été suspendu pour défaut de paiement. Veuillez contacter l\'administrateur SaaS.');
          return null;
        }

        set({ currentTenant: tenant, currentUser: null, hasEnteredApp: true, cart: [], currentTable: null, total: 0 });
        persist({ 
          tenants: get().tenants,
          users: get().users,
          currentTenant: tenant, 
          hasEnteredApp: true 
        });

        // Lancer la synchronisation cloud en tâche de fond pour charger les produits à jour
        await get().syncCloudData(tenant.id);
      }
      return tenant;
    },

    logoutTenant: () => {
      set({ currentTenant: null, currentUser: null, cart: [], currentTable: null, total: 0 });
      persist({ currentTenant: null });
    },

    deleteTenant: async (tenantId) => {
      const state = get();
      
      // Supprimer sur le Cloud si en ligne
      if (state.isOnline) {
        try {
          await fetch('/api/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', tenantId })
          });
        } catch (err) {
          console.error('Erreur API suppression tenant:', err);
        }
      }

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

    updateTenantSubscription: async (tenantId, plan, status) => {
      const state = get();

      // Mettre à jour sur le Cloud si en ligne
      if (state.isOnline) {
        try {
          await fetch('/api/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', tenantId, plan, status })
          });
        } catch (err) {
          console.error('Erreur API modification plan tenant:', err);
        }
      }

      const updatedTenants = state.tenants.map(t => 
        t.id === tenantId ? { ...t, plan, status } : t
      );

      set({ tenants: updatedTenants });
      persist({ tenants: updatedTenants });
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
