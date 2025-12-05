import React, { useState } from 'react';
import { Button } from './Button';
import { registerUserOnChain } from '../services/blockchainService';

interface RegistrationModalProps {
  walletAddress: string;
  onRegistered: (username: string, tx: any) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ walletAddress, onRegistered }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) return;

    setIsLoading(true);
    try {
      // Simulate Smart Contract Call: register(username)
      const tx = await registerUserOnChain(username, walletAddress);
      onRegistered(username, tx);
    } catch (error) {
      console.error("Registration failed", error);
      alert("فشل التسجيل. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass p-8 rounded-[2rem] max-w-md w-full shadow-2xl border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#35D07F]/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#35D07F] to-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-green-500/30 mb-4">
            🆔
          </div>
          <h2 className="text-2xl font-black text-gray-800">الهوية الرقمية</h2>
          <p className="text-gray-500 text-sm mt-2">
            للمشاركة في منصة FanZone، يجب تسجيل اسم مستخدم فريد على البلوكتشين.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 mr-1">اختر اسم المستخدم</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#35D07F] focus:ring-4 focus:ring-[#35D07F]/10 outline-none transition-all text-left font-bold text-gray-800"
              placeholder="@username"
              maxLength={15}
            />
            <p className="text-[10px] text-gray-400 mt-1 mr-1">* سيتم تسجيل هذا الاسم في العقد الذكي ولا يمكن تغييره.</p>
          </div>
          
          <Button 
            variant="celo" 
            className="w-full py-4 text-lg shadow-green-500/20"
            disabled={username.length < 3}
            isLoading={isLoading}
          >
            تسجيل الهوية وتوقيع المعاملة
          </Button>
        </form>
      </div>
    </div>
  );
};