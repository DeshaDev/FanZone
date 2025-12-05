import React, { useState } from 'react';
import { Button } from './Button';
import { Poll, DailyQuestion, MatchFixture, InteractionType } from '../types';
import { recordInteraction } from '../services/blockchainService';
import { Leaderboard } from './Leaderboard';

interface UserDashboardProps {
  polls: Poll[];
  questions: DailyQuestion[];
  matches: MatchFixture[];
  walletAddress: string;
  username: string;
  userPoints: number;
  lastCheckIn?: number;
  userActions: {
    votes: Record<string, string>;
    answers: Record<string, number>;
    predictions: Record<string, string>;
  };
  onNewTransaction: (tx: any) => void;
  onAddPoints: (points: number) => void;
  onActionRecorded: (type: 'vote' | 'answer' | 'predict' | 'checkin', id: string, value: any) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  polls, 
  questions, 
  matches, 
  walletAddress,
  username,
  userPoints,
  lastCheckIn = 0,
  userActions,
  onNewTransaction,
  onAddPoints,
  onActionRecorded
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [inputState, setInputState] = useState<Record<string, string>>({});

  // Check if Check-in is available (24 hours = 86400000 ms)
  const canCheckIn = Date.now() > lastCheckIn + 86400000;

  const handleCheckIn = async () => {
    if (!canCheckIn) return;
    setLoadingAction('check-in');
    try {
        const tx = await recordInteraction(InteractionType.CHECK_IN, `User ${username} daily check-in`, walletAddress);
        onNewTransaction(tx);
        onAddPoints(50);
        onActionRecorded('checkin', 'daily', Date.now());
    } finally {
        setLoadingAction(null);
    }
  };

  // --- Voting Logic ---
  const handleVote = async (pollId: string, optionId: string, optionText: string) => {
    if (userActions.votes[pollId]) return; 

    setLoadingAction(`vote-${pollId}`);
    try {
      const tx = await recordInteraction(
        InteractionType.VOTE, 
        `User ${username} voted: ${optionText}`, 
        walletAddress
      );
      onNewTransaction(tx);
      onActionRecorded('vote', pollId, optionId);
    } finally {
      setLoadingAction(null);
    }
  };

  // --- Quiz Logic (Multiple Choice) ---
  const handleAnswerQuestion = async (q: DailyQuestion, selectedIdx: number) => {
    if (userActions.answers[q.id] !== undefined) return; 

    setLoadingAction(`answer-${q.id}-${selectedIdx}`);
    
    const isCorrect = selectedIdx === q.correctAnswerIndex;
    
    try {
      const details = isCorrect 
        ? `User ${username} answered correctly on QID:${q.id}` 
        : `User ${username} answered wrong on QID:${q.id}`;

      const tx = await recordInteraction(
        InteractionType.ANSWER, 
        details,
        walletAddress
      );
      
      onNewTransaction(tx);
      onActionRecorded('answer', q.id, selectedIdx);
      
      if (isCorrect) onAddPoints(10);
      
    } finally {
      setLoadingAction(null);
    }
  };

  // --- Prediction Logic ---
  const handlePredict = async (match: MatchFixture) => {
    if (new Date() > new Date(match.date)) {
        alert("انتهى وقت التوقع! المباراة بدأت.");
        return;
    }
    if (userActions.predictions[match.id]) return;

    const scoreA = inputState[`m-${match.id}-a`];
    const scoreB = inputState[`m-${match.id}-b`];
    if (!scoreA || !scoreB) return;

    setLoadingAction(`predict-${match.id}`);
    try {
      const predictionStr = `${scoreA}-${scoreB}`;
      const tx = await recordInteraction(
        InteractionType.PREDICTION, 
        `User ${username} predicted ${match.teamA} vs ${match.teamB}: [${predictionStr}]`, 
        walletAddress
      );
      onNewTransaction(tx);
      onActionRecorded('predict', match.id, predictionStr);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setInputState(prev => ({...prev, [key]: value}));
  };

  return (
    <div className="space-y-10">
      
      {/* Welcome & Points Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#35D07F]/10 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/10">
               👋
            </div>
            <div>
              <h2 className="text-3xl font-black mb-1">مرحباً, <span className="text-[#35D07F]">{username}</span></h2>
              <p className="text-gray-400 font-medium">ابدأ التفاعل واصعد إلى القمة!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Check-in Widget */}
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center w-32">
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">تسجيل يومي</span>
                <Button 
                    variant={canCheckIn ? "celo" : "secondary"} 
                    className={`w-full py-1 text-xs h-8 ${!canCheckIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || loadingAction === 'check-in'}
                    isLoading={loadingAction === 'check-in'}
                >
                    {canCheckIn ? 'سجل +50' : 'تم التسجيل ✅'}
                </Button>
             </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="text-right">
                <span className="block text-xs text-gray-400 uppercase tracking-wider">مجموع النقاط</span>
                <span className="block text-4xl font-black text-yellow-400 font-mono">{userPoints}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 text-xl font-bold">
                ★
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-12">
            
            {/* Questions Section (Multiple Choice) */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                <span className="bg-yellow-100 p-2 rounded-xl text-2xl shadow-sm text-yellow-600">⚡</span>
                أسئلة التحدي
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {questions.map((q, idx) => {
                    const hasAnswered = userActions.answers[q.id] !== undefined;
                    const selectedAns = userActions.answers[q.id];
                    const isCorrect = hasAnswered && selectedAns === q.correctAnswerIndex;

                    return (
                      <div key={q.id} className={`glass p-6 rounded-3xl transition-all duration-300 border-l-8 ${hasAnswered ? (isCorrect ? 'border-l-green-500' : 'border-l-red-500') : 'border-l-yellow-400'}`}>
                          <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-bold tracking-wider text-gray-500 bg-white px-3 py-1 rounded-full uppercase">سؤال {idx + 1}</span>
                            {hasAnswered && (
                                <span className={`font-bold text-xs px-2 py-1 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isCorrect ? 'إجابة صحيحة +10' : 'إجابة خاطئة'}
                                </span>
                            )}
                          </div>
                          <h3 className="font-bold text-xl text-gray-800 mb-6 leading-relaxed">{q.text}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((option, optIdx) => {
                                  let btnClass = "bg-white border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-gray-700";
                                  if (hasAnswered) {
                                      if (optIdx === q.correctAnswerIndex) {
                                          btnClass = "bg-green-500 text-white border-green-600 shadow-md"; // Always show correct answer green
                                      } else if (optIdx === selectedAns && !isCorrect) {
                                          btnClass = "bg-red-500 text-white border-red-600"; // Wrong selection
                                      } else {
                                          btnClass = "bg-gray-100 text-gray-400 border-transparent opacity-50"; // Others dimmed
                                      }
                                  }

                                  return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleAnswerQuestion(q, optIdx)}
                                        disabled={hasAnswered || loadingAction !== null}
                                        className={`w-full py-4 px-4 rounded-xl border-2 font-bold transition-all text-sm md:text-base flex justify-between items-center ${btnClass}`}
                                    >
                                        <span>{option}</span>
                                        {hasAnswered && optIdx === q.correctAnswerIndex && <span>✅</span>}
                                        {hasAnswered && optIdx === selectedAns && !isCorrect && <span>❌</span>}
                                    </button>
                                  );
                              })}
                          </div>
                      </div>
                    );
                })}
              </div>
            </div>

            {/* Matches Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-xl text-2xl shadow-sm text-blue-600">⚽</span>
                توقعات المباريات
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                {matches.map(match => {
                  const isStarted = new Date() > new Date(match.date);
                  const hasPredicted = !!userActions.predictions[match.id];
                  const prediction = userActions.predictions[match.id];

                  return (
                    <div key={match.id} className={`rounded-3xl shadow-sm border overflow-hidden transition-all relative group ${isStarted || hasPredicted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100 hover:shadow-xl hover:-translate-y-1'}`}>
                      
                      {/* Status Badges */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                          {isStarted && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                🛑 انتهى الوقت
                              </span>
                          )}
                          {hasPredicted && (
                              <span className="bg-[#35D07F] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                ✅ تم التوقع: {prediction}
                              </span>
                          )}
                      </div>

                      <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-lg border shadow-sm">كأس العرب</span>
                        <span className="text-xs font-bold text-gray-600 dir-ltr font-mono flex items-center gap-2">
                           ⏰ {new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      <div className={`p-6 ${isStarted || hasPredicted ? 'pointer-events-none opacity-60' : ''}`}>
                        <div className="flex justify-between items-center mb-8">
                          <div className="text-center w-1/3">
                              <h3 className="font-black text-gray-800 text-lg mb-1">{match.teamA}</h3>
                          </div>
                          <span className="font-black text-4xl text-gray-200 italic">VS</span>
                          <div className="text-center w-1/3">
                              <h3 className="font-black text-gray-800 text-lg mb-1">{match.teamB}</h3>
                          </div>
                        </div>
                        
                        {!hasPredicted && !isStarted ? (
                            <>
                              <div className="flex gap-4 justify-center mb-6">
                                  <input 
                                  type="number" 
                                  className="w-16 h-16 text-center text-3xl font-bold bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#35D07F] focus:shadow-lg transition-all"
                                  placeholder="-"
                                  onChange={(e) => handleInputChange(`m-${match.id}-a`, e.target.value)}
                                  />
                                  <span className="self-center text-2xl text-gray-300 font-bold">:</span>
                                  <input 
                                  type="number" 
                                  className="w-16 h-16 text-center text-3xl font-bold bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-[#35D07F] focus:shadow-lg transition-all"
                                  placeholder="-"
                                  onChange={(e) => handleInputChange(`m-${match.id}-b`, e.target.value)}
                                  />
                              </div>
                              <Button 
                                  variant="celo" 
                                  className="w-full text-base py-4 rounded-2xl shadow-green-500/20"
                                  onClick={() => handlePredict(match)}
                                  isLoading={loadingAction === `predict-${match.id}`}
                              >
                                  تأكيد التوقع وإرسال للعقد الذكي
                              </Button>
                            </>
                        ) : (
                            <div className="text-center py-6 bg-gray-100 rounded-2xl border border-gray-200">
                                {isStarted && !hasPredicted ? (
                                    <span className="text-gray-500 text-sm font-bold">لم تشارك في التوقع لهذه المباراة</span>
                                ) : (
                                    <div className="flex flex-col items-center">
                                      <span className="text-gray-400 text-xs font-bold uppercase mb-1">توقعك المسجل</span>
                                      <span className="text-gray-800 font-black font-mono text-3xl tracking-widest">
                                          {hasPredicted ? prediction : '--'}
                                      </span>
                                    </div>
                                )}
                            </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Polls Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                <span className="bg-purple-100 p-2 rounded-xl text-2xl shadow-sm text-purple-600">🗳</span>
                تصويت الجمهور
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {polls.map((poll) => {
                  const hasVoted = !!userActions.votes[poll.id];
                  return (
                      <div key={poll.id} className="glass p-6 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold mb-6 text-gray-800 leading-snug">{poll.question}</h3>
                      <div className="space-y-3">
                          {poll.options.map((opt, i) => (
                          <button
                              key={opt.id}
                              onClick={() => handleVote(poll.id, opt.id, opt.text)}
                              disabled={loadingAction !== null || hasVoted}
                              className={`relative w-full overflow-hidden text-right p-4 rounded-2xl border-2 transition-all flex justify-between items-center group
                                  ${hasVoted 
                                      ? opt.id === userActions.votes[poll.id] ? 'bg-purple-50 border-purple-500' : 'bg-gray-50 border-gray-100 opacity-50 grayscale' 
                                      : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md'}
                              `}
                          >
                              <span className="relative z-10 font-bold text-gray-600">
                              <span className="inline-block w-6 text-gray-300 font-mono text-xs">{i+1}.</span> 
                              {opt.text}
                              </span>
                              {hasVoted && opt.id === userActions.votes[poll.id] && (
                                   <span className="text-purple-600 text-xs font-bold bg-purple-100 px-2 py-1 rounded">اختيارك</span>
                              )}
                          </button>
                          ))}
                      </div>
                      </div>
                  );
                })}
              </div>
            </div>

        </div>

        {/* Sidebar (Leaderboard) */}
        <div className="lg:col-span-4 space-y-8">
            <Leaderboard currentUser={username} currentPoints={userPoints} />
            
            {/* Promo Box */}
            <div className="bg-gradient-to-br from-[#35D07F] to-emerald-600 rounded-3xl p-6 text-white text-center relative overflow-hidden">
               <div className="relative z-10">
                 <div className="text-4xl mb-2">🎁</div>
                 <h3 className="font-black text-xl mb-2">الجوائز الأسبوعية</h3>
                 <p className="text-sm text-green-100 mb-4">أصحاب المراكز الثلاثة الأولى يحصلون على عملات CELO مجانية!</p>
                 <button className="bg-white text-emerald-600 font-bold px-6 py-2 rounded-xl text-sm shadow-lg hover:scale-105 transition-transform">
                   قوانين الجوائز
                 </button>
               </div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
               <div className="absolute top-10 -left-10 w-20 h-20 bg-yellow-400 opacity-20 rounded-full blur-xl"></div>
            </div>
        </div>

      </div>
    </div>
  );
};