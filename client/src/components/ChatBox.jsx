import React, { useState, useEffect } from 'react';
import {
  FiVolume2,
  FiVolumeX,
  FiMessageSquare,
  FiUser,
  FiCopy,
  FiCheck,
  FiThumbsUp,
  FiThumbsDown,
  FiBookmark
} from 'react-icons/fi';
import useSpeech from '../hooks/useSpeech';
import { useLanguage } from '../context/LanguageContext';

const ChatMessage = ({ chat }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('normal'); // 'normal' | 'simple' | 'summary'
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // null | 'like' | 'dislike'
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setActiveTab('normal');
  }, [chat]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      let textToRead = '';
      if (activeTab === 'normal') {
        textToRead = chat.response;
      } else if (activeTab === 'simple') {
        textToRead = chat.simpleResponse || chat.response;
      } else {
        textToRead = chat.bulletSummary && chat.bulletSummary.length > 0
          ? chat.bulletSummary.join('. ')
          : chat.response;
      }
      speak(textToRead, chat.language);
    }
  };

  const handleCopy = () => {
    let textToCopy = '';
    if (activeTab === 'normal') textToCopy = chat.response;
    else if (activeTab === 'simple') textToCopy = chat.simpleResponse || chat.response;
    else textToCopy = chat.bulletSummary ? chat.bulletSummary.join('\n') : chat.response;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAudioVisualizer = () => {
    if (!isSpeaking) return null;
    return (
      <div className="flex items-end gap-[1.5px] h-3.5 ml-1">
        <span className="wave-bar"></span>
        <span className="wave-bar"></span>
        <span className="wave-bar"></span>
        <span className="wave-bar"></span>
      </div>
    );
  };

  const hasSimple = !!chat.simpleResponse;
  const hasSummary = chat.bulletSummary && chat.bulletSummary.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in max-w-3xl mx-auto">
      
      {/* User Bubble (Right Aligned) */}
      <div className="flex gap-3 justify-end items-start max-w-[85%] ml-auto">
        <div className="p-4 rounded-2xl bg-sky-50/70 text-sky-900 text-sm font-semibold shadow-sm rounded-tr-none border border-sky-100">
          {chat.prompt}
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0 text-sm font-bold border border-primary/20">
          <FiUser />
        </div>
      </div>

      {/* AI Bubble (Left Aligned) */}
      <div className="flex gap-3 justify-start items-start max-w-[95%] mr-auto mb-4 w-full">
        {/* Seva Bot Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm animate-float">
          <svg className="w-5.5 h-5.5 fill-current text-primary" viewBox="0 0 24 24">
            <rect x="4" y="6" width="16" height="14" rx="4" />
            <circle cx="9" cy="12" r="1.5" fill="#FFFFFF"/>
            <circle cx="15" cy="12" r="1.5" fill="#FFFFFF"/>
            <line x1="12" y1="6" x2="12" y2="3" stroke="#FF9933" strokeWidth="2"/>
            <circle cx="12" cy="2" r="1.5" fill="#FF9933"/>
            <path d="M10 16c0 0 1 1.5 2 1.5s2-1.5 2-1.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Response Card Container */}
        <div className="flex-1 bg-white border border-sky-100 rounded-3xl shadow-sm overflow-hidden rounded-tl-none transition-all duration-300">
          
          {/* Controls & Speech Tabs */}
          <div className="flex justify-between items-center border-b border-sky-100/50 px-4 py-2 bg-sky-50/30 flex-wrap gap-2">
            <div className="flex bg-sky-50 p-0.5 rounded-lg border border-sky-100/70">
              <button
                onClick={() => { setActiveTab('normal'); stopSpeaking(); }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'normal'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.normalView}
              </button>

              {hasSimple && (
                <button
                  onClick={() => { setActiveTab('simple'); stopSpeaking(); }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'simple'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.simpleView}
                </button>
              )}

              {hasSummary && (
                <button
                  onClick={() => { setActiveTab('summary'); stopSpeaking(); }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'summary'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.summaryView}
                </button>
              )}
            </div>

            {/* Read Aloud Trigger */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isSpeaking ? (
                <>
                  <FiVolumeX className="w-3.5 h-3.5" />
                  <span>{t.stopSpeaking}</span>
                  {renderAudioVisualizer()}
                </>
              ) : (
                <>
                  <FiVolume2 className="w-3.5 h-3.5" />
                  <span>{t.listen}</span>
                </>
              )}
            </button>
          </div>

          {/* Response Text content */}
          <div className="p-5 text-sm text-slate-800 leading-relaxed text-left">
            {activeTab === 'normal' && (
              <div className="whitespace-pre-line prose max-w-none text-slate-800 font-semibold">
                {chat.response.split('\n').map((paragraph, index) => {
                  return (
                    <p key={index} className="mb-2">
                      {paragraph.split(/(\[.*?\]\(.*?\))/g).map((part, pIdx) => {
                        const match = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (match) {
                          return (
                            <a
                              key={pIdx}
                              href={match[2]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-extrabold hover:underline inline-flex items-center gap-0.5"
                            >
                              {match[1]} ↗
                            </a>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            )}

            {activeTab === 'simple' && (
              <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl">
                <p className="whitespace-pre-line text-slate-700 font-semibold leading-relaxed">
                  {chat.simpleResponse}
                </p>
              </div>
            )}

            {activeTab === 'summary' && (
              <ul className="space-y-2">
                {chat.bulletSummary.map((bullet, index) => (
                  <li key={index} className="flex gap-2.5 items-start">
                    <span className="mt-1 flex-shrink-0 w-4.5 h-4.5 rounded-full bg-green-500/10 text-success flex items-center justify-center text-[10px] font-bold">
                      ✔
                    </span>
                    <span className="font-semibold text-slate-750">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Verified Trust Disclaimer Banner */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-wrap gap-2">
              <span className="text-primary">✔ AI Generated</span>
              <span>Based on Government Information</span>
              <span className="text-accent">Verify before submission</span>
            </div>
          </div>

          {/* Card action controls */}
          <div className="flex gap-2 px-5 py-2.5 border-t border-sky-100/60 bg-sky-50/20">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-sky-100/50 transition-all cursor-pointer"
              title="Copy answer text"
            >
              {copied ? <FiCheck className="text-success w-4.5 h-4.5" /> : <FiCopy className="w-4.5 h-4.5" />}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                saved ? 'text-primary' : 'text-slate-400 hover:text-slate-600 hover:bg-sky-100/50'
              }`}
              title="Save conversation"
            >
              <FiBookmark className={`w-4.5 h-4.5 ${saved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setLiked(liked === 'like' ? null : 'like')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                liked === 'like' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-slate-600 hover:bg-sky-100/50'
              }`}
              title="Thumbs Up"
            >
              <FiThumbsUp className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => setLiked(liked === 'dislike' ? null : 'dislike')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                liked === 'dislike' ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-slate-600 hover:bg-sky-100/50'
              }`}
              title="Thumbs Down"
            >
              <FiThumbsDown className="w-4.5 h-4.5" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const ChatBox = ({ chats, isTyping, chatEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col min-h-[300px]">
      {chats.length === 0 && !isTyping ? (
        <div className="flex flex-col items-center justify-center text-center p-8 mt-4 text-slate-400 gap-4 max-w-md mx-auto">
          {/* Seva Bot Welcome Illustration */}
          <div className="w-24 h-24 relative animate-float">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="#EAF8EC" />
              <rect x="30" y="38" width="40" height="34" rx="10" fill="#FFFFFF" stroke="#138808" strokeWidth="3" />
              <circle cx="42" cy="52" r="3.5" fill="#138808" />
              <circle cx="58" cy="52" r="3.5" fill="#138808" />
              <path d="M45 62c0 0 2.5 3 5 3s5-3 5-3" stroke="#FF9933" strokeWidth="2" strokeLinecap="round" />
              <line x1="50" y1="38" x2="50" y2="24" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="20" r="4.5" fill="#FF9933" />
            </svg>
          </div>
          <p className="font-extrabold text-slate-800 text-lg">Talk with Seva Setu AI</p>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Ask any citizen queries like passport guides, document checklists, and schemes advice. Speak naturally in English, हिंदी, or मराठी.
          </p>
        </div>
      ) : (
        chats.map((chat, index) => (
          <ChatMessage key={chat._id || index} chat={chat} />
        ))
      )}

      {/* Typing indicator at the bottom */}
      {isTyping && (
        <div className="flex gap-3 justify-start items-start max-w-[80%] mr-auto animate-pulse max-w-3xl w-full mx-auto">
          <div className="w-9 h-9 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-5.5 h-5.5 fill-current text-primary" viewBox="0 0 24 24">
              <rect x="4" y="6" width="16" height="14" rx="4" />
              <circle cx="9" cy="12" r="1.5" fill="#FFFFFF"/>
              <circle cx="15" cy="12" r="1.5" fill="#FFFFFF"/>
              <line x1="12" y1="6" x2="12" y2="3" stroke="#FF9933" strokeWidth="2"/>
              <circle cx="12" cy="2" r="1.5" fill="#FF9933"/>
              <path d="M10 16c0 0 1 1.5 2 1.5s2-1.5 2-1.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm rounded-tl-none flex flex-col gap-2 w-72">
            <div className="shimmer h-4 w-5/6 rounded"></div>
            <div className="shimmer h-3.5 w-full rounded"></div>
            <div className="shimmer h-3.5 w-4/5 rounded"></div>
          </div>
        </div>
      )}

      {/* Bottom Scroll Anchor inside the scrollable container */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;
export { ChatMessage };
