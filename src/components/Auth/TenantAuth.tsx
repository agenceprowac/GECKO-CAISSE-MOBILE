import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { Coffee, Mail, Building, Key, PlusCircle, LogIn, ArrowRight, ArrowLeft } from 'lucide-react';

export const TenantAuth: React.FC = () => {
  const { registerTenant, loginTenant, showNotification, setHasEnteredApp } = usePOSStore();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Input states
  const [email, setEmail] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail) {
      showNotification('alert', 'Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'REGISTER') {
        if (!establishmentName.trim()) {
          showNotification('alert', "Veuillez entrer le nom de l'établissement.");
          setIsLoading(false);
          return;
        }
        if (adminPin.length !== 4) {
          showNotification('alert', 'Le code PIN doit être de 4 chiffres.');
          setIsLoading(false);
          return;
        }
        if (adminPin !== confirmPin) {
          showNotification('alert', 'Les codes PIN de confirmation ne correspondent pas.');
          setIsLoading(false);
          return;
        }

        const success = await registerTenant(cleanEmail, establishmentName, adminPin);
        if (success) {
          showNotification('alert', `Espace "${establishmentName}" créé avec succès !`);
        } else {
          showNotification('alert', 'Cet email est déjà utilisé pour un autre espace.');
        }
      } else {
        // Mode LOGIN
        const tenant = await loginTenant(cleanEmail);
        if (tenant) {
          showNotification('alert', `Connexion à l'espace "${tenant.establishmentName}" réussie.`);
        } else {
          showNotification('alert', "Aucun établissement n'est associé à cette adresse email.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900 text-white flex flex-col justify-center items-center p-4 z-50 select-none overflow-y-auto">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-dark-800/90 backdrop-blur-xl border border-dark-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 my-auto">
        {/* Bouton de Retour à l'accueil */}
        <button 
          onClick={() => setHasEnteredApp(false)}
          className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold bg-dark-700/50 hover:bg-dark-700 px-3 py-1.5 rounded-xl border border-dark-700 transition-all cursor-pointer"
          title="Retourner à l'accueil"
        >
          <ArrowLeft size={14} />
          Retour
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <Coffee size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {mode === 'LOGIN' ? 'Accéder à votre Espace' : 'Créer un Espace Gecko'}
          </h2>
          <p className="text-gray-400 text-sm text-center mt-2 leading-relaxed">
            {mode === 'LOGIN' 
              ? 'Entrez l\'email de l\'administrateur de l\'établissement' 
              : 'Configurez votre propre caisse enregistreuse tactile en 1 minute.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Administrateur</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                autoCapitalize="none"
                autoCorrect="false"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full pl-10 pr-4 py-3 bg-dark-900/60 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-sm font-medium transition-colors"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nom de l'Établissement</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    required
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    placeholder="Ex: Le Comptoir Lounge"
                    className="w-full pl-10 pr-4 py-3 bg-dark-900/60 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Code PIN Admin</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN (4)"
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/60 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-center tracking-widest text-lg font-bold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirmation</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="PIN (4)"
                      className="w-full pl-10 pr-4 py-3 bg-dark-900/60 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-center tracking-widest text-lg font-bold transition-colors"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500/95 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span>Connexion en cours...</span>
            ) : mode === 'LOGIN' ? (
              <>
                <LogIn size={18} /> Se Connecter
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Créer l'Établissement
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-dark-700/60 pt-6 text-center">
          <p className="text-gray-400 text-xs">
            {mode === 'LOGIN' ? "Vous n'avez pas encore d'établissement ?" : 'Vous avez déjà un compte ?'}
          </p>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
              setEmail('');
              setEstablishmentName('');
              setAdminPin('');
              setConfirmPin('');
            }}
            className="mt-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            {mode === 'LOGIN' ? "Créer un espace maintenant" : 'Accéder à un espace existant'}
          </button>
        </div>
      </div>
    </div>
  );
};
