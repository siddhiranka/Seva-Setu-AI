import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useSpeech = () => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize SpeechSynthesis reference and load voices early
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Update Speech Recognition when language changes
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      if (language === 'hi') {
        rec.lang = 'hi-IN';
      } else if (language === 'mr') {
        rec.lang = 'mr-IN';
      } else {
        rec.lang = 'en-IN';
      }

      recognitionRef.current = rec;
    }
  }, [language]);

  const startListening = (onResultCallback) => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    
    setError(null);
    setIsListening(true);

    // Stop speaking when user wants to talk
    stopSpeaking();

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResultCallback) {
        onResultCallback(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
      setIsListening(false);
    }
  };

  const speak = async (text, langOverride, callback) => {
    if (!synthRef.current) return;

    if (typeof langOverride === 'function') {
      callback = langOverride;
      langOverride = null;
    }

    const speakLang = langOverride || language || 'en';

    synthRef.current.cancel(); // cancel any active speaking
    setIsSpeaking(true);

    // Filter markdown symbols out
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/-\s+/g, '')
      .trim();

    // Split text into sentences cleanly
    const sentences = cleanText
      .split(/[.!?।\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) {
      setIsSpeaking(false);
      if (callback) callback();
      return;
    }

    // Ensure voices are loaded
    let voices = synthRef.current.getVoices();
    if (voices.length === 0) {
      await new Promise((resolve) => {
        const handler = () => {
          voices = synthRef.current.getVoices();
          resolve();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true });
        setTimeout(resolve, 200); // 200ms fallback timeout
      });
    }

    let currentIdx = 0;

    const speakSentence = () => {
      // Check if user stopped it in the meantime
      if (!synthRef.current || !window.speechSynthesis.speaking && currentIdx > 0) {
        setIsSpeaking(false);
        return;
      }

      if (currentIdx >= sentences.length) {
        setIsSpeaking(false);
        if (callback) callback();
        return;
      }

      const sentenceText = sentences[currentIdx];
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      
      // Explicitly configure volume, pitch, and rate for natural voice output
      utterance.volume = 1.0; 
      utterance.rate = 0.95; 
      utterance.pitch = 1.0;
      
      if (speakLang === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (speakLang === 'mr') {
        utterance.lang = 'mr-IN';
      } else {
        utterance.lang = 'en-IN';
      }

      // Try setting a high quality language specific voice
      let targetVoice = null;
      if (speakLang === 'hi') {
        targetVoice = voices.find(v => v.lang.startsWith('hi') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')));
        if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('hi'));
      } else if (speakLang === 'mr') {
        targetVoice = voices.find(v => v.lang.startsWith('mr') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')));
        if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('mr'));
      } else {
        targetVoice = voices.find(v => (v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US')) && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural')));
        if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith('en'));
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onend = () => {
        currentIdx++;
        // Small delay between sentences for natural flow
        setTimeout(speakSentence, 60);
      };

      utterance.onerror = (err) => {
        console.error('Speech synthesis sentence error:', err);
        currentIdx++;
        setTimeout(speakSentence, 60);
      };

      synthRef.current.speak(utterance);
    };

    // Small delay to bypass Chromium cancel-speak race conditions
    setTimeout(() => {
      speakSentence();
    }, 80);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const unlock = () => {
    if (synthRef.current) {
      try {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        u.rate = 1;
        synthRef.current.speak(u);
      } catch (e) {
        console.warn('SpeechSynthesis unlock failed:', e);
      }
    }
  };

  return {
    isListening,
    isSpeaking,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    unlock,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  };
};
export default useSpeech;
