// api/sync.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { tenantId, localSales, localProducts, localTables, localUsers, localStockHistory, localCategories, deletedCategories } = req.body;

  try {
    const fs = await import('fs');
    fs.appendFileSync(
      'api_debug.log',
      `[${new Date().toISOString()}] Sync call: localTables=${JSON.stringify(localTables)}\n`
    );
  } catch {}

  if (!tenantId) {
    return res.status(400).json({ error: 'ID de l\'établissement requis pour la synchronisation.' });
  }

  try {
    // === Sécurisation de l'API ===
    const tenantPin = req.headers['x-tenant-pin'];
    const superAdminPin = req.headers['x-super-admin-pin'];

    if (tenantId === 'tnt_super_admin') {
      if (superAdminPin !== '9999') {
        return res.status(401).json({ error: 'Accès Super-Admin non autorisé.' });
      }
    } else {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      if (!tenant) {
        return res.status(404).json({ error: "Établissement introuvable." });
      }
      if (tenant.adminPin !== tenantPin) {
        return res.status(401).json({ error: "Code PIN d'établissement incorrect ou manquant." });
      }
    }

    // 0. Traiter les suppressions de catégories (tombstones)
    if (deletedCategories && Array.isArray(deletedCategories) && deletedCategories.length > 0) {
      await prisma.category.deleteMany({
        where: {
          id: { in: deletedCategories },
          tenantId: tenantId
        }
      });
    }

    // 0. Synchroniser les catégories locales (en leur attribuant le tenantId courant si manquant)
    if (localCategories !== undefined && Array.isArray(localCategories)) {
      for (const cat of localCategories) {
        const catTenantId = cat.tenantId || tenantId;
        
        await prisma.category.upsert({
          where: { id: cat.id },
          update: {
            name: cat.name || 'Général',
            color: cat.color || null,
            icon: cat.icon || null
          },
          create: {
            id: cat.id,
            tenantId: catTenantId,
            name: cat.name || 'Général',
            color: cat.color || null,
            icon: cat.icon || null
          }
        });
      }
    }

    // 1. Enregistrer ou mettre à jour les produits locaux s'il y a lieu
    if (localProducts !== undefined && Array.isArray(localProducts)) {
      for (const prod of localProducts) {
        let categoryId = prod.categoryId || 'cat_default';

        // Auto-guérison : Vérifier si la catégorie existe dans Supabase pour ce tenant pour éviter une violation de clé étrangère
        const existingCategory = await prisma.category.findUnique({
          where: { id: categoryId }
        });

        if (!existingCategory) {
          await prisma.category.create({
            data: {
              id: categoryId,
              tenantId: tenantId,
              name: 'Général',
              color: 'bg-dark-600',
              icon: 'Tag'
            }
          });
        }

        await prisma.product.upsert({
          where: { id: prod.id },
          update: {
            name: prod.name,
            price: prod.price,
            purchasePrice: prod.purchasePrice || 0,
            stock: prod.stock,
            isAvailable: prod.isAvailable !== false,
            image: prod.image || null,
            categoryId: categoryId
          },
          create: {
            id: prod.id,
            tenantId: tenantId,
            categoryId: categoryId,
            name: prod.name,
            price: prod.price,
            purchasePrice: prod.purchasePrice || 0,
            stock: prod.stock,
            isAvailable: prod.isAvailable !== false,
            image: prod.image || null
          }
        });
      }
    }

    // 2. Synchroniser les tables locales (uniquement si envoyé par le client)
    if (localTables !== undefined && Array.isArray(localTables)) {
      const localTableIds = localTables.map(t => t.id);

      // Supprimer les commandes associées aux tables supprimées pour éviter les violations de clés étrangères
      await prisma.order.deleteMany({
        where: {
          tenantId: tenantId,
          tableId: { notIn: localTableIds }
        }
      });

      // Supprimer les tables qui ne sont plus dans la liste locale
      await prisma.table.deleteMany({
        where: {
          tenantId: tenantId,
          id: { notIn: localTableIds }
        }
      });

      for (const tbl of localTables) {
        await prisma.table.upsert({
          where: { id: tbl.id },
          update: { name: tbl.name },
          create: {
            id: tbl.id,
            tenantId: tenantId,
            name: tbl.name
          }
        });
      }
    }

    // 3. Synchroniser les profils utilisateurs (uniquement si envoyé par le client)
    if (localUsers !== undefined && Array.isArray(localUsers)) {
      for (const usr of localUsers) {
        // Ignorer l'utilisateur virtuel Super-Admin dans le stockage du tenant
        if (usr.role === 'SUPER_ADMIN') continue;

        await prisma.user.upsert({
          where: { id: usr.id },
          update: {
            name: usr.name,
            pinCode: usr.pinCode,
            role: usr.role,
            isActive: usr.isActive !== false
          },
          create: {
            id: usr.id,
            tenantId: tenantId,
            name: usr.name,
            pinCode: usr.pinCode,
            role: usr.role,
            isActive: usr.isActive !== false
          }
        });
      }
    }

    // 4. Synchroniser l'historique de stock (avec vérification d'existence du produit)
    if (localStockHistory && Array.isArray(localStockHistory)) {
      for (const entry of localStockHistory) {
        const entryExists = await prisma.stockHistoryEntry.findUnique({ where: { id: entry.id } });
        if (!entryExists) {
          const productExists = await prisma.product.findUnique({ where: { id: entry.productId } });
          if (!productExists) {
            console.warn(`Historique de stock ignoré pour le produit introuvable: ${entry.productId}`);
            continue;
          }

          await prisma.stockHistoryEntry.create({
            data: {
              id: entry.id,
              tenantId: tenantId,
              productId: entry.productId,
              productName: entry.productName,
              quantityAdded: entry.quantityAdded,
              userLabel: entry.userLabel,
              createdAt: entry.createdAt
            }
          });
        }
      }
    }

    // 5. Enregistrer les ventes locales envoyées par le téléphone (Offline sync)
    if (localSales && Array.isArray(localSales)) {
      for (const sale of localSales) {
        const saleExists = await prisma.sale.findUnique({ where: { id: sale.id } });
        if (!saleExists) {
          // Créer la vente principale
          await prisma.sale.create({
            data: {
              id: sale.id,
              tenantId: tenantId,
              sellerId: sale.sellerId,
              sellerName: sale.sellerName,
              total: sale.total,
              paymentMethod: sale.paymentMethod,
              createdAt: sale.createdAt,
              rawDate: new Date(sale.rawDate)
            }
          });

          // Créer les items de la vente et déduire atomiquement le stock sur Supabase
          for (const item of sale.items) {
            await prisma.saleItem.create({
              data: {
                saleId: sale.id,
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price
              }
            });

            // Déduction atomique du stock sur Supabase
            try {
              await prisma.product.update({
                where: { id: item.product.id },
                data: {
                  stock: {
                    decrement: Math.round(item.quantity)
                  }
                }
              });
            } catch (err) {
              console.warn(`Impossible de déduire le stock pour le produit ${item.product.id}:`, err);
            }
          }
        }
      }
    }

    // 6. Récupérer toutes les données à jour pour cet établissement
    const dbTenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    const categories = await prisma.category.findMany({
      where: { tenantId }
    });

    const products = await prisma.product.findMany({
      where: { tenantId }
    });

    const tables = await prisma.table.findMany({
      where: { tenantId }
    });

    const users = await prisma.user.findMany({
      where: { tenantId }
    });

    const stockHistory = await prisma.stockHistoryEntry.findMany({
      where: { tenantId }
    });

    const salesFromDb = await prisma.sale.findMany({
      where: { tenantId },
      include: { items: true }
    });

    // Maper les ventes au format du client React (incluant le tableau de OrderItem standard)
    const formattedSales = salesFromDb.map((s) => ({
      id: s.id,
      sellerId: s.sellerId,
      sellerName: s.sellerName,
      total: s.total,
      paymentMethod: s.paymentMethod as any,
      createdAt: s.createdAt,
      tenantId: s.tenantId,
      synced: true,
      rawDate: s.rawDate.toISOString(),
      items: s.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
          categoryId: '',
          stock: 0
        }
      }))
    }));

    // Si on est le Super-Admin, on veut également charger tous les tenants
    let allTenants: any[] = [];
    if (tenantId === 'tnt_super_admin') {
      allTenants = await prisma.tenant.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        }
      });
    }

    return res.status(200).json({
      tenant: dbTenant,
      categories,
      products,
      tables,
      users,
      stockHistory,
      sales: formattedSales,
      allTenants
    });

  } catch (error: any) {
    console.error('Erreur API de Synchronisation:', error);
    const hasDbUrl = !!process.env.DATABASE_URL;
    return res.status(500).json({ 
      error: 'Échec de la synchronisation (Base de données).', 
      details: error.message,
      configError: !hasDbUrl ? "La variable DATABASE_URL est manquante sur Vercel. Veuillez la configurer dans l'administration Vercel." : "La base de données Supabase refuse la connexion. Vérifiez le mot de passe."
    });
  }
}
