import { create } from 'zustand';
import type { OrderItem, Product, Table, User, Sale, Tenant, StockHistoryEntry, SubscriptionPlan, Category } from './types';
import { mockCategories } from './data/mockData';

interface POSState {
  // SaaS Tenants
  tenants: Tenant[];
  currentTenant: Tenant | null;
  registerTenant: (email: string, establishmentName: string, adminPin: string) => Promise<boolean>;
  loginTenant: (email: string, adminPin: string) => Promise<Tenant | null>;
  logoutTenant: () => void;
  deleteTenant: (tenantId: string) => Promise<void>;
  updateTenantSubscription: (tenantId: string, plan: SubscriptionPlan, status: 'ACTIVE' | 'SUSPENDED', endDate?: string) => Promise<void>;
  updateTenantQrCode: (tenantId: string, qrCodeBase64: string) => Promise<void>;
  hasEnteredApp: boolean;
  setHasEnteredApp: (val: boolean) => void;
  isAuthenticatingSuperAdmin: boolean;
  setAuthenticatingSuperAdmin: (val: boolean) => void;

  // Impersonation (Super Admin Access)
  impersonatedFromSuperAdmin: boolean;
  impersonateTenant: (tenant: Tenant) => Promise<void>;
  exitImpersonation: () => void;

  // PWA Install Prompt
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;

  // Offline / Network Sync System
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  isSyncing: boolean;
  syncSalesWithServer: () => Promise<void>;
  syncCloudData: (tenantIdOverride?: string) => Promise<void>;
  hasUnsyncedProductsChanges: boolean;
  hasUnsyncedTablesChanges: boolean;
  hasUnsyncedUsersChanges: boolean;
  deletedCategoryIds: string[];

  // Categories
  categories: Category[];
  getCategoriesByTenant: () => Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Products & Inventory History
  products: Product[];
  getProductsByTenant: (includeInactive?: boolean) => Product[];
  stockHistory: StockHistoryEntry[];
  getStockHistoryByTenant: () => StockHistoryEntry[];
  updateStock: (productId: string, quantityToAdd: number) => void;
  updateStockHistoryEntry: (entryId: string, newProductId: string, newQuantity: number) => void;
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
  getUsersByTenant: (includeInactive?: boolean) => User[];
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
  tableCarts: Record<string, OrderItem[]>;
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

  // Theme Management
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Local Testing Environment
  isLocalTestMode: boolean;
  toggleTestMode: () => void;
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
      if (!parsed.tableCarts) parsed.tableCarts = {};
      if (!parsed.cart) parsed.cart = [];
      if (!parsed.deletedCategoryIds) parsed.deletedCategoryIds = [];
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
    categories: [],
    sales: [],
    stockHistory: [],
    deletedCategoryIds: [],
    hasEnteredApp: false,
    isAuthenticatingSuperAdmin: false,
    impersonatedFromSuperAdmin: false
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
      hasUnsyncedProductsChanges: updates.hasUnsyncedProductsChanges !== undefined ? updates.hasUnsyncedProductsChanges : state.hasUnsyncedProductsChanges,
      hasUnsyncedTablesChanges: updates.hasUnsyncedTablesChanges !== undefined ? updates.hasUnsyncedTablesChanges : state.hasUnsyncedTablesChanges,
      hasUnsyncedUsersChanges: updates.hasUnsyncedUsersChanges !== undefined ? updates.hasUnsyncedUsersChanges : state.hasUnsyncedUsersChanges,
      categories: updates.categories !== undefined ? updates.categories : state.categories,
      deletedCategoryIds: updates.deletedCategoryIds !== undefined ? updates.deletedCategoryIds : state.deletedCategoryIds,
      tableCarts: updates.tableCarts !== undefined ? updates.tableCarts : state.tableCarts,
      cart: updates.cart !== undefined ? updates.cart : state.cart,
      currentTable: updates.currentTable !== undefined ? updates.currentTable : state.currentTable,
      theme: updates.theme !== undefined ? updates.theme : state.theme,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  return {
    tenants: persistedData.tenants,
    currentTenant: persistedData.currentTenant,
    categories: persistedData.categories?.length > 0 ? persistedData.categories : mockCategories,
    deletedCategoryIds: persistedData.deletedCategoryIds || [],
    products: persistedData.products,
    tables: persistedData.tables,
    users: persistedData.users,
    sales: persistedData.sales,
    stockHistory: persistedData.stockHistory || [],
    hasEnteredApp: persistedData.hasEnteredApp || false,
    isAuthenticatingSuperAdmin: false,
    setAuthenticatingSuperAdmin: (val) => set({ isAuthenticatingSuperAdmin: val }),
    impersonatedFromSuperAdmin: false,
    isLocalTestMode: false,
    toggleTestMode: () => set(state => {
      const newMode = !state.isLocalTestMode;
      get().showNotification(
        newMode ? 'alert' : 'success', 
        newMode ? 'MODE TEST ISOLÉ ACTIVÉ : Aucune donnée ne sera synchronisée vers le cloud.' : 'MODE TEST DÉSACTIVÉ : Synchronisation cloud rétablie.'
      );
      return { isLocalTestMode: newMode };
    }),

    theme: persistedData.theme || 'dark',
    toggleTheme: () => {
      const currentTheme = get().theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Mettre à jour la classe sur l'élément html
      const htmlEl = document.documentElement;
      if (newTheme === 'light') {
        htmlEl.classList.add('light');
      } else {
        htmlEl.classList.remove('light');
      }

      set({ theme: newTheme });
      persist({ theme: newTheme });
    },

    getStockHistoryByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().stockHistory.filter(h => h.tenantId === tenantId);
    },
    
    currentUser: null,
    tableCarts: persistedData.tableCarts || {},
    cart: persistedData.cart || [],
    currentTable: persistedData.currentTable || null,
    total: (persistedData.cart || []).reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0),
    notification: null,
    
    deferredPrompt: null,
    setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),

    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    hasUnsyncedProductsChanges: persistedData.hasUnsyncedProductsChanges || false,
    hasUnsyncedTablesChanges: persistedData.hasUnsyncedTablesChanges || false,
    hasUnsyncedUsersChanges: persistedData.hasUnsyncedUsersChanges || false,

    showNotification: (type, message, onConfirm) => set({ notification: { type, message, onConfirm } }),
    hideNotification: () => set({ notification: null }),

    setOnlineStatus: (status) => set({ isOnline: status }),

    syncSalesWithServer: async () => {
      const state = get();
      if (state.isLocalTestMode) return; // Bloque la synchro en mode bac à sable
      await get().syncCloudData();
    },

    syncCloudData: async (tenantIdOverride) => {
      const state = get();
      if (state.isLocalTestMode) return; // Bloque la synchro en mode bac à sable
      if (state.isSyncing) return; // Empêche les exécutions parallèles qui causent des écrasements

      const tenantId = tenantIdOverride || state.currentTenant?.id;
      if (!tenantId) return;

      // En mode local, le serveur est joignable même sans internet,
      // on essaie toujours d'appeler l'API. Le try/catch gérera l'échec si le serveur est éteint.
      
      set({ isSyncing: true });

      try {
        // Filtrer les données locales appartenant à ce tenant (exclure le mode test)
        const unsyncedSales = state.sales.filter(s => s.tenantId === tenantId && !s.synced && !s.isTest);
        const tenantProducts = state.products.filter(p => p.tenantId === tenantId);
        const tenantTables = state.tables.filter(t => t.tenantId === tenantId);
        const tenantUsers = state.users.filter(u => u.tenantId === tenantId);
        const tenantStockHistory = state.stockHistory.filter(h => h.tenantId === tenantId && !h.isTest);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (tenantId === 'tnt_super_admin') {
          headers['X-Super-Admin-Pin'] = '9999';
        } else if (state.currentTenant?.adminPin) {
          headers['X-Tenant-Pin'] = state.currentTenant.adminPin;
        }

        const sentProductsChanges = state.hasUnsyncedProductsChanges;
        const sentTablesChanges = state.hasUnsyncedTablesChanges;
        const sentUsersChanges = state.hasUnsyncedUsersChanges;

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tenantId,
            localSales: unsyncedSales,
            localProducts: sentProductsChanges ? tenantProducts : undefined,
            localTables: sentTablesChanges ? tenantTables : undefined,
            localUsers: sentUsersChanges ? tenantUsers : undefined,
            localCategories: get().categories.filter(c => c.tenantId === tenantId),
            deletedCategories: state.deletedCategoryIds,
            localStockHistory: tenantStockHistory
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errorMsg = errData.error || "Erreur de réponse de l'API de synchronisation.";
          
          if (response.status === 404) {
            get().showNotification('error', "Établissement introuvable sur le serveur. Veuillez vous déconnecter et vous reconnecter.");
          } else if (response.status === 401) {
            get().showNotification('error', "Code PIN d'établissement incorrect ou session expirée. Veuillez vous déconnecter et vous reconnecter.");
          }
          
          throw new Error(errorMsg);
        }

        const data = await response.json();

        // RELIRE L'ÉTAT LE PLUS FRAIS APRÈS L'APPEL RÉSEAU (Évite d'écraser des ventes faites pendant le fetch)
        const currentState = get();

        // Mettre à jour l'état local avec les données issues du Cloud
        // 1. Fusionner les ventes (en marquant celles qui viennent d'être synchronisées)
        const syncedSaleIds = new Set(unsyncedSales.map(s => s.id));
        const updatedLocalSales = currentState.sales.map(s => 
          syncedSaleIds.has(s.id) ? { ...s, synced: true } : s
        );

        // Intégrer les ventes récupérées du serveur en évitant les doublons
        const localSaleIds = new Set(updatedLocalSales.map(s => s.id));
        const finalSales = [
          ...updatedLocalSales,
          ...data.sales.filter((s: any) => !localSaleIds.has(s.id))
        ];

        // 2. Fusionner l'historique de stock (Append-only : on garde tout le local, on ajoute le serveur manquant)
        const localHistoryIds = new Set(currentState.stockHistory.map(h => h.id));
        const missingServerHistory = data.stockHistory.filter((h: any) => !localHistoryIds.has(h.id));
        const finalStockHistory = [...currentState.stockHistory, ...missingServerHistory];

        // 3. Fusionner les Produits, Tables et Utilisateurs
        // Le serveur est la source de vérité : il a déjà traité et fusionné nos modifications locales envoyées.
        const otherTenantsProducts = currentState.products.filter(p => p.tenantId !== tenantId);
        const finalProducts = [...otherTenantsProducts, ...data.products];

        const otherTenantsTables = currentState.tables.filter(t => t.tenantId !== tenantId);
        const finalTables = [...otherTenantsTables, ...data.tables];

        const otherTenantsUsers = currentState.users.filter(u => u.tenantId !== tenantId);
        const finalUsers = [...otherTenantsUsers, ...data.users];

        // 4. Fusionner les Catégories
        // Les catégories mock n'ont pas de tenantId, on les conserve.
        const otherCategories = currentState.categories.filter(c => c.tenantId !== tenantId);
        // On remplace celles du tenant par celles du serveur (le serveur est source de vérité si pas de "hasUnsyncedCategoriesChanges" que je n'ai pas implémenté)
        // Simplification : on prend les données du serveur pour ce tenant, et on garde celles d'autres tenants + globales.
        const finalCategories = [...otherCategories, ...(data.categories || [])];

        set({
          products: finalProducts,
          tables: finalTables,
          users: finalUsers,
          categories: finalCategories,
          stockHistory: finalStockHistory,
          sales: finalSales,
          isSyncing: false,
          deletedCategoryIds: [],
          hasUnsyncedProductsChanges: currentState.hasUnsyncedProductsChanges && !sentProductsChanges,
          hasUnsyncedTablesChanges: currentState.hasUnsyncedTablesChanges && !sentTablesChanges,
          hasUnsyncedUsersChanges: currentState.hasUnsyncedUsersChanges && !sentUsersChanges
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
          categories: finalCategories,
          deletedCategoryIds: [],
          stockHistory: finalStockHistory,
          sales: finalSales,
          tenants: data.allTenants && data.allTenants.length > 0 ? data.allTenants : state.tenants
        });

        if (unsyncedSales.length > 0) {
          state.showNotification('alert', `${unsyncedSales.length} ticket(s) de vente synchronisé(s) en ligne !`);
        }

      } catch (err: any) {
        console.error('Échec de la synchronisation cloud :', err);
        set({ isSyncing: false });
        // En cas d'erreur de réseau (ex: serveur injoignable, coupure WiFi)
        if (err.message === 'Failed to fetch' || err.name === 'TypeError' || !navigator.onLine) {
          set({ isOnline: false });
        }
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
          const errorMessage = errData.configError || errData.error || 'Erreur lors de la création de l\'établissement.';
          state.showNotification('alert', errorMessage);
          return false;
        }

        const { tenant: newTenant, admin: adminUser } = await response.json();

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

    loginTenant: async (email, adminPin) => {
      const emailLower = email.toLowerCase().trim();
      const state = get();

      // Intercepter la connexion Super-Admin
      if (emailLower === 'admin@gecko.com' && adminPin === '9999') {
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
          currentTenant: superAdminTenant,
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
              email: emailLower,
              adminPin
            })
          });

          if (response.ok) {
            tenant = await response.json();
          } else {
             // Si la requête a échoué (ex: 401 Unauthorized pour mauvais PIN), on arrête ici pour ne pas bypasser hors-ligne
             const errorData = await response.json();
             state.showNotification('error', errorData.error || 'Erreur de connexion.');
             return null;
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

    impersonateTenant: async (tenant) => {
      const state = get();
      
      // Trouver l'utilisateur admin de ce tenant (ou en créer un factice pour le support)
      // L'API a potentiellement chargé quelques users, on essaie d'en trouver un.
      let adminUser = state.users.find(u => u.tenantId === tenant.id && u.role === 'ADMIN');
      
      if (!adminUser) {
        adminUser = {
          id: `support_${tenant.id}`,
          name: 'Support Gecko',
          pinCode: '0000',
          role: 'ADMIN',
          tenantId: tenant.id
        };
      }

      set({
        currentTenant: tenant,
        currentUser: adminUser,
        isAuthenticatingSuperAdmin: false,
        impersonatedFromSuperAdmin: true,
        hasEnteredApp: true // Basculer directement dans l'application
      });

      // Synchroniser les données pour cet établissement
      await get().syncCloudData(tenant.id);
    },

    exitImpersonation: () => {
      // Reconstituer le tenant virtuel du Super Admin
      const superAdminTenant: Tenant = {
        id: 'tnt_super_admin',
        email: 'admin@gecko.com',
        establishmentName: 'Administration Cloud',
        adminPin: '9999',
        plan: 'ULTRA',
        status: 'ACTIVE'
      };

      set({
        currentTenant: superAdminTenant,
        currentUser: null, // Le super admin n'est pas un utilisateur caissier
        impersonatedFromSuperAdmin: false,
        isAuthenticatingSuperAdmin: true,
        hasEnteredApp: true // Rester dans le dashboard SuperAdmin
      });
    },

    deleteTenant: async (tenantId) => {
      const state = get();
      
      // Supprimer sur le Cloud si en ligne
      if (state.isOnline) {
        try {
          await fetch('/api/tenants', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-super-admin-pin': '9999'
            },
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

    updateTenantSubscription: async (tenantId, plan, status, endDate) => {
      const state = get();

      // Mettre à jour sur le Cloud si en ligne et mode test désactivé
      if (state.isOnline && !state.isLocalTestMode) {
        try {
          await fetch('/api/tenants', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-super-admin-pin': '9999'
            },
            body: JSON.stringify({ action: 'update', tenantId, plan, status, subscriptionEndDate: endDate })
          });
        } catch (err) {
          console.error('Erreur API modification plan tenant:', err);
        }
      }

      const updatedTenants = state.tenants.map(t => 
        t.id === tenantId ? { ...t, plan, status, subscriptionEndDate: endDate ?? t.subscriptionEndDate } : t
      );

      set({ tenants: updatedTenants });
      persist({ tenants: updatedTenants });

      // Mettre à jour currentTenant s'il s'agit du tenant actuellement connecté
      if (state.currentTenant?.id === tenantId) {
        set({ 
          currentTenant: { 
            ...state.currentTenant, 
            plan, 
            status, 
            subscriptionEndDate: endDate ?? state.currentTenant.subscriptionEndDate 
          } 
        });
      }
    },

    updateTenantQrCode: async (tenantId, qrCodeBase64) => {
      const state = get();

      if (state.isOnline) {
        try {
          await fetch('/api/tenants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_qr', tenantId, qrCodeBase64 })
          });
        } catch (err) {
          console.error('Erreur API modification QR Code:', err);
        }
      }

      const updatedTenants = state.tenants.map(t => 
        t.id === tenantId ? { ...t, mobileMoneyQrCode: qrCodeBase64 } : t
      );

      set({ tenants: updatedTenants });
      persist({ tenants: updatedTenants });

      // Mettre à jour currentTenant s'il s'agit du tenant actuellement connecté
      if (state.currentTenant?.id === tenantId) {
        set({ currentTenant: { ...state.currentTenant, mobileMoneyQrCode: qrCodeBase64 } });
      }
    },

    // Categories actions
    addCategory: (category) => {
      const tenantId = get().currentTenant?.id;
      const updatedCategories = [...get().categories, { ...category, id: 'cat_' + crypto.randomUUID(), tenantId }];
      set({ categories: updatedCategories }); // Sync plus tard
      persist({ categories: updatedCategories });
      get().syncCloudData().catch(console.error);
    },

    updateCategory: (category) => {
      const tenantId = get().currentTenant?.id;
      // S'assurer que la catégorie modifiée est associée au bon tenantId 
      // (Même si c'était une catégorie "système" sans tenantId à l'origine, elle devient propre à ce tenant)
      const updatedCat = { ...category, tenantId: category.tenantId || tenantId };
      const updatedCategories = get().categories.map(c => c.id === category.id ? updatedCat : c);
      set({ categories: updatedCategories });
      persist({ categories: updatedCategories });
      get().syncCloudData().catch(console.error);
    },

    deleteCategory: (categoryId) => {
      const state = get();
      const updatedCategories = state.categories.filter(c => c.id !== categoryId);
      const isCustomCategory = state.categories.some(c => c.id === categoryId && c.tenantId);
      
      const newDeletedIds = isCustomCategory 
        ? [...state.deletedCategoryIds, categoryId]
        : state.deletedCategoryIds;

      set({ 
        categories: updatedCategories, 
        deletedCategoryIds: newDeletedIds 
      });
      persist({ 
        categories: updatedCategories, 
        deletedCategoryIds: newDeletedIds 
      });
      get().syncCloudData().catch(console.error);
    },

    // Getters filtered by active tenant
    getCategoriesByTenant: () => {
      const state = get();
      const tenantId = state.currentTenant?.id;
      // Retourne les catégories du tenant + celles par défaut (mock) qui n'ont pas de tenantId (globales)
      return state.categories.filter(c => c.tenantId === tenantId || !c.tenantId);
    },

    getProductsByTenant: (includeInactive = false) => {
      const state = get();
      const all = state.products.filter(p => p.tenantId === state.currentTenant?.id);
      return includeInactive ? all : all.filter(p => p.isAvailable !== false);
    },

    getTablesByTenant: () => {
      const tenantId = get().currentTenant?.id;
      return get().tables.filter(t => t.tenantId === tenantId && t.isActive !== false);
    },

    getUsersByTenant: (includeInactive = false) => {
      const state = get();
      const all = state.users.filter(u => u.tenantId === state.currentTenant?.id);
      return includeInactive ? all : all.filter(u => u.isActive !== false);
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

      const isTest = get().isLocalTestMode;
      const newHistoryEntry: StockHistoryEntry = {
        id: 'stk_' + crypto.randomUUID(),
        productId,
        productName: product.name,
        quantityAdded: quantityToAdd,
        userLabel: get().currentUser?.name || 'Administrateur',
        createdAt: formattedDate,
        tenantId: product.tenantId,
        rawDate: now.toISOString(),
        isTest
      };

      const updatedHistory = [newHistoryEntry, ...get().stockHistory];

      set({ 
        products: updatedProducts,
        stockHistory: updatedHistory,
        hasUnsyncedProductsChanges: isTest ? get().hasUnsyncedProductsChanges : true
      });

      persist({ 
        products: updatedProducts,
        stockHistory: updatedHistory
      });

      get().syncCloudData().catch(console.error);
    },

    updateStockHistoryEntry: (entryId, newProductId, newQuantity) => {
      const state = get();
      const entry = state.stockHistory.find(e => e.id === entryId);
      if (!entry) return;

      const oldProductId = entry.productId;
      const oldQuantity = entry.quantityAdded;

      // Récupérer le nouveau produit
      const newProduct = state.products.find(p => p.id === newProductId);
      if (!newProduct) return;

      // Mettre à jour les stocks correspondants
      const updatedProducts = state.products.map(p => {
        let currentStock = p.stock;
        
        // Si c'est l'ancien produit, on annule l'ancienne quantité ajoutée
        if (p.id === oldProductId) {
          currentStock = Math.max(0, currentStock - oldQuantity);
        }
        
        // Si c'est le nouveau produit, on applique la nouvelle quantité
        if (p.id === newProductId) {
          // Si le nouveau produit est aussi l'ancien produit (juste la quantité change),
          // on a déjà fait Math.max(0, currentStock - oldQuantity). On y ajoute la nouvelle.
          currentStock = Math.max(0, currentStock + newQuantity);
        }
        
        return p.id === oldProductId || p.id === newProductId
          ? { ...p, stock: currentStock }
          : p;
      });

      // Mettre à jour l'entrée de l'historique
      const updatedHistory = state.stockHistory.map(e => {
        if (e.id === entryId) {
          return {
            ...e,
            productId: newProductId,
            productName: newProduct.name,
            quantityAdded: newQuantity,
            // Optionnel : indiquer que l'entrée a été modifiée
            userLabel: `${state.currentUser?.name || 'Administrateur'} (Modifié)`
          };
        }
        return e;
      });

      set({
        products: updatedProducts,
        stockHistory: updatedHistory,
        hasUnsyncedProductsChanges: state.isLocalTestMode ? state.hasUnsyncedProductsChanges : true
      });

      persist({
        products: updatedProducts,
        stockHistory: updatedHistory
      });

      state.syncCloudData().catch(console.error);
    },

    addProduct: (product) => {
      const tenantId = get().currentTenant?.id;
      const updatedProducts = [...get().products, { ...product, id: 'prd_' + crypto.randomUUID(), tenantId }];
      set({ products: updatedProducts, hasUnsyncedProductsChanges: true });
      persist({ products: updatedProducts });
      get().syncCloudData().catch(console.error);
    },

    updateProduct: (updatedProduct) => {
      const updatedProducts = get().products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      set({ products: updatedProducts, hasUnsyncedProductsChanges: true });
      persist({ products: updatedProducts });
      get().syncCloudData().catch(console.error);
    },

    deleteProduct: (productId) => {
      const updatedProducts = get().products.map(p => p.id === productId ? { ...p, isAvailable: false } : p);
      set({ products: updatedProducts, hasUnsyncedProductsChanges: true });
      persist({ products: updatedProducts });
      get().syncCloudData().catch(console.error);
    },

    // Tables actions
    addTable: (name) => {
      const tenantId = get().currentTenant?.id;
      const updatedTables = [...get().tables, { id: 'tbl_' + crypto.randomUUID(), name, tenantId }];
      set({ tables: updatedTables, hasUnsyncedTablesChanges: true });
      persist({ tables: updatedTables });
      get().syncCloudData().catch(console.error);
    },

    updateTable: (updatedTable) => {
      const updatedTables = get().tables.map(t => t.id === updatedTable.id ? { ...t, ...updatedTable } : t);
      set({ tables: updatedTables, hasUnsyncedTablesChanges: true });
      persist({ tables: updatedTables });
      get().syncCloudData().catch(console.error);
    },

    deleteTable: (tableId) => {
      const updatedTables = get().tables.map(t => t.id === tableId ? { ...t, isActive: false } : t);
      set({ 
        tables: updatedTables,
        currentTable: get().currentTable?.id === tableId ? null : get().currentTable,
        hasUnsyncedTablesChanges: true
      });
      persist({ tables: updatedTables });
      get().syncCloudData().catch(console.error);
    },

    // Users actions
    addUser: (user) => {
      const tenantId = get().currentTenant?.id;
      const updatedUsers = [...get().users, { ...user, id: 'usr_' + crypto.randomUUID(), tenantId }];
      set({ users: updatedUsers, hasUnsyncedUsersChanges: true });
      persist({ users: updatedUsers });
      get().syncCloudData().catch(console.error);
    },

    updateUser: (updatedUser) => {
      const updatedUsers = get().users.map(u => u.id === updatedUser.id ? updatedUser : u);
      const isSelf = get().currentUser?.id === updatedUser.id;
      set({ 
        users: updatedUsers,
        currentUser: isSelf ? updatedUser : get().currentUser,
        hasUnsyncedUsersChanges: true
      });
      persist({ users: updatedUsers });
      get().syncCloudData().catch(console.error);
    },

    deleteUser: (userId) => {
      const updatedUsers = get().users.map(u => u.id === userId ? { ...u, isActive: false } : u);
      const isSelf = get().currentUser?.id === userId;
      set({ 
        users: updatedUsers,
        currentUser: isSelf ? null : get().currentUser,
        hasUnsyncedUsersChanges: true
      });
      persist({ users: updatedUsers });
      get().syncCloudData().catch(console.error);
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
      const isTest = get().isLocalTestMode;
      
      const updatedSales = [
        {
          ...newSale,
          id: 'sale_' + crypto.randomUUID(),
          createdAt: formattedDate,
          tenantId,
          synced: false,
          isTest,
          rawDate: now.toISOString()
        },
        ...get().sales
      ];

      set({ sales: updatedSales });
      persist({ sales: updatedSales });

      persist({ sales: updatedSales });

      // Synchronisation immédiate vers la BDD locale en tâche de fond
      get().syncSalesWithServer();
    },

    // Cart actions
    addToCart: (product) => set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id);
      
      // Empêcher d'ajouter plus que le stock disponible
      if (existingItem && existingItem.quantity >= product.stock) return state;
      if (!existingItem && product.stock <= 0) return state;

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
      
      const tableKey = state.currentTable ? state.currentTable.id : 'direct';
      const updatedTableCarts = {
        ...state.tableCarts,
        [tableKey]: newCart
      };

      persist({ cart: newCart, tableCarts: updatedTableCarts });
      return { cart: newCart, total: newTotal, tableCarts: updatedTableCarts };
    }),
    
    removeFromCart: (itemId) => set((state) => {
      const newCart = state.cart.filter(item => item.id !== itemId);
      const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      const tableKey = state.currentTable ? state.currentTable.id : 'direct';
      const updatedTableCarts = {
        ...state.tableCarts,
        [tableKey]: newCart
      };

      persist({ cart: newCart, tableCarts: updatedTableCarts });
      return { cart: newCart, total: newTotal, tableCarts: updatedTableCarts };
    }),
    
    updateQuantity: (itemId, quantity) => set((state) => {
      let newCart;
      if (quantity <= 0) {
        newCart = state.cart.filter(item => item.id !== itemId);
      } else {
        const itemToUpdate = state.cart.find(item => item.id === itemId);
        if (itemToUpdate && quantity > itemToUpdate.product.stock) {
          return state; // Empêcher de dépasser le stock
        }
        newCart = state.cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
      }
      const newTotal = newCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      const tableKey = state.currentTable ? state.currentTable.id : 'direct';
      const updatedTableCarts = {
        ...state.tableCarts,
        [tableKey]: newCart
      };

      persist({ cart: newCart, tableCarts: updatedTableCarts });
      return { cart: newCart, total: newTotal, tableCarts: updatedTableCarts };
    }),
    
    clearCart: () => set((state) => {
      const tableKey = state.currentTable ? state.currentTable.id : 'direct';
      const updatedTableCarts = {
        ...state.tableCarts,
        [tableKey]: []
      };
      persist({ cart: [], tableCarts: updatedTableCarts });
      return { cart: [], total: 0, tableCarts: updatedTableCarts };
    }),
    
    setTable: (table) => set((state) => {
      const tableKey = table ? table.id : 'direct';
      const loadedCart = state.tableCarts[tableKey] || [];
      const newTotal = loadedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      
      persist({ currentTable: table, cart: loadedCart });
      return { currentTable: table, cart: loadedCart, total: newTotal };
    }),
  };
});
