
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { askPhysicsAI } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await askPhysicsAI(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response || 'No response from AI.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-[rgb(var(--primary))] rounded-xl transition-colors duration-500">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">Physics AI Consultant</h3>
          <p className="text-xs text-slate-400 font-medium">Powered by Gemini 3 Pro</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <Sparkles size={48} className="text-[rgb(var(--primary))] transition-colors duration-500" />
            <div>
              <p className="text-white font-medium">Ask me anything about Physics!</p>
              <p className="text-sm text-slate-400">"Calculate the pressure drop in a 20m pipe..."</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                msg.role === 'user' ? 'bg-[rgb(var(--primary))]' : 'bg-slate-700'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed transition-all duration-500 ${
                msg.role === 'user' 
                  ? 'bg-[rgb(var(--primary))] text-white shadow-lg shadow-[rgb(var(--primary)/0.1)]' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Loader2 size={16} className="text-[rgb(var(--primary))] animate-spin transition-colors duration-500" />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center gap-2">
                <span className="text-slate-400 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your fluid dynamics problem..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-[rgb(var(--primary))] hover:brightness-110 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg shadow-[rgb(var(--primary)/0.2)] active:scale-95 duration-500"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
