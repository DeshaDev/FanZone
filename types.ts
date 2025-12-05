export enum InteractionType {
  REGISTER = 'REGISTER',
  VOTE = 'VOTE',
  ANSWER = 'ANSWER',
  PREDICTION = 'PREDICTION',
  CHECK_IN = 'CHECK_IN'
}

export interface Transaction {
  hash: string;
  from: string;
  type: InteractionType;
  details: string;
  timestamp: number;
  blockNumber: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface DailyQuestion {
  id: string;
  text: string;
  options: string[]; // New: Multiple choice options
  correctAnswerIndex: number; // New: Index of correct option (0-3)
}

export interface MatchFixture {
  id: string;
  teamA: string;
  teamB: string;
  date: string; // ISO String (Full date/time)
}

export interface AppState {
  polls: Poll[];
  dailyQuestions: DailyQuestion[];
  matches: MatchFixture[];
  transactions: Transaction[];
  walletAddress: string | null;
  username: string | null;
  balance: string;
  userPoints: number;
  lastCheckIn: number; // Timestamp of last check-in
  
  // Tracking User Actions
  userVotes: Record<string, string>;
  userAnswers: Record<string, number>; // Store index of answer
  userPredictions: Record<string, string>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}