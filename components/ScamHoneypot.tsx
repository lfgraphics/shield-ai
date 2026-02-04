
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { ScamMessage, ExtractedIntelligence, FinalResultPayload } from '../types';

const ScamHoneypot: React.FC = () => {
  const [messages, setMessages] = useState<ScamMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [intelligence, setIntelligence] = useState<ExtractedIntelligence>({
    bankAccounts: [],
    upiIds: [],
    phishingLinks: [],
    phoneNumbers: [],
    suspiciousKeywords: []
  });
  const [isFinished, setIsFinished] = useState(false);
  const [sessionId] = useState(`session-${Math.random().toString(36).substr(2, 9)}`);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isFinished) return;

    const scammerMessage: ScamMessage = {
      sender: 'scammer',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, scammerMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/honeypot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk_guvi_evaluation_2026'
        },
        body: JSON.stringify({
          sessionId,
          message: { text: scammerMessage.text },
          conversationHistory: messages,
          metadata: { language: 'English' }
        })
      });

      const result = await response.json();
      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setIsTyping(false);

      const agentMessage: ScamMessage = {
        sender: 'user',
        text: result.reply,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, agentMessage]);

      // Merge Intelligence and Deduplicate
      setIntelligence(prev => ({
        bankAccounts: Array.from(new Set([...prev.bankAccounts, ...(result.extracted?.bankAccounts || [])])),
        upiIds: Array.from(new Set([...prev.upiIds, ...(result.extracted?.upiIds || [])])),
        phishingLinks: Array.from(new Set([...prev.phishingLinks, ...(result.extracted?.phishingLinks || [])])),
        phoneNumbers: Array.from(new Set([...prev.phoneNumbers, ...(result.extracted?.phoneNumbers || [])])),
        suspiciousKeywords: Array.from(new Set([...prev.suspiciousKeywords, ...(result.extracted?.suspiciousKeywords || [])])),
      }));

      if (result.isFinished) {
        setIsFinished(true);
        // Automatically trigger final report if extraction is complete
        submitFinalReport();
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const submitFinalReport = async () => {
    if (isReporting) return;
    setIsReporting(true);

    const payload: FinalResultPayload = {
      sessionId,
      scamDetected: intelligence.suspiciousKeywords.length > 0 || intelligence.phishingLinks.length > 0,
      totalMessagesExchanged: messages.length,
      extractedIntelligence: intelligence,
      agentNotes: `Automated honey-pot analysis complete. Identified ${intelligence.suspiciousKeywords.length} suspicious patterns. Scammer utilized urgency tactics.`
    };

    try {
      // MANDATORY CALLBACK TO GUVI EVALUATION ENDPOINT
      const response = await fetch("https://hackathon.guvi.in/api/updateHoneyPotFinalResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sk_submission_live_shield_ai" // Placeholder for actual submission key
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Success: Final Intelligence Report submitted to GUVI Evaluation Endpoint.");
      } else {
        console.warn("Callback failed (Expected if not in production hackathon env):", await response.text());
        alert("Report ready. (Check console for payload if external callback is restricted in preview)");
      }
      console.log("SUBMISSION PAYLOAD:", payload);
      setIsFinished(true);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission Error: Check network connection to hackathon.guvi.in");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[700px] animate-in fade-in duration-700">
      {/* Sidebar - Intelligence Dashboard */}
      <div className="lg:col-span-1 bg-slate-900/80 rounded-2xl border border-white/10 p-5 flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-200">Intelligence</h3>
          </div>
          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 font-mono">{sessionId.slice(-4)}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
          <IntelligenceBlock title="Bank Accounts" items={intelligence.bankAccounts} color="text-emerald-400" icon="🏦" />
          <IntelligenceBlock title="UPI IDs" items={intelligence.upiIds} color="text-sky-400" icon="📱" />
          <IntelligenceBlock title="Phishing Links" items={intelligence.phishingLinks} color="text-rose-400" icon="🔗" />
          <IntelligenceBlock title="Phone Numbers" items={intelligence.phoneNumbers} color="text-orange-400" icon="📞" />
          <IntelligenceBlock title="Keywords" items={intelligence.suspiciousKeywords} color="text-amber-400" icon="⚠️" />
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={submitFinalReport}
            disabled={messages.length === 0 || isReporting}
            className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 text-sm ${isReporting
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95'
              }`}
          >
            {isReporting ? (
              <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Submit Final Report</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3 bg-slate-900/50 rounded-2xl border border-white/10 flex flex-col overflow-hidden relative shadow-inner">
        {/* Chat Header */}
        <div className="bg-slate-900/90 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 text-lg">
              👹
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Active Scam Session</p>
              <p className="text-[10px] text-slate-500 uppercase font-medium tracking-tighter">Evaluation Endpoint: hackathon.guvi.in</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Msgs</span>
              <span className="text-xs font-mono text-indigo-400">{messages.length}</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest">
              Monitoring
            </span>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 animate-pulse">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-200">Start the Honey-Pot</h4>
                <p className="max-w-xs text-sm text-slate-500">Paste a suspected scam message below. The agent will autonomously engage and extract intelligence.</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'scammer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xl transition-all ${msg.sender === 'scammer'
                ? 'bg-slate-800 border border-white/5 rounded-tr-none text-slate-100'
                : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tl-none ring-1 ring-white/5'
                }`}>
                <div className="flex items-center space-x-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-widest">
                  <span>{msg.sender === 'scammer' ? '🚨 Scammer' : '🛡️ AI Agent'}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
                <div className="text-[9px] mt-2 opacity-30 text-right font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl px-5 py-3 flex space-x-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[10px] font-bold text-indigo-500/80 uppercase ml-2 tracking-widest">Agent Thinking</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-5 bg-slate-900/90 border-t border-white/10 backdrop-blur-md">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isFinished || isReporting}
              placeholder={isFinished ? "Session Finalized. Submission Complete." : "Enter scammer message (e.g. 'Your bank account is blocked')..."}
              className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isFinished || isReporting}
              className="absolute right-3 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-20 disabled:bg-slate-700 transition-all active:scale-90"
            >
              <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <span className="text-[9px] text-slate-600 font-bold uppercase flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-500 rounded-full"></span>
              Persona: Vulnerable User
            </span>
            <span className="text-[9px] text-slate-600 font-bold uppercase">Intelligence Auto-Extraction Active</span>
          </div>
        </form>
      </div>
    </div>
  );
};

const IntelligenceBlock: React.FC<{ title: string; items: string[]; color: string; icon: string }> = ({ title, items, color, icon }) => (
  <div className="space-y-2 group">
    <div className="flex items-center justify-between">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <span>{icon}</span>
        {title}
      </h4>
      <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-1 rounded">{items.length}</span>
    </div>
    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
      {items.length === 0 ? (
        <span className="text-[10px] text-slate-700 italic font-medium ml-1 opacity-50">Awaiting detection...</span>
      ) : (
        items.map((item, idx) => (
          <span key={idx} className={`px-2 py-1 bg-slate-800/50 border border-white/5 rounded-lg text-[10px] font-medium truncate max-w-full hover:border-white/20 transition-all ${color} animate-in zoom-in-95 duration-300`}>
            {item}
          </span>
        ))
      )}
    </div>
  </div>
);

export default ScamHoneypot;
