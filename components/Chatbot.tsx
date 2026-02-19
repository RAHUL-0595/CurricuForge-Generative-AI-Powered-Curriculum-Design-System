
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface ChatbotProps {
  embedded?: boolean;
}

export const Chatbot: React.FC<ChatbotProps> = ({ embedded = false }) => {
  const [isOpen, setIsOpen] = useState(!embedded);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    // Initializing GoogleGenAI with named parameter as required.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: 'You are CurricuForge Advisor, a professional academic assistant. You provide high-level educational strategy and technical curriculum advice. Be thorough and use deep thinking.',
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    
    if (embedded && messages.length === 0) {
      setMessages([{ role: 'ai', text: 'Welcome to the Architect Strategy Room. How can I assist with your curriculum development today?' }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'ai', text: result.text || '' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Advisor encountered a processing exception.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const ChatContent = (
    <div className={`${embedded ? 'w-full h-[700px]' : 'w-[400px] h-[600px] fixed bottom-28 right-8'} bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-500`}>
      <div className="bg-[#263238] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gradient-header rounded-2xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-robot text-lg"></i>
          </div>
          <div>
            <h4 className="text-white font-extrabold text-sm tracking-tight">System Advisor</h4>
            <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest">Architect Cognition ON</p>
          </div>
        </div>
        {!embedded && (
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-2">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#F9FAFC]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
              m.role === 'user' 
                ? 'bg-[#3F51B5] text-white rounded-br-none shadow-lg' 
                : 'bg-white text-[#263238] border border-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-4 rounded-[1.5rem] border border-slate-200 rounded-bl-none shadow-sm flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100 flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Query architectural advisor..."
          className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm font-semibold text-[#263238] focus:ring-2 focus:ring-[#3F51B5]/20 outline-none placeholder-slate-400"
        />
        <button
          onClick={sendMessage}
          className="bg-[#3F51B5] text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#263238] transition-all shadow-lg glow-button"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );

  if (embedded) return ChatContent;

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex items-center justify-end group">
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="relative flex items-center cursor-pointer transition-all duration-500"
          >
            {/* Design Enhanced "Consult Advisor" Label */}
            <div className="absolute right-16 mr-4 flex flex-col items-end opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-[#263238] text-white px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse"></div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] whitespace-nowrap">Consult Advisor</span>
              </div>
              <div className="w-4 h-4 bg-[#263238] rotate-45 -mt-2 mr-6 border-r border-b border-white/10"></div>
            </div>

            {/* Branded Logo Designer Button */}
            <div className="w-20 h-20 relative flex items-center justify-center p-1.5 bg-white rounded-[2rem] shadow-2xl transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:rotate-6">
              <div className="w-full h-full relative overflow-hidden rounded-[1.6rem] border-2 border-slate-100">
                <div className="absolute inset-0 gradient-header animate-gradient-xy"></div>
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <i className="fas fa-brain-circuit text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"></i>
                </div>
                {/* Decorative Pattern / Design in logo */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              </div>
              {/* External Pulse Ring */}
              <div className="absolute -inset-1 border-4 border-[#00E5FF]/20 rounded-[2.2rem] animate-pulse pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* Close State Button (Visible when chat is open) */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="w-16 h-16 gradient-header text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-4 border-white"
          >
            <i className="fas fa-xmark text-2xl"></i>
          </button>
        )}
      </div>

      {isOpen && ChatContent}
    </>
  );
};
