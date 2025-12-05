import React from 'react';
import { Transaction, InteractionType } from '../types';

interface TransactionFeedProps {
  transactions: Transaction[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const getExplorerLink = (hash: string) => {
    if (hash.startsWith('0x') && hash.length === 66) {
      return `https://alfajores.celoscan.io/tx/${hash}`;
    }
    return '#';
  };

  return (
    <div className="glass p-5 rounded-3xl shadow-sm h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black flex items-center gap-2 text-gray-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          النشاط المباشر
        </h3>
        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500 font-mono">Testnet</span>
      </div>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pl-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            <span className="text-4xl mb-2">⛓️</span>
            <p className="text-xs">بانتظار التفاعلات...</p>
          </div>
        ) : (
          transactions.slice().reverse().map((tx) => (
            <div key={tx.hash} className="group relative bg-white bg-opacity-60 hover:bg-opacity-100 p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="absolute -right-1 top-3 w-1 h-8 rounded-l-full bg-gradient-to-b from-gray-200 to-transparent group-hover:from-[#35D07F]"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tx.type === InteractionType.VOTE ? 'bg-purple-100 text-purple-600' :
                  tx.type === InteractionType.PREDICTION ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {tx.type === InteractionType.VOTE && 'VOTE'}
                  {tx.type === InteractionType.ANSWER && 'QUIZ'}
                  {tx.type === InteractionType.PREDICTION && 'PREDICT'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{new Date(tx.timestamp).toLocaleTimeString('ar-EG')}</span>
              </div>
              
              <p className="text-sm text-gray-800 font-medium leading-relaxed mb-2 line-clamp-2">
                {tx.details}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <a 
                  href={getExplorerLink(tx.hash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-gray-400 hover:text-[#35D07F] flex items-center gap-1 transition-colors"
                >
                  {tx.hash.substring(0, 8)}...{tx.hash.substring(62)}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
                <span className="text-[10px] text-gray-300">#{tx.blockNumber}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};