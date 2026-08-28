import React, { useState } from 'react';
import { X, PackagePlus, Plus, Search, Edit2, Check, Clock, ListFilter, Printer } from 'lucide-react';
import { usePOSStore } from '../../store';
import type { Product } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StockManagerProps {
  onClose: () => void;
}

export const StockManager: React.FC<StockManagerProps> = ({ onClose }) => {
  const { 
    getProductsByTenant, 
    getStockHistoryByTenant, 
    updateStock,
    updateStockHistoryEntry
  } = usePOSStore();

  const products = getProductsByTenant();
  const stockHistory = getStockHistoryByTenant();

  // États pour les modales et la recherche
  const [activeTab, setActiveTab] = useState<'ENTRIES' | 'ALL_MOVEMENTS'>('ENTRIES');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM' | 'ALL'>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // États pour la création d'une nouvelle entrée
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('');

  // États pour la modification d'une entrée existante
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editSearchProductQuery, setEditSearchProductQuery] = useState('');
  const [editSelectedProduct, setEditSelectedProduct] = useState<Product | null>(null);
  const [editQuantityInput, setEditQuantityInput] = useState('');

  // Filtrage des produits pour la recherche dans les modales
  const filteredProductsForAdd = products.filter(p => 
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  const filteredProductsForEdit = products.filter(p => 
    p.name.toLowerCase().includes(editSearchProductQuery.toLowerCase())
  );

  // Parser la date d'un mouvement
  const parseEntryDate = (entry: any) => {
    if (entry.rawDate) return new Date(entry.rawDate);
    // Fallback pour les anciennes entrées : "Le 08/08/2026 à 14:30:00"
    const parts = entry.createdAt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      return new Date(`${parts[3]}-${parts[2]}-${parts[1]}T00:00:00`);
    }
    return new Date();
  };

  // Filtrer par période et s'assurer que quantityAdded > 0 (pour l'onglet des entrées)
  const filteredHistory = stockHistory.filter(entry => {
    if (entry.quantityAdded <= 0) return false;
    if (period === 'ALL') return true;
    
    const entryDate = parseEntryDate(entry);
    const now = new Date();
    
    if (period === 'TODAY') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return entryDate >= startOfToday;
    }
    
    if (period === 'WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    }
    
    if (period === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return entryDate >= startOfMonth;
    }

    if (period === 'CUSTOM') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      return true;
    }
    
    return true;
  });

  // Filtrer par période (inclut les entrées ET les ventes) pour l'onglet de tous les mouvements
  const filteredAllMovements = stockHistory.filter(entry => {
    if (period === 'ALL') return true;
    
    const entryDate = parseEntryDate(entry);
    const now = new Date();
    
    if (period === 'TODAY') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return entryDate >= startOfToday;
    }
    
    if (period === 'WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    }
    
    if (period === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return entryDate >= startOfMonth;
    }

    if (period === 'CUSTOM') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      return true;
    }
    
    return true;
  });

  // Soumission d'une nouvelle entrée
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty === 0) return;

    updateStock(selectedProduct.id, qty);
    
    // Réinitialisation
    setSelectedProduct(null);
    setQuantityInput('');
    setSearchProductQuery('');
    setShowAddModal(false);
  };

  // Ouverture de la modale de modification avec les valeurs actuelles
  const openEditModal = (entry: any) => {
    const product = products.find(p => p.id === entry.productId) || null;
    setEditingEntryId(entry.id);
    setEditSelectedProduct(product);
    setEditQuantityInput(entry.quantityAdded.toString());
    setEditSearchProductQuery(product ? product.name : '');
    setShowEditModal(true);
  };

  // Soumission de la modification
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntryId || !editSelectedProduct) return;
    const qty = parseInt(editQuantityInput, 10);
    if (isNaN(qty) || qty === 0) return;

    updateStockHistoryEntry(editingEntryId, editSelectedProduct.id, qty);

    // Réinitialisation
    setEditingEntryId(null);
    setEditSelectedProduct(null);
    setEditQuantityInput('');
    setEditSearchProductQuery('');
    setShowEditModal(false);
  };

  // ─── Impression : Inventaire de Stock ───────────────────────────────────────
  const printInventory = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Formateur de prix compatible jsPDF (toLocaleString génère \u00A0 qui s'affiche en barre)
    const fmtPrice = (n: number) =>
      Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' F';

    // En-tête
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVENTAIRE DE STOCK', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Imprime le ${dateStr} a ${timeStr}`, 14, 22);
    doc.text(`${products.length} article(s) au total`, 196, 22, { align: 'right' });

    // Résumé rapide
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const ruptures = products.filter(p => p.stock <= 0).length;
    const alertes = products.filter(p => p.stock > 0 && p.stock <= 5).length;

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 35, 55, 18, 2, 2, 'F');
    doc.roundedRect(75, 35, 55, 18, 2, 2, 'F');
    doc.roundedRect(136, 35, 60, 18, 2, 2, 'F');
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.text('TOTAL UNITES EN STOCK', 41, 41, { align: 'center' });
    doc.text('RUPTURES DE STOCK', 102, 41, { align: 'center' });
    doc.text('ALERTES (<=5 unites)', 166, 41, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalStock), 41, 50, { align: 'center' });
    doc.setTextColor(239, 68, 68);
    doc.text(String(ruptures), 102, 50, { align: 'center' });
    doc.setTextColor(251, 191, 36);
    doc.text(String(alertes), 166, 50, { align: 'center' });

    // Tableau principal
    const rows = products
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p, i) => {
        const statusTxt = p.stock <= 0 ? 'RUPTURE' : p.stock <= 5 ? 'ALERTE' : 'OK';
        return [
          i + 1,
          p.name,
          // Correction : pas de caractère spécial ⚠ (non supporté par Helvetica → rendu en &)
          p.stock <= 0 ? '0' : String(p.stock),
          // Correction : fmtPrice utilise . comme séparateur (toLocaleString génère \u00A0 → rendu en |)
          fmtPrice(p.price),
          p.purchasePrice ? fmtPrice(p.purchasePrice) : '-',
          statusTxt
        ];
      });

    autoTable(doc, {
      startY: 60,
      head: [['#', 'Article', 'Stock', 'Prix Vente', 'Prix Achat', 'Statut']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'center', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          if (data.cell.text[0] === 'RUPTURE') data.cell.styles.textColor = [239, 68, 68];
          else if (data.cell.text[0] === 'ALERTE') data.cell.styles.textColor = [217, 119, 6];
          else data.cell.styles.textColor = [22, 163, 74];
        }
        if (data.column.index === 2 && data.section === 'body') {
          if (data.cell.text[0] === '0') data.cell.styles.textColor = [239, 68, 68];
        }
      },
      // Correction : colSpan sur la 1ere cellule du footer pour éviter le découpage du texte
      foot: [[
        { content: `Total : ${products.length} articles`, colSpan: 2, styles: { halign: 'left' as const } },
        { content: `${totalStock} unites`, colSpan: 2, styles: { halign: 'center' as const } },
        { content: '', colSpan: 2 }
      ]],
      footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
    });

    doc.save(`inventaire-stock-${dateStr.replace(/\//g, '-')}.pdf`);
  };

  // ─── Impression : Détail des Mouvements ──────────────────────────────────────
  const printMovements = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const isEntries = activeTab === 'ENTRIES';
    const data = isEntries ? filteredHistory : filteredAllMovements;
    const sortedData = [...data].sort((a, b) =>
      new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime()
    );

    const periodeLabel: Record<string, string> = {
      TODAY: "Aujourd'hui", WEEK: 'Cette semaine', MONTH: 'Ce mois',
      ALL: 'Toutes les périodes', CUSTOM: `${startDate || '...'} → ${endDate || '...'}`
    };

    // En-tête
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(isEntries ? 'ENTRÉES DE STOCK' : 'DÉTAIL DES MOUVEMENTS DE STOCK', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période : ${periodeLabel[period]}  •  Imprimé le ${dateStr} à ${timeStr}`, 14, 22);
    doc.text(`${sortedData.length} mouvement(s)`, 196, 22, { align: 'right' });

    // Statistiques rapides
    const totalEntrees = sortedData.filter(e => e.quantityAdded > 0).reduce((s, e) => s + e.quantityAdded, 0);
    const totalSorties = Math.abs(sortedData.filter(e => e.quantityAdded < 0).reduce((s, e) => s + e.quantityAdded, 0));

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(14, 35, 86, 18, 2, 2, 'F');
    doc.roundedRect(110, 35, 86, 18, 2, 2, 'F');
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.text('TOTAL ENTRÉES (+)', 57, 41, { align: 'center' });
    doc.text('TOTAL SORTIES (-)', 153, 41, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(`+${totalEntrees}`, 57, 50, { align: 'center' });
    doc.setTextColor(239, 68, 68);
    doc.text(`-${totalSorties}`, 153, 50, { align: 'center' });

    // Tableau
    const rows = sortedData.map((entry, i) => [
      i + 1,
      entry.productName,
      entry.quantityAdded > 0 ? `+${entry.quantityAdded}` : String(entry.quantityAdded),
      entry.userLabel,
      entry.createdAt
    ]);

    autoTable(doc, {
      startY: 60,
      head: [['#', 'Article', 'Qté', 'Opérateur', 'Date / Heure']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
        3: { cellWidth: 40 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const txt = data.cell.text[0] || '';
          if (txt.startsWith('+')) data.cell.styles.textColor = [22, 163, 74];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      },
      margin: { left: 14, right: 14 },
    });

    const filename = isEntries
      ? `entrees-stock-${dateStr.replace(/\//g, '-')}.pdf`
      : `mouvements-stock-${dateStr.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-3xl w-full max-w-3xl flex flex-col h-[85vh] shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <PackagePlus size={28} className="text-primary" />
            <h2 className="text-2xl font-bold">Gestion des Stocks & Inventaire</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="flex bg-dark-900 px-6 py-2 border-b border-dark-700 shrink-0 gap-4">
          <button
            onClick={() => setActiveTab('ENTRIES')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ENTRIES' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Entrées de Stock
          </button>
          <button
            onClick={() => setActiveTab('ALL_MOVEMENTS')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL_MOVEMENTS' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock size={16} />
            Détail des Mouvements (Ventes & Entrées)
          </button>
        </div>

        {/* Barre d'action principale */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-dark-900 border-b border-dark-700 gap-3 shrink-0">
          {/* Filtres de période */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white font-medium text-sm"
            >
              <option value="ALL">Toutes les périodes</option>
              <option value="TODAY">Aujourd'hui</option>
              <option value="WEEK">Cette Semaine</option>
              <option value="MONTH">Ce Mois</option>
              <option value="CUSTOM">Période personnalisée</option>
            </select>

            {period === 'CUSTOM' && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  title="Date de début"
                />
                <span className="text-gray-500 text-xs">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  title="Date de fin"
                />
              </div>
            )}
          </div>

          {/* Boutons d'action à droite */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Bouton Imprimer Inventaire — visible sur les deux onglets */}
            <button
              onClick={printInventory}
              title="Imprimer l'inventaire de stock complet"
              className="flex items-center gap-2 px-3 py-2.5 bg-dark-800 border border-dark-700 text-gray-300 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0"
            >
              <Printer size={16} className="text-emerald-400" />
              <span className="hidden sm:inline">Inventaire</span>
            </button>

            {/* Bouton Imprimer Mouvements — adapté à l'onglet actif */}
            <button
              onClick={printMovements}
              title={activeTab === 'ENTRIES' ? "Imprimer les entrées de stock filtrées" : "Imprimer le détail des mouvements filtrés"}
              className="flex items-center gap-2 px-3 py-2.5 bg-dark-800 border border-dark-700 text-gray-300 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 rounded-xl text-sm font-semibold transition-all cursor-pointer shrink-0"
            >
              <Printer size={16} className="text-blue-400" />
              <span className="hidden sm:inline">{activeTab === 'ENTRIES' ? 'Entrées' : 'Mouvements'}</span>
            </button>

            {/* Bouton Nouvelle Entrée */}
            {activeTab === 'ENTRIES' && (
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setQuantityInput('');
                  setSearchProductQuery('');
                  setShowAddModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-95 animate-pulse shrink-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nouvelle Entrée</span>
                <span className="sm:hidden">+ Entrée</span>
              </button>
            )}
          </div>
        </div>

        {/* Liste des entrées */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {activeTab === 'ENTRIES' ? (
            /* TAB 1: Entrées modifiables */
            filteredHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-16 flex flex-col items-center justify-center gap-3">
                <PackagePlus size={48} className="text-gray-600" />
                <p className="font-semibold text-lg">Aucune entrée de stock pour cette période.</p>
                <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                  Ajustez le filtre périodique ou appuyez sur "Nouvelle Entrée" pour ajouter du stock.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredHistory
                  .sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())
                  .map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-4 bg-dark-900 border border-dark-700 rounded-2xl flex items-center justify-between gap-4 text-sm shadow-md hover:border-dark-600 transition-colors"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-base">{entry.productName}</span>
                          <span className="text-[10px] bg-dark-800 text-gray-400 px-2 py-0.5 rounded font-semibold border border-dark-700">
                            {entry.userLabel}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">{entry.createdAt}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-lg font-black text-green-400">
                          +{entry.quantityAdded}
                        </span>
                        
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-2 bg-dark-800 text-gray-400 hover:text-white rounded-xl border border-dark-700 hover:border-gray-500 transition-all cursor-pointer"
                          title="Modifier cette entrée"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )
          ) : (
            /* TAB 2: Historique complet brute (Entrées + Ventes) */
            filteredAllMovements.length === 0 ? (
              <div className="text-center text-gray-500 py-16 flex flex-col items-center justify-center gap-3">
                <ListFilter size={48} className="text-gray-600" />
                <p className="font-semibold text-lg">Aucun mouvement de stock pour cette période.</p>
                <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                  Toutes les entrées de stocks et ventes en caisse s'afficheront ici.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredAllMovements
                  .sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())
                  .map(entry => (
                    <div 
                      key={entry.id} 
                      className="p-4 bg-dark-900 border border-dark-700 rounded-2xl flex items-center justify-between gap-4 text-sm shadow-md hover:border-dark-600 transition-colors"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-base">{entry.productName}</span>
                          <span className="text-[10px] bg-dark-800 text-gray-400 px-2 py-0.5 rounded font-semibold border border-dark-700">
                            {entry.userLabel}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">{entry.createdAt}</p>
                      </div>
                      
                      <span className={`text-lg font-black shrink-0 ${
                        entry.quantityAdded >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.quantityAdded >= 0 ? `+${entry.quantityAdded}` : entry.quantityAdded}
                      </span>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>

        {/* MODALE : Nouvelle Entrée */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/90 flex justify-center items-center z-50 p-4 rounded-3xl">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 flex flex-col max-h-[90%] shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus size={20} className="text-primary" />
                  Nouvelle Entrée de Stock
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 bg-dark-900 rounded-full text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {/* Recherche d'article */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rechercher un Article
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nom de l'article..."
                      value={searchProductQuery}
                      onChange={(e) => {
                        setSearchProductQuery(e.target.value);
                        setSelectedProduct(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                    />
                    <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  </div>
                </div>

                {/* Liste des résultats de recherche */}
                {!selectedProduct && searchProductQuery.trim() !== '' && (
                  <div className="bg-dark-950 border border-dark-700 rounded-xl max-h-40 overflow-y-auto flex flex-col divide-y divide-dark-800">
                    {filteredProductsForAdd.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchProductQuery(product.name);
                        }}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-xs text-gray-500">Stock act: {product.stock}</span>
                      </button>
                    ))}
                    {filteredProductsForAdd.length === 0 && (
                      <div className="p-3 text-center text-xs text-gray-500">Aucun article trouvé</div>
                    )}
                  </div>
                )}

                {/* Article sélectionné */}
                {selectedProduct && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary font-bold">Article sélectionné :</p>
                      <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchProductQuery('');
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                )}

                {/* Saisie de la Quantité */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Quantité à Ajouter
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10, 24, 50..."
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white font-semibold"
                  />
                </div>

                {/* Validation */}
                <button
                  type="submit"
                  disabled={!selectedProduct || !quantityInput}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Check size={16} />
                  Valider l'Entrée
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODALE : Modifier Entrée */}
        {showEditModal && (
          <div className="absolute inset-0 bg-black/90 flex justify-center items-center z-50 p-4 rounded-3xl">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 flex flex-col max-h-[90%] shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 size={20} className="text-primary" />
                  Modifier l'Entrée de Stock
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1 bg-dark-900 rounded-full text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {/* Recherche d'article */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rechercher un Article
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nom de l'article..."
                      value={editSearchProductQuery}
                      onChange={(e) => {
                        setEditSearchProductQuery(e.target.value);
                        setEditSelectedProduct(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                    />
                    <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  </div>
                </div>

                {/* Liste des résultats de recherche pour Edit */}
                {!editSelectedProduct && editSearchProductQuery.trim() !== '' && (
                  <div className="bg-dark-950 border border-dark-700 rounded-xl max-h-40 overflow-y-auto flex flex-col divide-y divide-dark-800">
                    {filteredProductsForEdit.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setEditSelectedProduct(product);
                          setEditSearchProductQuery(product.name);
                        }}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-xs text-gray-500">Stock act: {product.stock}</span>
                      </button>
                    ))}
                    {filteredProductsForEdit.length === 0 && (
                      <div className="p-3 text-center text-xs text-gray-500">Aucun article trouvé</div>
                    )}
                  </div>
                )}

                {/* Article sélectionné pour Edit */}
                {editSelectedProduct && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary font-bold">Article sélectionné :</p>
                      <p className="text-sm font-semibold text-white">{editSelectedProduct.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditSelectedProduct(null);
                        setEditSearchProductQuery('');
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                )}

                {/* Saisie de la Quantité */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Nouvelle Quantité
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10, 24, 50..."
                    value={editQuantityInput}
                    onChange={(e) => setEditQuantityInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white font-semibold"
                  />
                </div>

                {/* Validation */}
                <button
                  type="submit"
                  disabled={!editSelectedProduct || !editQuantityInput}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Check size={16} />
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
