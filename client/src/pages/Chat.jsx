import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useSpeech from '../hooks/useSpeech';
import ChatBox from '../components/ChatBox';
import api from '../services/api';
import { FiSend, FiPaperclip, FiMic, FiMicOff, FiAlertCircle, FiPlus, FiTrash2, FiVolume2, FiVolumeX } from 'react-icons/fi';

const Chat = () => {
  const { t, language } = useLanguage();
  const {
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    unlock,
    isSupported: speechSupported
  } = useSpeech();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [history, setHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  // Auto-speak toggle: true = AI reads response aloud, false = silent
  const [autoSpeak, setAutoSpeak] = useState(true);

  const chatEndRef = useRef(null);

  // Load chat history once on mount
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to search parameters changing (even when already mounted)
  useEffect(() => {
    const urlQuery = searchParams.get('query');
    if (urlQuery) {
      handleSend(urlQuery);
      // Clear query params so it doesn't run repeatedly
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/chat/history');
      const histData = response.data;
      setHistory(histData);
      setChats(histData.slice().reverse());
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Could not load conversation history.');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, isTyping]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Unlock speech synthesis in the synchronous gesture context
    if (typeof unlock === 'function') {
      unlock();
    }

    setError('');
    setInputText('');
    setIsTyping(true);
    stopSpeaking();

    const tempUserMsg = {
      prompt: query,
      response: '',
      language,
      _id: `temp-${Date.now()}`
    };
    
    setChats(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post('/chat', {
        prompt: query,
        language
      });

      const savedChat = response.data;
      setChats(prev => prev.filter(c => c._id !== tempUserMsg._id).concat(savedChat));
      // Only read aloud if autoSpeak is on
      if (autoSpeak) {
        speak(savedChat.response, savedChat.language);
      }
      // Update history sidebar
      setHistory(prev => [savedChat, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Failed to communicate with AI. Verify connection.');
      setChats(prev => prev.filter(c => c._id !== tempUserMsg._id));
    } finally {
      setIsTyping(false);
    }
  };

  // Mic button: fills input with transcript, does NOT auto-send
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInputText(transcript); // paste into input box only
      });
    }
  };

  const suggestionChips = [
    { text: 'Ration checklist', query: 'What documents do I need for a ration card?' },
    { text: 'Scholarship plans', query: 'Are there any scholarships available for engineering students?' },
    { text: 'PMAY Housing Benefits', query: 'Explain eligibility details for Pradhan Mantri Awas Yojana' },
    { text: 'Caste Certificate steps', query: 'How to apply for a caste certificate in Maharashtra?' }
  ];

  const handleDeleteChat = async (id) => {
    try {
      await api.delete(`/chat/${id}`);
      setHistory(prev => prev.filter(c => c._id !== id));
      setChats(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  const handleNewChat = () => {
    stopSpeaking();
    stopListening();
    setChats([]);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-5.2rem)] max-w-6xl mx-auto relative z-10 animate-fade-in">
      
      {/* Sidebar for Conversations History */}
      <div className="w-60 bg-white border border-sky-100 rounded-3xl p-4 hidden md:flex flex-col gap-4 shadow-sm">
        <button
          onClick={handleNewChat}
          className="w-full py-2.5 bg-primary hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition-all cursor-pointer hover:scale-102"
        >
          <FiPlus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
            Recent Interactions
          </span>
          {history.length > 0 ? (
            history.map((chat) => (
              <div key={chat._id} className="relative group">
                <button
                  onClick={() => setChats([chat])}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50/50 text-xs text-slate-650 truncate block transition-all font-semibold border border-transparent hover:border-sky-100/50 pr-8"
                >
                  📝 {chat.prompt}
                </button>
                <button
                  onClick={() => handleDeleteChat(chat._id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-danger rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete chat"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-400 text-center py-6">No historical records.</div>
          )}
        </div>
      </div>

      {/* Main Chat Assistant Board */}
      <div className="flex-1 flex flex-col bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-md">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3.5 bg-sky-50/20 border-b border-sky-100/65">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center text-primary font-bold text-xs shadow-inner">
              🤖
            </span>
            <div className="text-left">
              <h3 className="font-display font-extrabold text-slate-800 text-sm">
                Seva Setu AI Assistant
              </h3>
              <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider">
                Converse, search, and simplify civic procedures
              </p>
            </div>
          </div>
          {/* Right controls: Speaker toggle + Stop speaking */}
          <div className="flex items-center gap-2">
            {/* Auto-speak toggle */}
            <button
              onClick={() => { setAutoSpeak(v => !v); if (isSpeaking) stopSpeaking(); }}
              title={autoSpeak ? 'AI voice ON – click to mute' : 'AI voice OFF – click to enable'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                autoSpeak
                  ? 'bg-primary-light/60 border-primary/30 text-primary hover:bg-primary-light'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {autoSpeak ? <FiVolume2 className="w-3.5 h-3.5" /> : <FiVolumeX className="w-3.5 h-3.5" />}
              <span>{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
            </button>

            {/* Stop speaking (only visible while speaking) */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 transition-all animate-pulse"
              >
                {t.stopSpeaking}
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-center gap-3 text-sm">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Chats Window */}
        <ChatBox chats={chats} isTyping={isTyping} chatEndRef={chatEndRef} />

        {/* Interactive Bottom Control Console */}
        <div className="p-4 bg-sky-50/40 border-t border-sky-100/50 space-y-4">
          
          {/* Suggestion Chips */}
          {chats.length === 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="px-3.5 py-2 bg-white hover:bg-sky-50 border border-sky-100 text-xs font-bold text-slate-700 rounded-xl transition-all hover:scale-102 cursor-pointer shadow-sm"
                >
                  💡 {chip.text}
                </button>
              ))}
            </div>
          )}

          {/* ChatGPT-style Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="bg-white border-2 border-sky-150 focus-within:border-accent rounded-2xl p-2.5 flex items-center gap-3 shadow-md transition-all"
          >
            {/* Attachment */}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-650 rounded-full hover:bg-sky-50 transition-all cursor-pointer"
              title="Attach document/photo"
              onClick={() => alert('Document upload OCR functionality is a future scope item.')}
            >
              <FiPaperclip className="w-4.5 h-4.5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? '🎙 Listening... speak now' : 'Ask anything about government services...'}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-800 font-bold px-1"
              disabled={isTyping}
            />

            {/* Microphone inside input — pastes speech into box, user presses Send manually */}
            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={isTyping}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse scale-110 shadow-md shadow-red-500/25'
                  : 'text-slate-400 border-transparent hover:bg-sky-50'
              }`}
              title={isListening ? 'Stop listening' : 'Click to speak'}
            >
              {isListening
                ? <FiMicOff className="w-4.5 h-4.5" />
                : <FiMic className="w-4.5 h-4.5" />}
            </button>

            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="p-2 bg-primary hover:bg-emerald-700 text-white rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Prompt"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Chat;
