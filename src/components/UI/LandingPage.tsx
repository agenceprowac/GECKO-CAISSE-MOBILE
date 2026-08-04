import React, { useState } from 'react';
import { 
  Smartphone, 
  Layers, 
  TrendingUp, 
  Shield, 
  Download, 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle, 
  Star, 
  HelpCircle,
  ChevronDown,
  Play,
  Apple
} from 'lucide-react';
import { usePOSStore } from '../../store';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean; platform: 'android' | 'ios' | null }>({
    isOpen: false,
    platform: null
  });
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [showIOSBanner, setShowIOSBanner] = useState(true);

  const { deferredPrompt, setDeferredPrompt } = usePOSStore();

  // Détecter si l'appareil est sous iOS (pour afficher la bulle d'aide Safari)
  const isIOS = typeof window !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleDownload = async (platform: 'android' | 'ios') => {
    if (platform === 'android' && deferredPrompt) {
      // Déclencher directement l'invite d'installation système de Chrome
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('L\'utilisateur a installé l\'application');
      }
      
      // On nettoie le prompt car il ne peut être utilisé qu'une seule fois
      setDeferredPrompt(null);
    } else {
      // Sinon (ou si c'est iOS), afficher la modal d'instructions classiques
      setDownloadModal({ isOpen: true, platform });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-600/30 overflow-y-auto w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-950/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl font-black text-white">G</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Gecko Caisse Mobile
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Tarifs</a>
            <a href="#downloads" className="text-sm text-gray-400 hover:text-white transition-colors">Télécharger</a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Avis</a>
            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
            <button 
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all"
            >
              Lancer la Démo Web
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 z-50 md:hidden px-4 pt-2 pb-6 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800 flex flex-col gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white py-2"
            >
              Fonctionnalités
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white py-2"
            >
              Tarifs
            </a>
            <a 
              href="#downloads" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white py-2"
            >
              Télécharger
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white py-2"
            >
              Avis
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white py-2"
            >
              FAQ
            </a>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onEnterApp();
              }}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-center hover:bg-blue-500 active:scale-95 transition-all"
            >
              Lancer la Démo Web
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Version 2.4 Disponible - Téléchargement immédiat
              </div>
              
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                La caisse enregistreuse tactile dans <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">votre poche</span>
              </h2>
              
              <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Gérez vos commandes, encaissez vos clients, pilotez vos stocks et optimisez vos tables directement depuis votre smartphone ou votre tablette. Conçu spécialement pour les bars et restaurants.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a 
                  href="#downloads" 
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-gray-950 font-bold hover:bg-gray-100 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  <Download size={20} />
                  Télécharger l'App
                </a>
                <button 
                  onClick={onEnterApp}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900 border border-gray-800 text-white font-bold hover:bg-gray-800 hover:border-gray-700 hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  Tester la démo web
                  <ArrowRight size={20} className="text-blue-400" />
                </button>
              </div>

              {/* Badges / Micro feedback */}
              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-8 items-center text-gray-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-500" /> Sans engagement
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-500" /> Mode Hors-ligne complet
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-500" /> Multi-utilisateurs
                </div>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Decorative Circle Behind Phone */}
              <div className="absolute inset-0 m-auto w-72 h-72 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              
              {/* Phone Mockup */}
              <div className="relative w-72 h-[560px] bg-gray-900 rounded-[40px] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col p-2.5">
                {/* Speaker/Camera notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-800 rounded-full" />
                </div>
                
                {/* Screen content */}
                <div className="flex-1 bg-gray-950 rounded-[30px] overflow-hidden flex flex-col border border-gray-800/50 p-4">
                  {/* Top app status */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 mb-4">
                    <span>12:30</span>
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">Serveur Connecté</span>
                  </div>

                  {/* App Screen Mockup Header */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold">Table 4 - Terrasse</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">BarPOS</span>
                  </div>

                  {/* App Screen Mockup Products */}
                  <div className="flex-1 space-y-3">
                    <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold">2x Bière IPA 50cl</p>
                        <p className="text-[10px] text-gray-500">Catégorie: Pression</p>
                      </div>
                      <span className="text-xs font-bold">14,00 €</span>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold">1x Mojito Royal</p>
                        <p className="text-[10px] text-gray-500">Catégorie: Cocktail</p>
                      </div>
                      <span className="text-xs font-bold">9,50 €</span>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold">1x Planche Mixte</p>
                        <p className="text-[10px] text-gray-500">Catégorie: Tapas</p>
                      </div>
                      <span className="text-xs font-bold">16,00 €</span>
                    </div>
                  </div>

                  {/* Total and Pay button */}
                  <div className="border-t border-gray-800 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-gray-400">Total</span>
                      <span className="text-sm font-bold text-white">39,50 €</span>
                    </div>
                    <button className="w-full py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20">
                      Payer (CB, Espèces)
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Une gestion simplifiée au maximum</h3>
            <p className="text-gray-400 text-lg">
              Tout ce dont vous avez besoin pour piloter votre établissement en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <h4 className="text-lg font-bold mb-2">100% Mobile</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Prenez des commandes n'importe où : en terrasse, en salle ou directement au comptoir.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h4 className="text-lg font-bold mb-2">Plan de Table Tactile</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Visualisez vos tables libres, occupées et les commandes en cours d'un seul coup d'œil.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-lg font-bold mb-2">Statistiques & Rapports</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Suivez votre chiffre d'affaires, vos meilleures ventes et analysez vos performances.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h4 className="text-lg font-bold mb-2">Mode Hors-ligne</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Pas de réseau ? Pas de panique. L'application continue de fonctionner et se synchronise dès le retour du réseau.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Installez l'application dès maintenant</h3>
            <p className="text-gray-400 text-lg">
              Choisissez votre plateforme préférée ou téléchargez notre package d'installation universel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Android Card */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
              <div>
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                  <Play size={28} />
                </div>
                <h4 className="text-2xl font-bold mb-3">Installer sur Android</h4>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Profitez de l'application sur tous vos téléphones et tablettes Android. Installation directe, rapide et sécurisée sans passer par un store.
                </p>
                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Compatible avec Google Chrome
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Lancement plein écran et mode hors-ligne
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload('android')}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-600/10"
              >
                <Play size={20} />
                Instructions d'installation Android
              </button>
            </div>

            {/* iOS Card */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between hover:border-blue-500/30 transition-colors">
              <div>
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                  <Apple size={28} />
                </div>
                <h4 className="text-2xl font-bold mb-3">Installer pour iOS (iPhone / iPad)</h4>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Installez Gecko Caisse sur votre iPhone ou iPad. Disponible via le profil d'installation PWA ou TestFlight.
                </p>
                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Optimisé pour iOS 15 et supérieur
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Installation ultra-rapide sans store
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDownload('ios')}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-600/10"
              >
                <Apple size={20} />
                Instructions d'installation iOS
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-900/40 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Ce qu'en disent nos clients</h3>
            <p className="text-gray-400 text-lg">
              Des centaines de gérants de bars et restaurants utilisent Gecko Caisse tous les jours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl relative">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-gray-300 italic mb-6">
                "Une application d'une simplicité déconcertante ! Mes serveurs l'ont prise en main en moins de 10 minutes. Le fait de pouvoir l'utiliser sur leur propre smartphone nous a évité l'achat de matériel coûteux."
              </p>
              <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50/20 flex items-center justify-center font-bold text-blue-400 text-sm">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold">Jean-Daniel R.</p>
                  <p className="text-xs text-gray-500">Gérant du pub Le Shamrock</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl relative">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-gray-300 italic mb-6">
                "Le plan de table est super visuel et interactif. De plus, le mode hors ligne nous a sauvés plus d'une fois lors de pannes internet dans notre bar de montagne. Je recommande vivement !"
              </p>
              <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
                  ML
                </div>
                <div>
                  <p className="text-sm font-bold">Marie-Laure L.</p>
                  <p className="text-xs text-gray-500">Directrice de L'Alpage Restaurant</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-950 border border-gray-800 p-6 rounded-2xl relative">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-gray-300 italic mb-6">
                "Les rapports quotidiens m'aident énormément pour ma comptabilité. J'ai une vision claire de mon chiffre d'affaires et de mon stock. Le support client est également très réactif."
              </p>
              <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm">
                  AB
                </div>
                <div>
                  <p className="text-sm font-bold">Alexandre B.</p>
                  <p className="text-xs text-gray-500">Propriétaire du Gecko Club</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Section Tarifs */}
      <section id="pricing" className="py-20 bg-gray-950 border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
              Des tarifs adaptés à <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">votre activité</span>
            </h3>
            <p className="text-gray-400 text-lg">
              Aucun coût caché. Choisissez la formule qui convient le mieux à la taille de votre bar ou restaurant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Plan Standard */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between hover:border-gray-700 transition-all relative">
              <div>
                <h4 className="text-lg font-bold text-gray-400 mb-2">Standard</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">15 000 F</span>
                  <span className="text-gray-500 text-sm">/ mois</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  Idéal pour les petites structures, salons de thé ou petits stands de vente rapides.
                </p>
                <div className="border-t border-gray-800/60 my-4" />
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Caisse enregistreuse tactile rapide
                  </li>
                  <li className="flex items-center gap-2.5 text-amber-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    Limite : 15 articles maximum
                  </li>
                  <li className="flex items-center gap-2.5 text-amber-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    Limite : 5 tables maximum
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Rapports et statistiques de base
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    1 seul appareil connecté
                  </li>
                </ul>
              </div>
              <button 
                onClick={onEnterApp}
                className="w-full py-4 mt-8 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-2xl transition-colors text-sm cursor-pointer border border-gray-700"
              >
                Créer un Espace Standard
              </button>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-2 border-blue-500/80 p-8 rounded-3xl flex flex-col justify-between hover:border-blue-400 transition-all relative shadow-2xl shadow-blue-500/5">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow">
                Le Plus Populaire
              </span>
              <div>
                <h4 className="text-lg font-bold text-blue-400 mb-2">Premium</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">30 000 F</span>
                  <span className="text-gray-500 text-sm">/ mois</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  Conçu pour les bars et restaurants en croissance cherchant un suivi de stock rigoureux.
                </p>
                <div className="border-t border-gray-800/60 my-4" />
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <strong>Articles & Catalogue illimités</strong>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <strong>Tables et Ardoises illimitées</strong>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Historique détaillé des mouvements de stock
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Rapports périodiques (mensuels, par vendeur)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Mode hors-ligne / Synchro Cloud en arrière-plan
                  </li>
                </ul>
              </div>
              <button 
                onClick={onEnterApp}
                className="w-full py-4 mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors text-sm cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Créer un Espace Premium
              </button>
            </div>

            {/* Plan Ultra */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between hover:border-gray-700 transition-all relative">
              <div>
                <h4 className="text-lg font-bold text-purple-400 mb-2">Ultra</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">50 000 F</span>
                  <span className="text-gray-500 text-sm">/ mois</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  Pour les grands établissements multi-points de vente exigeant du temps réel unifié.
                </p>
                <div className="border-t border-gray-800/60 my-4" />
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Toutes les fonctions Premium incluses
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Synchronisation multi-appareils en temps réel
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Multi-points de vente (comptoirs & cuisines)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Sauvegarde automatique continue sur le Cloud
                  </li>
                  <li className="flex items-center gap-2.5 text-purple-400 font-semibold">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Support technique VIP 24h/7j
                  </li>
                </ul>
              </div>
              <button 
                onClick={onEnterApp}
                className="w-full py-4 mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-colors text-sm cursor-pointer border border-purple-500/20"
              >
                Créer un Espace Ultra
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Questions Fréquentes</h3>
          <p className="text-gray-400 text-lg">
            Des réponses claires à vos questions les plus courantes.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Comment installer l'application sur mon smartphone ?",
              a: "Pour Android, ouvrez notre site dans Google Chrome, appuyez sur le menu (trois points) et choisissez 'Ajouter à l'écran d'accueil'. Pour iOS, ouvrez notre site dans Safari sur votre iPhone et appuyez sur 'Partager' puis 'Sur l'écran d'accueil'. L'application s'installera instantanément sans passer par les stores."
            },
            {
              q: "L'application nécessite-t-elle une connexion internet constante ?",
              a: "Non. Gecko Caisse fonctionne en mode local complet pour les encaissements, la prise de commandes et la gestion de table. Vos données se synchroniseront automatiquement dès qu'une connexion internet sera rétablie."
            },
            {
              q: "Combien d'appareils puis-je connecter à la fois ?",
              a: "Il n'y a pas de limite stricte. Vous pouvez connecter autant de smartphones et de tablettes de serveurs que nécessaire pour couvrir votre salle et votre bar."
            },
            {
              q: "Puis-je tester l'application gratuitement ?",
              a: "Oui ! Vous pouvez cliquer sur le bouton 'Lancer la Démo Web' en haut de cette page pour tester le système complet directement dans votre navigateur web, sans aucune inscription."
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-bold text-sm sm:text-base flex items-center gap-3">
                  <HelpCircle size={18} className="text-blue-500 shrink-0" />
                  {item.q}
                </span>
                <ChevronDown 
                  size={18} 
                  className={`text-gray-400 transition-transform duration-200 ${faqOpen === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-6 pb-5 text-sm text-gray-400 border-t border-gray-800/50 pt-3 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6 mb-6">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p>© 2026 Gecko Caisse Mobile. Tous droits réservés.</p>
        </div>
      </footer>


      {/* Download Modal / Feedback */}
      {downloadModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => {
                setDownloadModal({ isOpen: false, platform: null });
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            {downloadModal.platform === 'android' ? (
              <div className="text-left">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={32} />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Installation sur Android</h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Suivez ces étapes simples pour ajouter l'application sur votre écran d'accueil Android.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <p className="text-xs text-gray-300">
                      Ouvrez le navigateur <strong>Google Chrome</strong> et accédez à notre application web.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <p className="text-xs text-gray-300">
                      Appuyez sur les <strong>trois points verticaux</strong> <span className="bg-gray-800 px-1 py-0.5 rounded text-[10px]">⋮</span> en haut à droite.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <p className="text-xs text-gray-300">
                      Sélectionnez <strong>Ajouter à l'écran d'accueil</strong> ou <strong>Installer l'application</strong>.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setDownloadModal({ isOpen: false, platform: null });
                    onEnterApp();
                  }}
                  className="w-full mt-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  Lancer l'application maintenant
                </button>
              </div>
            ) : (
              <div className="text-left">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Apple size={32} />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Installation sur iOS</h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                  Suivez ces étapes simples pour ajouter l'application sur votre écran d'accueil iPhone ou iPad.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <p className="text-xs text-gray-300">
                      Ouvrez le navigateur <strong>Safari</strong> et accédez à notre application web.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <p className="text-xs text-gray-300">
                      Appuyez sur le bouton <strong>Partager</strong> <span className="bg-gray-800 px-1 py-0.5 rounded text-[10px]">↥</span> en bas (iPhone) ou en haut à droite (iPad).
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <p className="text-xs text-gray-300">
                      Faites défiler le menu et appuyez sur <strong>Sur l'écran d'accueil</strong>.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setDownloadModal({ isOpen: false, platform: null });
                    onEnterApp();
                  }}
                  className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  Lancer l'application maintenant
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulle d'aide d'installation intelligente pour Safari sur iOS */}
      {isIOS && showIOSBanner && typeof window !== 'undefined' && !(window.navigator as any).standalone && (
        <div 
          onClick={() => handleDownload('ios')}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-gray-900 border border-blue-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Apple size={20} />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="text-xs font-bold text-white">Installer l'application</h4>
            <p className="text-[9px] text-gray-400 mt-0.5">
              Cliquez ici pour voir comment l'ajouter sur votre écran d'accueil.
            </p>
          </div>
          <div className="text-blue-400 shrink-0 text-sm animate-pulse mr-2">➜</div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Éviter d'ouvrir le tutoriel lors de la fermeture
              setShowIOSBanner(false);
            }}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full bg-gray-800/50 hover:bg-gray-800"
            title="Masquer l'aide"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
};
