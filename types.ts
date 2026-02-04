
export type Language = 'Tamil' | 'English' | 'Hindi' | 'Malayalam' | 'Telugu';

export interface VoiceDetectionRequest {
  language: Language;
  audioFormat: 'mp3';
  audioBase64: string;
}

export interface VoiceDetectionResponse {
  status: 'success' | 'error';
  language: Language;
  classification: 'AI_GENERATED' | 'HUMAN';
  confidenceScore: number;
  explanation: string;
}

export interface ScamMessage {
  sender: 'scammer' | 'user';
  text: string;
  timestamp: number;
}

export interface HoneypotSession {
  sessionId: string;
  message: ScamMessage;
  conversationHistory: ScamMessage[];
  metadata: {
    channel: string;
    language: string;
    locale: string;
  };
}

export interface ExtractedIntelligence {
  bankAccounts: string[];
  upiIds: string[];
  phishingLinks: string[];
  phoneNumbers: string[];
  suspiciousKeywords: string[];
}

export interface FinalResultPayload {
  sessionId: string;
  scamDetected: boolean;
  totalMessagesExchanged: number;
  extractedIntelligence: ExtractedIntelligence;
  agentNotes: string;
}
