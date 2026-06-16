import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, User, RefreshCw, CreditCard, MapPin, Minimize2 } from "lucide-react";
import { fetchWithAuth } from "../data";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  currentUser: any;
  onTriggerNotification: (msg: string, type?: "info" | "success" | "alert") => void;
}

export default function AIChatbot({ currentUser, onTriggerNotification }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: currentUser 
        ? `Hello **${currentUser.fullName}**! 🌿 I am **EcoBot**, your digital EcoTrade assistant. I can help you link your real-time **bank account details**, explain how to watch **live driver GPS tracking**, or detail our **reward multipliers**. Ask me anything!`
        : "Hello! I am **EcoBot**, your live EcoTrade AI mentor. 🌿 Sign in or ask me anything about recycling payouts, verified bank account setup, or live driver GPS route telemetry!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build session context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      chatHistory.push({ role: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("ecotrade_token") ? `Bearer ${localStorage.getItem("ecotrade_token")}` : ""
        },
        body: JSON.stringify({
          messages: chatHistory,
          userContext: currentUser ? {
            fullName: currentUser.fullName,
            role: currentUser.role,
            walletBalance: currentUser.walletBalance,
            rewardPoints: currentUser.rewardPoints,
            address: currentUser.address
          } : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: "model",
        content: data.text,
        timestamp: new Date()
      }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "model",
        content: "⚠️ *EcoBot is currently undergoing system maintenance, but don't worry! Standard operations are still functional. Please ensure your internet link is stable.*",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: `Chat session refreshed. How can I help you support sustainable recycling today?`,
        timestamp: new Date()
      }
    ]);
    onTriggerNotification("EcoBot conversation log cleared.", "info");
  };

  const PRESET_QUESTIONS = [
    { text: "How do I register my bank details?", icon: <CreditCard className="h-3 w-3" /> },
    { text: "Where do I track my active pickup GPS?", icon: <MapPin className="h-3 w-3" /> },
    { text: "What are the E-Waste and Metal payout rates?", icon: <Sparkles className="h-3 w-3 text-emerald-500" /> }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat container window */}
      {isOpen && (
        <div className="w-96 h-[520px] bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-emerald-950/40 shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in">
          {/* Header - Midnight Rainforest Glassy Gradient */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-brand-950 text-white p-4.5 flex items-center justify-between border-b border-emerald-800/40 relative overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-9.5 w-9.5 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                <Bot className="h-5.5 w-5.5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-[13px] tracking-tight flex items-center gap-1.5">
                  EcoBot Assistant
                  <Sparkles className="h-3 w-3 text-emerald-300 animate-pulse" />
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-[9.5px] text-emerald-200 font-bold uppercase tracking-widest">Active Eco-Agent</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 relative z-10">
              <button 
                onClick={clearChat}
                title="Reset Conversation"
                className="p-1.5 text-emerald-205 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages stream with organic bg pattern */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-950/40 dark:to-slate-950/10 text-xs custom-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                {m.role === "model" && (
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950/55 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/40 dark:border-emerald-900/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl max-w-[78%] leading-relaxed shadow-sm font-medium ${
                    m.role === "user" 
                      ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-sm" 
                      : "bg-slate-100/90 dark:bg-slate-800 text-slate-900 dark:text-slate-105 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line text-[11.5px] tracking-wide font-medium">{m.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <div className="h-7 w-7 rounded-full bg-emerald-150 dark:bg-emerald-950/50 text-emerald-805 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/40">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-850 rounded-2xl text-emerald-800 dark:text-emerald-305 font-bold border border-emerald-205/10 dark:border-emerald-900/10 flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-1.5 w-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Queries Presets Area - Stylish Emerald Tags */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-t border-emerald-100/40 dark:bg-slate-950/50 dark:border-emerald-950/30 select-none flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(pq.text)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-emerald-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 hover:border-emerald-500 text-[10px] text-slate-800 dark:text-slate-205 font-bold rounded-full cursor-pointer transition-all shrink-0 shadow-sm hover:scale-[1.02]"
              >
                <span className="text-emerald-600 dark:text-emerald-400">{pq.icon}</span>
                <span>{pq.text}</span>
              </button>
            ))}
          </div>

          {/* Input field with Focused Forest Highlight */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3.5 bg-white dark:bg-slate-900 border-t border-emerald-100/40 dark:border-emerald-950/30 flex gap-2 relative z-10"
          >
            <input
              type="text"
              placeholder="Ask EcoBot anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-[38px] w-[38px] bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:from-slate-150 disabled:to-slate-200 disabled:text-slate-400 dark:disabled:from-slate-850 dark:disabled:to-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/10 transition-all cursor-pointer hover:scale-105 active:scale-95 duration-150"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Messenger bubble with dual-ring neon pulse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-5 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all text-xs font-black cursor-pointer group"
      >
        {isOpen ? (
          <>
            <Minimize2 className="h-4.5 w-4.5 animate-pulse" />
            <span className="uppercase tracking-wider">Close EcoBot</span>
          </>
        ) : (
          <>
            <Bot className="h-4.5 w-4.5 animate-bounce group-hover:rotate-12 transition-all" />
            <span className="uppercase tracking-wider">Chat with EcoBot</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
