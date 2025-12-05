import React, { useMemo } from 'react';

interface LeaderboardProps {
  currentUser: string;
  currentPoints: number;
}

interface LeaderboardEntry {
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, currentPoints }) => {
  // Mock data representing other users on the Smart Contract
  const mockCompetitors: LeaderboardEntry[] = useMemo(() => [
    { name: 'Satoshi_Nakamoto', points: 150 },
    { name: 'Celo_King', points: 120 },
    { name: 'Web3_Falcon', points: 95 },
    { name: 'Crypto_Bedouin', points: 80 },
    { name: 'Desert_Fox', points: 60 },
  ], []);

  // Merge current user into the list and sort dynamically
  const leaderboardData = useMemo(() => {
    const allUsers: LeaderboardEntry[] = [
      ...mockCompetitors,
      { name: currentUser, points: currentPoints, isCurrentUser: true }
    ];
    // Remove duplicates if user name conflicts (simple logic)
    const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.name, item])).values());
    
    return uniqueUsers.sort((a, b) => b.points - a.points);
  }, [currentUser, currentPoints, mockCompetitors]);

  return (
    <div className="glass rounded-3xl p-6 border border-gray-100 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <span>🏆</span> لوحة الصدارة
        </h3>
        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">Top Players</span>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((user, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          
          let rankStyle = "bg-gray-100 text-gray-500";
          if (rank === 1) rankStyle = "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-200";
          if (rank === 2) rankStyle = "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200";
          if (rank === 3) rankStyle = "bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-orange-200";

          return (
            <div 
              key={user.name}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                user.isCurrentUser 
                  ? 'bg-[#35D07F]/10 border-2 border-[#35D07F] transform scale-105 shadow-lg z-10' 
                  : 'bg-white border border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-md ${rankStyle}`}>
                  {rank}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${user.isCurrentUser ? 'text-[#35D07F]' : 'text-gray-700'}`}>
                    {user.name} {user.isCurrentUser && '(أنت)'}
                  </span>
                  {rank === 1 && <span className="text-[8px] text-yellow-500 font-bold">👑 المتصدر الحالي</span>}
                </div>
              </div>
              <div className="font-mono font-bold text-gray-800">
                {user.points} <span className="text-[10px] text-gray-400">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
           يتم تحديث الترتيب تلقائياً عبر العقد الذكي بناءً على نشاط المستخدمين.
        </p>
      </div>
    </div>
  );
};