import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Clock,
  Printer
} from 'lucide-react';
import { usePOSStore } from '../../store';

export const ReportsPage: React.FC = () => {
  const { getProductsByTenant, getUsersByTenant, getSalesByTenant } = usePOSStore();

  const products = getProductsByTenant();
  const users = getUsersByTenant();
  const sales = getSalesByTenant();

  // Utilitaire pour formater les prix avec un point comme séparateur de milliers
  const formatPrice = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Filter States
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sellerId, setSellerId] = useState<string>('ALL');

  // Helper to check if a date is within the selected period
  const isDateInPeriod = (rawDateStr: string) => {
    if (!rawDateStr) return false;
    const saleDate = new Date(rawDateStr);
    const now = new Date();

    // Définir les dates de début et de fin de journée en heure locale
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    switch (period) {
      case 'TODAY':
        return saleDate >= startOfToday && saleDate <= endOfToday;
      case 'WEEK':
        const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= sevenDaysAgo;
      case 'MONTH':
        const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= thirtyDaysAgo;
      case 'CUSTOM':
        if (!startDate) return true;
        const startLimit = new Date(startDate);
        startLimit.setHours(0, 0, 0, 0);
        
        let endLimit = new Date();
        if (endDate) {
          endLimit = new Date(endDate);
          endLimit.setHours(23, 59, 59, 999);
        } else {
          endLimit.setHours(23, 59, 59, 999);
        }
        return saleDate >= startLimit && saleDate <= endLimit;
      default:
        return true;
    }
  };

  // Filter Sales based on temporal period & seller
  const filteredSales = sales.filter(sale => {
    const matchesPeriod = isDateInPeriod(sale.rawDate);
    const matchesSeller = sellerId === 'ALL' || sale.sellerId === sellerId;
    return matchesPeriod && matchesSeller;
  });

  // Calculate Metrics based on filtered data
  const totalCA = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = filteredSales.length;
  const averageBasket = salesCount > 0 ? Math.round(totalCA / salesCount) : 0;

  // Calculate Top Selling Items
  const itemSalesMap: Record<string, { qty: number; salesVal: number }> = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!itemSalesMap[item.product.name]) {
        itemSalesMap[item.product.name] = { qty: 0, salesVal: 0 };
      }
      itemSalesMap[item.product.name].qty += item.quantity;
      itemSalesMap[item.product.name].salesVal += item.product.price * item.quantity;
    });
  });

  const sortedTopSelling = Object.entries(itemSalesMap)
    .map(([name, data]) => ({
      name,
      qty: data.qty,
      salesVal: data.salesVal,
      sales: `${formatPrice(data.salesVal)} F CFA`
    }))
    .sort((a, b) => b.qty - a.qty);

  // Calculate Payment Methods distribution
  const paymentMethods = {
    CASH: { amount: 0, count: 0 },
    CARD: { amount: 0, count: 0 },
    MOBILE: { amount: 0, count: 0 }
  };

  filteredSales.forEach(sale => {
    if (paymentMethods[sale.paymentMethod]) {
      paymentMethods[sale.paymentMethod].amount += sale.total;
      paymentMethods[sale.paymentMethod].count += 1;
    }
  });

  const getPercentage = (amount: number) => {
    if (totalCA === 0) return 0;
    return Math.round((amount / totalCA) * 100);
  };

  // Stats cards configuration
  const stats = [
    { name: 'Chiffre d\'Affaires', value: `${formatPrice(totalCA)} F CFA`, label: 'Total période', icon: <TrendingUp className="text-green-400" size={24} /> },
    { name: 'Total Ventes', value: salesCount.toString(), label: 'Transactions', icon: <ShoppingBag className="text-blue-400" size={24} /> },
    { name: 'Panier Moyen', value: `${formatPrice(averageBasket)} F CFA`, label: 'Par commande', icon: <BarChart3 className="text-amber-400" size={24} /> },
    { name: 'Catalogue Articles', value: products.length.toString(), label: 'Articles actifs', icon: <Users className="text-purple-400" size={24} /> },
  ];

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const tenantName = usePOSStore.getState().currentTenant?.establishmentName || 'Établissement';
    
    // Titre
    doc.setFontSize(20);
    doc.text(`Rapport de Performance - ${tenantName}`, 14, 22);
    
    // Période & Vendeur
    doc.setFontSize(11);
    doc.setTextColor(100);
    const periodText = period === 'CUSTOM' ? `Du ${startDate} au ${endDate}` : `Période: ${period}`;
    let sellerText = 'Tous les vendeurs';
    if (sellerId !== 'ALL') {
      const seller = users.find(u => u.id === sellerId);
      if (seller) sellerText = `Vendeur: ${seller.name}`;
    }
    doc.text(`${periodText} | ${sellerText}`, 14, 30);

    // Résumé
    autoTable(doc, {
      startY: 40,
      head: [['Chiffre d\'Affaires', 'Total Ventes', 'Panier Moyen', 'Méthodes de Paiement']],
      body: [[
        `${formatPrice(totalCA)} F CFA`,
        salesCount.toString(),
        `${formatPrice(averageBasket)} F CFA`,
        `Espèces: ${formatPrice(paymentMethods.CASH.amount)} | Carte: ${formatPrice(paymentMethods.CARD.amount)} | Mobile: ${formatPrice(paymentMethods.MOBILE.amount)}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Top Ventes
    doc.text('Articles les plus vendus', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Article', 'Prix Unitaire', 'Quantité Vendue', 'Quantité Restante (Stock)', 'Chiffre d\'Affaires']],
      body: sortedTopSelling.slice(0, 15).map(item => {
        const product = products.find(p => p.name === item.name);
        return [
          item.name,
          product ? `${formatPrice(product.price)} F CFA` : 'N/A',
          item.qty.toString(),
          product ? product.stock.toString() : 'N/A',
          item.sales
        ];
      }),
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
    });

    // Détail des transactions
    doc.text('Détail des Transactions', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Vendeur', 'Méthode', 'Articles', 'Total']],
      body: filteredSales.map(sale => [
        sale.createdAt,
        sale.sellerName,
        sale.paymentMethod,
        sale.items.map(i => `${i.quantity}x ${i.product.name}`).join(', '),
        `${formatPrice(sale.total)} F CFA`
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [142, 68, 173] },
    });

    doc.save(`Rapport_${tenantName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-900 text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700/50 pb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Rapports de Performance
            </h2>
            <p className="text-gray-400 mt-1">Pilotez votre établissement avec des statistiques détaillées</p>
          </div>
          <button
            onClick={exportToPDF}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Printer size={20} />
            Imprimer PDF
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-5 bg-dark-800 border border-dark-700 rounded-3xl shadow-lg flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            Filtres de recherche
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Period selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Période</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white font-medium"
              >
                <option value="TODAY">Aujourd'hui (Journalier)</option>
                <option value="WEEK">7 derniers jours (Hebdo)</option>
                <option value="MONTH">30 derniers jours (Mensuel)</option>
                <option value="CUSTOM">Période personnalisée</option>
              </select>
            </div>

            {/* Custom Dates */}
            {period === 'CUSTOM' ? (
              <div className="md:col-span-5 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-xs font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden md:block md:col-span-5" />
            )}

            {/* Seller selector */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Filtrer par Vendeur</label>
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white font-medium"
              >
                <option value="ALL">Tous les serveurs / vendeurs</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-dark-800 border border-dark-700 rounded-3xl flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">{stat.name}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <span className="text-[10px] text-gray-400 bg-dark-900 px-2.5 py-0.5 rounded-full mt-2 inline-block font-semibold border border-dark-700">
                  {stat.label}
                </span>
              </div>
              <div className="p-3 bg-dark-900 rounded-2xl border border-dark-700">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top Products */}
          <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl shadow-lg lg:col-span-2 flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="text-primary" size={20} /> Ventes d'Articles
            </h3>
            {sortedTopSelling.length === 0 ? (
              <p className="text-gray-500 text-center py-12 flex-1 flex items-center justify-center font-medium">
                Aucun article vendu sur cette sélection.
              </p>
            ) : (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                {sortedTopSelling.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-dark-900 rounded-2xl border border-dark-800">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <span className="text-xs text-gray-400">{item.qty} verres / bouteilles vendus</span>
                    </div>
                    <span className="font-bold text-primary text-sm">{item.sales}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl shadow-lg flex flex-col">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Banknote className="text-green-400" size={20} /> Modes de Paiement
            </h3>
            <div className="flex flex-col gap-6 flex-1 justify-center">
              
              {/* Espèces */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5"><Banknote size={14} className="text-green-400" /> Espèces</span>
                  <span>{paymentMethods.CASH.amount.toLocaleString('fr-FR')} F ({getPercentage(paymentMethods.CASH.amount)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-dark-700">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${getPercentage(paymentMethods.CASH.amount)}%` }}
                  />
                </div>
              </div>

              {/* Carte */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-blue-400" /> Carte</span>
                  <span>{paymentMethods.CARD.amount.toLocaleString('fr-FR')} F ({getPercentage(paymentMethods.CARD.amount)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-dark-700">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${getPercentage(paymentMethods.CARD.amount)}%` }}
                  />
                </div>
              </div>

              {/* Mobile Money */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
                  <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-purple-400" /> Mobile Money</span>
                  <span>{paymentMethods.MOBILE.amount.toLocaleString('fr-FR')} F ({getPercentage(paymentMethods.MOBILE.amount)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden border border-dark-700">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${getPercentage(paymentMethods.MOBILE.amount)}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Audit / Journal de Vente */}
        <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl shadow-lg">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="text-purple-400" size={20} /> Journal des transactions de la sélection ({filteredSales.length})
          </h3>
          
          {filteredSales.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Aucune vente ne correspond aux filtres de recherche.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              {filteredSales
                .sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())
                .map(sale => (
                <div key={sale.id} className="p-4 bg-dark-900 rounded-2xl border border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{sale.createdAt}</span>
                      <span className="text-[10px] bg-dark-700 text-gray-300 px-2 py-0.5 rounded-full">ID: {sale.id.substring(5, 13)}</span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      Vendu par : <span className="font-bold text-gray-300">{sale.sellerName}</span> | Mode : <span className="font-bold text-gray-300">{sale.paymentMethod}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sale.items.map((item, id) => (
                        <span key={id} className="bg-dark-800 text-gray-400 px-2 py-0.5 rounded border border-dark-700 font-medium">
                          {item.quantity}x {item.product.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-base font-black text-white shrink-0 sm:text-right">
                    {sale.total.toLocaleString('fr-FR')} F CFA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
