import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import useSpeech from '../hooks/useSpeech';
import ChatBox from './ChatBox';
import VoiceButton from './VoiceButton';
import api from '../services/api';
import { FiMic, FiX, FiSend } from 'react-icons/fi';

const FloatingAssistant = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const {
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSupported: speechSupported
  } = useSpeech();

  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, isOpen, isTyping]);

  // Don't render if user is not authenticated or is on the main chat page (to avoid double chat UX)
  const locationPath = window.location.pathname;
  if (!user || locationPath === '/chat') return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    setError('');
    setInputText('');
    setIsTyping(true);
    stopSpeaking();

    const tempUserMsg = {
      prompt: query,
      response: '',
      language,
      _id: `temp-float-${Date.now()}`
    };
    
    setChats(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post('/chat', {
        prompt: query,
        language
      });

      setChats(prev => prev.filter(c => c._id !== tempUserMsg._id).concat(response.data));
      speak(response.data.response);
    } catch (err) {
      console.error(err);
      setError('Connection failed.');
      setChats(prev => prev.filter(c => c._id !== tempUserMsg._id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        handleSend(transcript);
      });
    }
  };

  const closeAssistant = () => {
    stopSpeaking();
    stopListening();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-120 bg-white border border-slate-200/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-scale transition-all">
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-bold font-display">Seva Setu Assistant</span>
            </div>
            <button
              onClick={closeAssistant}
              className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <ChatBox chats={chats} isTyping={isTyping} />
            <div ref={chatEndRef} />
          </div>

          {/* Form console */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 items-center">
            <VoiceButton
              isListening={isListening}
              onClick={handleVoiceInput}
              disabled={isTyping || !speechSupported}
              size="small"
            />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex-1 flex gap-1.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                disabled={isListening || isTyping}
              />
              <button
                type="submit"
                disabled={isListening || isTyping || !inputText.trim()}
                className="p-2 bg-primary text-white rounded-xl shadow disabled:opacity-50 cursor-pointer"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-breathe hover:animate-none"
          title="Open AI Assistant"
          aria-label="Open Seva Setu assistant"
        >
          {/* Seva Bot mini head icon */}
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <rect x="4" y="6" width="16" height="14" rx="4" fill="#FFFFFF"/>
            <circle cx="9" cy="12" r="1.5" fill="#138808"/>
            <circle cx="15" cy="12" r="1.5" fill="#138808"/>
            <line x1="12" y1="6" x2="12" y2="3" stroke="#FF9933" strokeWidth="2"/>
            <circle cx="12" cy="2" r="1.5" fill="#FF9933"/>
            <path d="M10 16c0 0 1 1.5 2 1.5s2-1.5 2-1.5" stroke="#138808" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

    </div>
  );
};

export default FloatingAssistant;
