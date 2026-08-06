// api/tenants.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurer les headers CORS pour autoriser les requêtes cross-origin si nécessaire
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

  const { action, email, establishmentName, adminPin, tenantId, plan, status } = req.body;

  try {
    // 1. Connexion / Vérification d'un espace existant
    if (action === 'login') {
      if (!email || !adminPin) return res.status(400).json({ error: 'Email et code PIN requis.' });
      const emailLower = email.toLowerCase().trim();

      const tenant = await prisma.tenant.findUnique({
        where: { email: emailLower }
      });

      if (!tenant) {
        return res.status(404).json({ error: "Aucun établissement n'est associé à cette adresse email." });
      }

      if (tenant.adminPin !== adminPin) {
        return res.status(401).json({ error: "Le code PIN est incorrect." });
      }

      return res.status(200).json(tenant);
    }

    // 2. Inscription d'un nouvel espace
    if (action === 'register') {
      if (!email || !establishmentName || !adminPin) {
        return res.status(400).json({ error: 'Informations incomplètes.' });
      }
      const emailLower = email.toLowerCase().trim();

      // Vérifier si l'email existe déjà
      const exists = await prisma.tenant.findUnique({
        where: { email: emailLower }
      });

      if (exists) {
        return res.status(409).json({ error: 'Cet email est déjà associé à un autre établissement.' });
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      // Créer l'établissement
      const tenant = await prisma.tenant.create({
        data: {
          email: emailLower,
          establishmentName,
          adminPin,
          plan: 'STANDARD',
          status: 'ACTIVE',
          subscriptionEndDate: trialEndDate
        }
      });

      // Créer l'utilisateur Administrateur par défaut associé
      const admin = await prisma.user.create({
        data: {
          name: establishmentName + ' Admin',
          pinCode: adminPin,
          role: 'ADMIN',
          tenantId: tenant.id
        }
      });

      return res.status(201).json({ tenant, admin });
    }

    // Sécurisation Super-Admin pour Update / Delete
    const isSuperAdmin = req.headers['x-super-admin-pin'] === '9999';

    // 3. Mise à jour de l'abonnement par le Super-Admin
    if (action === 'update') {
      if (!isSuperAdmin) return res.status(401).json({ error: 'Non autorisé.' });
      if (!tenantId || !plan || !status) {
        return res.status(400).json({ error: 'Données manquantes pour la mise à jour.' });
      }

      const { subscriptionEndDate } = req.body;

      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          plan,
          status,
          ...(subscriptionEndDate !== undefined && { subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : null })
        }
      });

      return res.status(200).json(updatedTenant);
    }

    // 4. Suppression définitive (Super-Admin)
    if (action === 'delete') {
      if (!isSuperAdmin) return res.status(401).json({ error: 'Non autorisé.' });
      if (!tenantId) return res.status(400).json({ error: 'ID de l\'établissement manquant.' });

      // Suppression en cascade (Prisma)
      await prisma.tenant.delete({
        where: { id: tenantId }
      });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Action non reconnue.' });
  } catch (error: any) {
    console.error('Erreur API Tenants:', error);
    const hasDbUrl = !!process.env.DATABASE_URL;
    return res.status(500).json({ 
      error: 'Erreur interne du serveur (Base de données).', 
      details: error.stack || error.message,
      configError: !hasDbUrl ? "La variable DATABASE_URL est manquante sur Vercel. Veuillez la configurer dans l'administration Vercel." : "La base de données Supabase refuse la connexion. Vérifiez le mot de passe."
    });
  }
}
