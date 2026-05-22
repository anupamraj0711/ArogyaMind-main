import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import api from '../api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am your HealthCare AI Assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: userMsg.text, 
        history: messages 
      });

      setMessages([...currentMessages, { id: Date.now() + 1, sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages([...currentMessages, { id: Date.now() + 1, sender: 'bot', text: 'Sorry, network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#1A6FB5] text-white p-4 rounded-full shadow-lg hover:bg-[#135A94] transition-all transform hover:scale-105 z-50 flex items-center justify-center"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-[#E2E8F0] overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-[#1A6FB5] text-white p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-2">
              <Bot size={22} />
              <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 hover:bg-white/10 p-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F4F7FB] space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#00C896] text-white' : 'bg-[#1A6FB5] text-white'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-[#00C896] text-white rounded-tr-none shadow-sm' 
                    : 'bg-white text-[#1C2B3A] rounded-tl-none shadow-sm border border-[#E2E8F0]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#1A6FB5] text-white flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl text-sm bg-white text-[#1C2B3A] rounded-tl-none shadow-sm border border-[#E2E8F0] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[#1A6FB5]" />
                  <span className="text-gray-500">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-[#E2E8F0]">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-[#E2E8F0] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A6FB5] focus:border-transparent text-sm transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-[#1A6FB5] text-white p-2 rounded-full hover:bg-[#135A94] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10 shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
