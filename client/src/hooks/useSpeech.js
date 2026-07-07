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

  // Ref to signal mid-playback stop requests
  const stopFlagRef = useRef(false);

  const speak = async (text, langOverride, callback) => {
    if (!synthRef.current) return;

    if (typeof langOverride === 'function') {
      callback = langOverride;
      langOverride = null;
    }

    const speakLang = langOverride || language || 'en';

    // Signal any running speech to stop, then cancel current audio
    stopFlagRef.current = true;
    synthRef.current.cancel();
    await new Promise(r => setTimeout(r, 120)); // wait for cancel to propagate
    stopFlagRef.current = false;

    setIsSpeaking(true);

    // Clean markdown/special chars
    const cleanText = text
      .replace(/#{1,6}\s/g, '')      // headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold
      .replace(/\*(.*?)\*/g, '$1')     // italic
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → label only
      .replace(/^[-•]\s+/gm, '')      // bullet points
      .replace(/\n{2,}/g, '. ')       // double newlines → pause
      .replace(/\n/g, ' ')
      .trim();

    if (!cleanText) {
      setIsSpeaking(false);
      if (callback) callback();
      return;
    }

    // Ensure voices are loaded
    let voices = synthRef.current.getVoices();
    if (voices.length === 0) {
      await new Promise((resolve) => {
        const handler = () => { voices = synthRef.current.getVoices(); resolve(); };
        window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true });
        setTimeout(resolve, 300);
      });
    }

    // Pick best voice for the language
    const getVoice = () => {
      if (speakLang === 'hi') {
        return (
          voices.find(v => v.lang.startsWith('hi') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('hi') && v.name.includes('Microsoft')) ||
          voices.find(v => v.lang.startsWith('hi'))
        );
      } else if (speakLang === 'mr') {
        return (
          voices.find(v => v.lang.startsWith('mr') && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('mr') && v.name.includes('Microsoft')) ||
          voices.find(v => v.lang.startsWith('mr'))
        );
      } else {
        return (
          voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
          voices.find(v => v.lang === 'en-GB' && v.name.includes('Google')) ||
          voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
          voices.find(v => v.lang.startsWith('en-IN')) ||
          voices.find(v => v.lang.startsWith('en'))
        );
      }
    };

    // Split into chunks of ~200 chars at sentence boundaries to avoid Chrome's ~32KB limit
    const chunks = [];
    const sentences = cleanText.split(/(?<=[.!?।])\s+/);
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).length > 200 && current.length > 0) {
        chunks.push(current.trim());
        current = s;
      } else {
        current = current ? current + ' ' + s : s;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    const targetVoice = getVoice();

    // Speak each chunk sequentially using promises
    for (let i = 0; i < chunks.length; i++) {
      if (stopFlagRef.current) break; // user pressed stop

      const chunk = chunks[i];
      await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.volume = 1.0;
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        if (speakLang === 'hi') utterance.lang = 'hi-IN';
        else if (speakLang === 'mr') utterance.lang = 'mr-IN';
        else utterance.lang = 'en-IN';

        if (targetVoice) utterance.voice = targetVoice;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          // 'interrupted' fires when cancelled on purpose — don't retry
          if (e.error !== 'interrupted') {
            console.warn('TTS chunk error:', e.error);
          }
          resolve();
        };

        synthRef.current.speak(utterance);
      });

      // Small natural pause between chunks
      if (!stopFlagRef.current && i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 50));
      }
    }

    setIsSpeaking(false);
    if (!stopFlagRef.current && callback) callback();
  };

  const stopSpeaking = () => {
    stopFlagRef.current = true;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const unlock = () => {
    if (synthRef.current) {
      try {
        const u = new SpeechSynthesisUtterance(' ');
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
