import React from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const VoiceButton = ({
  isListening,
  onClick,
  disabled = false,
  size = 'large'
}) => {
  const { t } = useLanguage();

  const buttonSize = size === 'large'
    ? 'w-24 h-24 text-3xl'
    : 'w-16 h-16 text-xl';

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Pulsing ring animation while recording */}
        {isListening && (
          <>
            <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping opacity-75"></span>
            <span className="absolute -inset-4 rounded-full bg-red-500/20 animate-pulse-slow"></span>
          </>
        )}
        
        <button
          onClick={onClick}
          disabled={disabled}
          className={`relative z-10 flex items-center justify-center rounded-full text-white shadow-xl transition-all active:scale-95 ${buttonSize} ${
            isListening
              ? 'bg-red-500 shadow-red-500/30 scale-105 animate-pulse'
              : 'bg-primary hover:bg-primary-light shadow-primary/20 hover:scale-102 hover:shadow-primary/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isListening ? t.listening : t.micTooltip}
          aria-label={isListening ? t.listening : t.micTooltip}
          aria-pressed={isListening}
        >
          <FiMic className={isListening ? 'animate-bounce' : ''} />
        </button>
      </div>

      {/* Waveform graphic */}
      {isListening ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end h-8">
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
          </div>
          <span className="text-sm font-semibold text-saffron animate-pulse" aria-live="assertive">
            {t.listening}
          </span>
        </div>
      ) : (
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {t.micTooltip}
        </span>
      )}
    </div>
  );
};

export default VoiceButton;
