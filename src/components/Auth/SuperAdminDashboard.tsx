import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { 
  Building, 
  Users, 
  ShieldAlert, 
  LogOut, 
  TrendingUp, 
  UserCheck,
  UserMinus,
  Trash2,
  Globe
} from 'lucide-react';
import type { SubscriptionPlan, Tenant } from '../../types';

export const SuperAdminDashboard: React.FC = () => {
  const { tenants, users, sales, deleteTenant, updateTenantSubscription, showNotification, logoutTenant, setHasEnteredApp } = usePOSStore();
  
  const [filterPlan, setFilterPlan] = useState<'ALL' | SubscriptionPlan>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [search, setSearch] = useState('');

  // 1. Calculs statistiques SaaS globaux
  const activeTenantsCount = tenants.filter(t => t.status === 'ACTIVE').length;
  const suspendedTenantsCount = tenants.filter(t => t.status === 'SUSPENDED').length;
  const totalSalesCumulated = sales.reduce((sum, s) => sum + s.total, 0);

  const planStats = {
    STANDARD: tenants.filter(t => t.plan === 'STANDARD').length,
    PREMIUM: tenants.filter(t => t.plan === 'PREMIUM').length,
    ULTRA: tenants.filter(t => t.plan === 'ULTRA').length,
  };

  // Filtrage des tenants
  const filteredTenants = tenants.filter(tenant => {
    // Exclure le tenant virtuel super_admin de la gestion
    if (tenant.id === 'tnt_super_admin') return false;

    const matchesPlan = filterPlan === 'ALL' || tenant.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || tenant.status === filterStatus;
    const matchesSearch = tenant.establishmentName.toLowerCase().includes(search.toLowerCase()) || 
                          tenant.email.toLowerCase().includes(search.toLowerCase());

    return matchesPlan && matchesStatus && matchesSearch;
  });

  const handlePlanChange = async (tenantId: string, newPlan: SubscriptionPlan, currentStatus: 'ACTIVE' | 'SUSPENDED', currentEndDate?: string) => {
    await updateTenantSubscription(tenantId, newPlan, currentStatus, currentEndDate);
    showNotification('alert', 'Plan d\'abonnement mis à jour avec succès.');
  };

  const addDaysToSubscription = async (tenant: Tenant, days: number) => {
    const currentEnd = tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate) : new Date();
    currentEnd.setDate(currentEnd.getDate() + days);
    await updateTenantSubscription(tenant.id, tenant.plan, tenant.status, currentEnd.toISOString());
    showNotification('alert', `Validité prolongée de ${days} jours pour ${tenant.establishmentName}.`);
  };

  const handleToggleStatus = async (tenantId: string, currentPlan: SubscriptionPlan, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateTenantSubscription(tenantId, currentPlan, newStatus);
    showNotification('alert', `Statut de l'établissement mis à jour : ${newStatus === 'ACTIVE' ? 'Activé' : 'Suspendu'}.`);
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    showNotification(
      'confirm',
      `ATTENTION : Voulez-vous vraiment supprimer définitivement l'établissement "${tenant.establishmentName}" ? Cette action effacera absolument toutes ses données (produits, tables, employés, ventes).`,
      async () => {
        await deleteTenant(tenant.id);
        showNotification('alert', `L'établissement "${tenant.establishmentName}" a été définitivement supprimé.`);
      }
    );
  };

  const handleLogout = () => {
    logoutTenant();
    setHasEnteredApp(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="h-20 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Globe size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">Gecko SaaS Cloud</h1>
            <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Panneau Super-Administrateur</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-white">Lionel VITHIANO</span>
            <span className="text-[10px] text-gray-400">admin@gecko.com</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-500/20 active:scale-95"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full overflow-y-auto pb-16">
        
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <Building size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Établissements Actifs</p>
              <h3 className="text-2xl font-black mt-1 text-white">{activeTenantsCount}</h3>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Espaces Suspendus</p>
              <h3 className="text-2xl font-black mt-1 text-white">{suspendedTenantsCount}</h3>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Ventes Totales Cloud</p>
              <h3 className="text-2xl font-black mt-1 text-white">
                {totalSalesCumulated.toLocaleString('fr-FR')} F
              </h3>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex flex-col justify-center gap-2 shadow-lg">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Répartition des Plans</p>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-gray-300">STD: <span className="text-white font-bold">{planStats.STANDARD}</span></span>
              <span className="text-primary">PREM: <span className="text-white font-bold">{planStats.PREMIUM}</span></span>
              <span className="text-purple-400">ULTRA: <span className="text-white font-bold">{planStats.ULTRA}</span></span>
            </div>
          </div>
        </div>

        {/* Filters and Management table */}
        <div className="bg-dark-800 border border-dark-700 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-bold flex items-center gap-2 shrink-0">
              <Users size={20} className="text-primary" />
              Gestion des Locataires d'Espaces ({filteredTenants.length})
            </h3>
            
            {/* Search input */}
            <input 
              type="text" 
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-xs font-medium text-white"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-dark-900/50 p-4 rounded-2xl border border-dark-700/50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Filtrer par Plan :</span>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as any)}
                className="bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 font-semibold text-white focus:outline-none"
              >
                <option value="ALL">Tous les plans</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ULTRA">Ultra</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Filtrer par Statut :</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 font-semibold text-white focus:outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="SUSPENDED">Suspendu</option>
              </select>
            </div>
          </div>

          {/* Tenants Listing Table */}
          <div className="overflow-x-auto">
            {filteredTenants.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium text-sm">
                Aucun espace ne correspond à ces critères.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-dark-700 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-4">Établissement</th>
                    <th className="py-4 px-4">Contact</th>
                    <th className="py-4 px-4 text-center">Plan Actuel</th>
                    <th className="py-4 px-4 text-center">Validité</th>
                    <th className="py-4 px-4 text-center">Statut</th>
                    <th className="py-4 px-4 text-center">Utilisateurs</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map(tenant => {
                    const tenantUsersCount = users.filter(u => u.tenantId === tenant.id).length;
                    
                    return (
                      <tr key={tenant.id} className="border-b border-dark-700/50 hover:bg-dark-700/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-white text-sm">
                          {tenant.establishmentName}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {tenant.email}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            value={tenant.plan}
                            onChange={(e) => handlePlanChange(tenant.id, e.target.value as SubscriptionPlan, tenant.status, tenant.subscriptionEndDate)}
                            className={`px-2.5 py-1 rounded-lg border font-bold text-center focus:outline-none ${
                              tenant.plan === 'STANDARD' 
                                ? 'bg-gray-800 text-gray-300 border-gray-700' 
                                : tenant.plan === 'PREMIUM'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}
                          >
                            <option value="STANDARD">Standard</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="ULTRA">Ultra</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <input 
                              type="date"
                              value={tenant.subscriptionEndDate ? tenant.subscriptionEndDate.split('T')[0] : ''}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                if (newDate) {
                                  const dateObj = new Date(newDate);
                                  handlePlanChange(tenant.id, tenant.plan, tenant.status, dateObj.toISOString());
                                } else {
                                  // Pour mettre "illimité" / enlever la date (si l'API l'accepte)
                                  handlePlanChange(tenant.id, tenant.plan, tenant.status, undefined);
                                }
                              }}
                              className="bg-dark-800 text-xs px-2 py-1 border border-dark-600 rounded text-gray-300 focus:outline-none focus:border-primary w-28 text-center"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tenant.status === 'ACTIVE' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {tenant.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-300 font-semibold">
                          {tenantUsersCount}
                        </td>
                        <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(tenant.id, tenant.plan, tenant.status)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              tenant.status === 'ACTIVE'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            }`}
                            title={tenant.status === 'ACTIVE' ? 'Suspendre l\'espace' : 'Activer l\'espace'}
                          >
                            {tenant.status === 'ACTIVE' ? <UserMinus size={14} /> : <UserCheck size={14} />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTenant(tenant)}
                            className="p-2 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl hover:bg-red-600/20 transition-all cursor-pointer"
                            title="Supprimer définitivement l'établissement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};
