import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, AlertTriangle, Truck, Map, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // assuming AuthContext exists based on typical structure

const API = 'http://127.0.0.1:8000';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'D.R.I.S.H.T.I AI initialized. How can I assist you with the current disaster intelligence?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Build authConfig the same way App.jsx does
      const token = localStorage.getItem('drishti_auth_token') || 
                    localStorage.getItem('access_token') || 
                    localStorage.getItem('token');
      
      const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.post(`${API}/chat`, { message: userMessage }, authConfig);
      
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Connection error. Unable to reach D.R.I.S.H.T.I AI backend.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    { icon: <AlertTriangle size={14} />, text: 'Emergency Summary' },
    { icon: <Zap size={14} />, text: 'Critical Hazards' },
    { icon: <Truck size={14} />, text: 'Vehicle Status' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-[#0b0f19] border border-[#0284c7]/40 rounded-xl shadow-2xl shadow-[#0284c7]/20 overflow-hidden backdrop-blur-sm transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0f172a] to-[#0284c7]/20 border-b border-[#0284c7]/30">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot size={20} className="text-[#00f3ff]" />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0b0f19]"></span>
              </div>
              <h3 className="font-bold text-sm tracking-wider text-white">D.R.I.S.H.T.I AI</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#0284c7]/50 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#0284c7] text-white rounded-br-none shadow-lg' 
                    : msg.isError 
                      ? 'bg-red-900/50 text-red-200 border border-red-500/30 rounded-bl-none'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-bl-none shadow-md'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-slate-700 rounded-lg rounded-bl-none p-3 flex items-center gap-2">
                  <Loader2 size={16} className="text-[#00f3ff] animate-spin" />
                  <span className="text-xs text-slate-400">Processing intelligence...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts (Only show if few messages) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 py-2 flex flex-wrap gap-2 border-t border-slate-800/50 bg-slate-900/50">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-[#0284c7]/30 border border-slate-700 hover:border-[#0284c7]/50 rounded-full text-xs text-slate-300 transition-colors"
                >
                  <span className="text-[#00f3ff]">{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-[#0f172a] border-t border-[#0284c7]/30">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about active hazards or vehicles..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#00f3ff] text-white text-sm rounded-lg pl-3 pr-10 py-2.5 outline-none transition-colors placeholder:text-slate-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 bg-[#0284c7] hover:bg-[#00f3ff] hover:text-[#0b0f19] text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#0284c7] to-[#0f172a] border-2 border-[#00f3ff]/50 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:scale-105 transition-all duration-300"
        >
          <Bot size={24} className="text-white" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0b0f19] rounded-full animate-pulse"></span>
          
          {/* Tooltip */}
          <span className="absolute right-16 px-3 py-1.5 bg-[#0b0f19] border border-[#0284c7]/50 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            D.R.I.S.H.T.I AI
          </span>
        </button>
      )}
    </div>
  );
};

export default AIChat;
