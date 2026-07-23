import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! Welcome to Vertex Trading. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Thanks for reaching out! Our agents are currently busy, but please leave your email and we will get back to you shortly. You can also explore our academy for common queries.' 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:scale-105 transition-all z-50 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[#0a0c10] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Vertex Support</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-emerald-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-[#050608]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white/10 text-gray-200 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-[#0a0c10] shrink-0">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1 pr-2 focus-within:border-emerald-500/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white px-3 py-2 placeholder-gray-500"
              />
              <button 
                onClick={handleSend}
                className="w-8 h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
