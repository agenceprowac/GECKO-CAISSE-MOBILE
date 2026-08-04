import React from 'react';
import { usePOSStore } from '../../store';
import { CheckCircle2 } from 'lucide-react';

export const NotificationModal: React.FC = () => {
  const { notification, hideNotification } = usePOSStore();

  if (!notification) return null;

  const isConfirm = notification.type === 'confirm';

  const handleConfirm = () => {
    if (notification.onConfirm) {
      notification.onConfirm();
    }
    hideNotification();
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-[100] p-4 animate-fade-in">
      <div className="bg-dark-800 border border-dark-700 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center animate-zoom-in">
        
        {/* Icon */}
        <div className="mb-4">
          {notification.type === 'confirm' && (
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          )}
          {notification.type === 'success' && (
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
          )}
          {notification.type === 'alert' && (
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          )}
          {notification.type === 'error' && (
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          {notification.type === 'confirm' && 'Confirmation'}
          {notification.type === 'success' && 'Succès'}
          {notification.type === 'alert' && 'Attention'}
          {notification.type === 'error' && 'Erreur'}
        </h3>

        {/* Message */}
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {notification.message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          {isConfirm ? (
            <>
              <button
                onClick={hideNotification}
                className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 active:scale-95 text-white font-bold rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Confirmer
              </button>
            </>
          ) : (
            <button
              onClick={hideNotification}
              className="w-full py-3 bg-primary hover:bg-primary/90 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              D'accord
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
