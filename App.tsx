import React, { useState, useEffect } from 'react';
import { connectWallet, connectWalletMock } from './services/blockchainService';
import { AppState, InteractionType, Transaction } from './types';
import { AdminPanel } from './components/AdminPanel';
import { UserDashboard } from './components/UserDashboard';
import { Button } from './components/Button';
import { RegistrationModal } from './components/RegistrationModal';

// 🔒 ADMIN WALLET ADDRESS
// In production, this would be the deployer of the contract.
// For testing, we use the address returned by the Mock Wallet.
const ADMIN_WALLET_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d89A23";

export default function App() {
  const [state, setState] = useState<AppState>({
    polls: [],
    dailyQuestions: [],
    matches: [],
    transactions: [],
    walletAddress: null,
    username: null,
    balance: '0 CELO',
    userPoints: 0,
    lastCheckIn: 0,
    userVotes: {},
    userAnswers: {},
    userPredictions: {}
  });

  const [viewMode, setViewMode] = useState<'admin' | 'user'>('user');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Computed property to check if current user is admin
  const isAdmin = state.walletAddress?.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();

  // Initialize Data
  useEffect(() => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 60 * 1000 * 24); // Tomorrow
    const pastDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago

    setState(prev => ({
      ...prev,
      matches: [
        {
          id: 'match-1',
          teamA: 'السعودية',
          teamB: 'المغرب',
          date: futureDate.toISOString(), // Active
        },
        {
          id: 'match-2',
          teamA: 'مصر',
          teamB: 'تونس',
          date: pastDate.toISOString(), // Expired
        }
      ],
      polls: [
        {
          id: 'p1',
          question: 'ما هي العملة الأفضل للاستثمار في 2025؟',
          options: [
            { id: 'o1', text: 'CELO (Mobile First)', votes: 120 },
            { id: 'o2', text: 'Bitcoin (Gold)', votes: 45 }
          ]
        }
      ],
      dailyQuestions: [
         { 
             id: 'q1', 
             text: 'ما هو اسم شبكة اختبار Celo؟', 
             options: ['Ropsten', 'Alfajores', 'Goerli', 'Mumbai'],
             correctAnswerIndex: 1
         }
      ]
    }));
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const wallet = await connectWallet();
      setState(prev => ({
        ...prev,
        walletAddress: wallet.address,
        balance: wallet.balance
      }));
      setIsDemoMode(false);
    } catch (error) {
      console.log("Falling back to demo mode due to: ", error);
      const mock = await connectWalletMock();
      setState(prev => ({
        ...prev,
        walletAddress: mock.address,
        balance: mock.balance
      }));
      setIsDemoMode(true);
    }
    setIsConnecting(false);
  };

  const handleNewTransaction = (tx: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, tx]
    }));
  };

  const handleRegistration = (username: string, tx: Transaction) => {
      setState(prev => ({
          ...prev,
          username: username,
          transactions: [...prev.transactions, tx]
      }));
  };

  const handleActionRecorded = (type: 'vote' | 'answer' | 'predict' | 'checkin', id: string, value: any) => {
      setState(prev => {
          const newState = { ...prev };
          if (type === 'vote') newState.userVotes = { ...prev.userVotes, [id]: value };
          if (type === 'answer') newState.userAnswers = { ...prev.userAnswers, [id]: value };
          if (type === 'predict') newState.userPredictions = { ...prev.userPredictions, [id]: value };
          if (type === 'checkin') newState.lastCheckIn = value;
          return newState;
      });
  };

  const handleAddPoints = (pts: number) => {
    setState(prev => ({
      ...prev,
      userPoints: prev.userPoints + pts
    }));
  };

  return (
    <div className="min-h-screen pb-12 font-tajawal selection:bg-[#35D07F] selection:text-white">
      {/* Registration Modal */}
      {state.walletAddress && !state.username && viewMode === 'user' && (
          <RegistrationModal 
            walletAddress={state.walletAddress} 
            onRegistered={handleRegistration} 
          />
      )}

      {/* Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#35D07F] to-[#2E8B57] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-200">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight text-gray-800 leading-none">
                  Fan<span className="text-[#35D07F]">Zone</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Decentralized App</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {state.walletAddress ? (
                <div className="flex items-center gap-3 bg-white/50 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center text-white text-xs">
                    🦊
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-xs font-bold text-gray-800">{state.balance}</span>
                     <span className="text-[10px] text-gray-400 font-mono">
                        {state.walletAddress.substring(0, 6)}...{state.walletAddress.substring(38)}
                     </span>
                  </div>
                </div>
              ) : (
                <Button onClick={handleConnect} isLoading={isConnecting} variant="celo" className="rounded-full px-8 shadow-green-300/50">
                  ربط المحفظة
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Center Content */}
        <div className="">
          {!state.walletAddress ? (
            <div className="glass flex flex-col items-center justify-center py-24 px-4 rounded-[3rem] text-center border border-white shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#35D07F] to-[#2E8B57] rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-500">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-800 mb-6 tracking-tight">
                مستقبل المشجعين <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#35D07F] to-emerald-600">على البلوكتشين</span>
              </h1>
              <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed">
                انضم إلى أول منصة عربية لامركزية للتفاعل الرياضي. شارك في التصويتات، توقع المباريات، واربح المكافآت.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleConnect} isLoading={isConnecting} variant="celo" className="px-10 py-4 text-lg rounded-2xl shadow-green-400/40">
                  ابدأ الآن (Connect Wallet)
                </Button>
                <a href="https://celo.org/" target="_blank" className="px-10 py-4 text-lg font-bold text-gray-600 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 flex items-center justify-center">
                  تعرف على Celo
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* View Switcher - Only Visible to Admin */}
              {isAdmin && (
                <div className="mb-6 flex gap-2 justify-center animate-fade-in-down">
                   <div className="bg-white/50 p-1 rounded-2xl flex border border-gray-200 shadow-sm backdrop-blur-sm">
                      <button onClick={() => setViewMode('user')} className={`px-6 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${viewMode === 'user' ? 'bg-white text-[#35D07F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>وضع المستخدم</button>
                      <button onClick={() => setViewMode('admin')} className={`px-6 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${viewMode === 'admin' ? 'bg-white text-[#35D07F] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                         🔐 لوحة المشرف
                      </button>
                   </div>
                </div>
              )}

              {/* Content Render */}
              <div className="animate-fade-in-up">
                {viewMode === 'admin' && isAdmin ? (
                  <AdminPanel 
                    onAddPoll={(poll) => setState(prev => ({...prev, polls: [poll, ...prev.polls]}))}
                    onAddQuestion={(q) => setState(prev => ({...prev, dailyQuestions: [q, ...prev.dailyQuestions]}))}
                    onAddMatch={(match) => setState(prev => ({...prev, matches: [match, ...prev.matches]}))}
                  />
                ) : (
                  <UserDashboard 
                    polls={state.polls}
                    questions={state.dailyQuestions}
                    matches={state.matches}
                    walletAddress={state.walletAddress}
                    username={state.username || 'Fan'}
                    userPoints={state.userPoints}
                    lastCheckIn={state.lastCheckIn}
                    userActions={{
                        votes: state.userVotes,
                        answers: state.userAnswers,
                        predictions: state.userPredictions
                    }}
                    onNewTransaction={handleNewTransaction}
                    onAddPoints={handleAddPoints}
                    onActionRecorded={handleActionRecorded}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}