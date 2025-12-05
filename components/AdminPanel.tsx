import React, { useState } from 'react';
import { Button } from './Button';
import { generateDailyQuestionsAI } from '../services/geminiService';
import { DailyQuestion, Poll, MatchFixture } from '../types';

interface AdminPanelProps {
  onAddPoll: (poll: Poll) => void;
  onAddQuestion: (question: DailyQuestion) => void;
  onAddMatch: (match: MatchFixture) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddPoll, onAddQuestion, onAddMatch }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual Poll State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');
  
  // Manual Question State
  const [manualQText, setManualQText] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectIdx, setManualCorrectIdx] = useState(0);

  // Manual Match State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    const questions = await generateDailyQuestionsAI();
    questions.forEach(q => onAddQuestion(q)); 
    setIsGenerating(false);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || !pollOption1 || !pollOption2) return;
    
    const newPoll: Poll = {
      id: Date.now().toString(),
      question: pollQuestion,
      options: [
        { id: 'opt1', text: pollOption1, votes: 0 },
        { id: 'opt2', text: pollOption2, votes: 0 }
      ]
    };
    onAddPoll(newPoll);
    setPollQuestion('');
    setPollOption1('');
    setPollOption2('');
  };

  const handleManualOptionChange = (idx: number, val: string) => {
    const newOpts = [...manualOptions];
    newOpts[idx] = val;
    setManualOptions(newOpts);
  };

  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQText || manualOptions.some(o => !o)) return;
    
    const newQ: DailyQuestion = {
      id: `manual-${Date.now()}`,
      text: manualQText,
      options: manualOptions,
      correctAnswerIndex: manualCorrectIdx
    };
    onAddQuestion(newQ);
    setManualQText('');
    setManualOptions(['', '', '', '']);
    setManualCorrectIdx(0);
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || !matchDate || !matchTime) return;

    const fullDate = new Date(`${matchDate}T${matchTime}`);

    const newMatch: MatchFixture = {
      id: `match-${Date.now()}`,
      teamA,
      teamB,
      date: fullDate.toISOString(),
    };
    onAddMatch(newMatch);
    setTeamA('');
    setTeamB('');
    setMatchDate('');
    setMatchTime('');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Add Matches */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span>⚽</span> إدارة المباريات
        </h2>
        <form onSubmit={handleAddMatch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">الفريق الأول</label>
            <input value={teamA} onChange={e => setTeamA(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="مثال: السعودية" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">الفريق الثاني</label>
            <input value={teamB} onChange={e => setTeamB(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="مثال: الأرجنتين" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
            <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">التوقيت</label>
            <input type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)} className="w-full p-2 border rounded-lg" />
          </div>
          <Button type="submit" variant="secondary" className="w-full h-[42px]">إضافة</Button>
        </form>
      </div>

      {/* 2. Questions (Manual + AI) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span>📝</span> بنك الأسئلة والمسابقات
        </h2>
        
        {/* Manual Form */}
        <form onSubmit={handleAddManualQuestion} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-600 mb-3">إضافة سؤال يدوياً</h4>
          <div className="space-y-3">
            <input 
              value={manualQText} 
              onChange={e => setManualQText(e.target.value)} 
              className="w-full p-2 border rounded-lg outline-none focus:border-[#35D07F]" 
              placeholder="نص السؤال..." 
            />
            <div className="grid grid-cols-2 gap-2">
               {[0, 1, 2, 3].map(i => (
                 <div key={i} className="flex items-center gap-1">
                   <input 
                      type="radio" 
                      name="correctIdx" 
                      checked={manualCorrectIdx === i} 
                      onChange={() => setManualCorrectIdx(i)}
                      className="accent-[#35D07F]"
                   />
                   <input 
                     value={manualOptions[i]}
                     onChange={e => handleManualOptionChange(i, e.target.value)}
                     className="w-full p-2 border rounded-lg text-sm"
                     placeholder={`الخيار ${i+1}`}
                   />
                 </div>
               ))}
            </div>
            <Button type="submit" disabled={!manualQText} variant="celo" className="w-full mt-2">حفظ السؤال</Button>
          </div>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">أو باستخدام الذكاء الاصطناعي</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <Button variant="primary" onClick={handleGenerateQuestions} isLoading={isGenerating} className="w-full mt-2">
          ✨ توليد 3 أسئلة (اختيار من متعدد) تلقائياً
        </Button>
      </div>

      {/* 3. Voting Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span>🗳</span> إنشاء تصويت جديد
        </h2>
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سؤال التصويت</label>
            <input 
              type="text" 
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#35D07F] outline-none"
              placeholder="مثال: من سيفوز بجائزة أفضل لاعب؟"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الخيار الأول</label>
              <input 
                type="text" 
                value={pollOption1}
                onChange={(e) => setPollOption1(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                placeholder="الخيار 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الخيار الثاني</label>
              <input 
                type="text" 
                value={pollOption2}
                onChange={(e) => setPollOption2(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                placeholder="الخيار 2"
              />
            </div>
          </div>
          <Button type="submit" disabled={!pollQuestion} className="w-full">نشر التصويت</Button>
        </form>
      </div>

    </div>
  );
};