import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { Lock, Users } from 'lucide-react';
import type { User } from '../../types';

export const LockScreen: React.FC = () => {
  const { getUsersByTenant, setCurrentUser } = usePOSStore();
  const users = getUsersByTenant();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumpad = (num: string) => {
    setError(false);
    if (num === 'C') {
      setPin('');
    } else if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Automatically validate if 4 digits are entered
      if (newPin.length === 4 && selectedUser) {
        if (selectedUser.pinCode === newPin) {
          setCurrentUser(selectedUser);
        } else {
          setError(true);
          setPin('');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900 text-white flex flex-col justify-center items-center p-4 z-50 select-none">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-dark-800 rounded-3xl overflow-hidden shadow-2xl border border-dark-700 max-h-[95vh] my-auto">
        
        {/* Left: User Selection */}
        <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-dark-700 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <Lock className="text-primary" size={28} />
            <h2 className="text-2xl font-bold">Qui se connecte ?</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setPin('');
                  setError(false);
                }}
                className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all active:scale-[0.98] ${
                  selectedUser?.id === user.id 
                    ? 'border-primary bg-primary/10 text-white' 
                    : 'border-dark-700 bg-dark-900 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center font-bold text-white text-lg">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-white">{user.name}</p>
                    <p className="text-sm text-gray-400 font-medium">{user.role}</p>
                  </div>
                </div>
                {selectedUser?.id === user.id && <span className="text-primary text-xl">●</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Right: PIN entry Numpad */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center">
          {selectedUser ? (
            <div className="w-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-white mb-2 text-center">
                Code PIN pour {selectedUser.name}
              </h3>
              <p className="text-sm text-gray-400 mb-6 text-center">Saisissez vos 4 chiffres</p>

              {/* Dots Display */}
              <div className="flex gap-4 mb-8">
                {[0, 1, 2, 3].map(index => (
                  <div 
                    key={index}
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                      error 
                        ? 'border-red-500 bg-red-500/20' 
                        : index < pin.length 
                          ? 'border-primary bg-primary' 
                          : 'border-dark-600 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm font-semibold mb-6 animate-pulse">
                  Code PIN incorrect. Réessayez.
                </p>
              )}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {['1','2','3','4','5','6','7','8','9','C','0',''].map((key, i) => {
                  if (key === '') return <div key={i} />;
                  return (
                    <button
                      key={key}
                      onClick={() => handleNumpad(key)}
                      className={`h-16 rounded-2xl text-2xl font-bold transition-transform active:scale-90 flex items-center justify-center
                        ${key === 'C' ? 'bg-red-500/20 text-red-500' : 'bg-dark-900 hover:bg-dark-700 border border-dark-700 text-white'}`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center text-gray-500 mb-6 border border-dark-600">
                <Users size={36} />
              </div>
              <p className="text-gray-400 font-semibold text-lg max-w-xs">
                Sélectionnez un profil à gauche pour commencer votre session.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
