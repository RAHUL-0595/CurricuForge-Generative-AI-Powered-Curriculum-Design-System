
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: 'You are an academic advisor for CurricuForge. Help users with curriculum design questions.',
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
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
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all z-50 group"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-alt'} text-xl group-hover:scale-110 transition-transform`}></i>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-brain text-xs"></i>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Forge Advisor</h4>
              <p className="text-[10px] text-slate-400">Gemini 3 Pro Intelligence</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">Ask me anything about curriculum design or academic trends!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 rounded-bl-none shadow-sm flex gap-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
