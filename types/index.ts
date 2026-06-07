export type AppPhase = 'input' | 'scenario' | 'chat' | 'score';

export interface CompanyInfo {
  companyName: string;
  industry: string;
  businessDescription: string;
  employeeSize: string;
  challenges: string;
  proposedService: string;
  salesPhase: string;
  contactRole: string;
}

export interface Scenario {
  customerName: string;
  customerRole: string;
  situation: string;
  objectives: string[];
  keyPoints: string[];
  openingLine: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ScoreResult {
  totalScore: number;
  hearingScore: number;
  problemClarificationScore: number;
  proposalScore: number;
  objectionHandlingScore: number;
  nextActionScore: number;
  goodPoints: string[];
  improvements: string[];
  nextPhraseTip: string;
  source?: 'gemini' | 'mock';
}
