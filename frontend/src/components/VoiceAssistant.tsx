import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, Edit3, AlertCircle, Volume2, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceAssistantProps {
  onParsedData: (data: {
    materialName?: string;
    quantity?: number;
    unit?: string;
    condition?: string;
    location?: string;
    rawText: string;
  }) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onParsedData }) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow microphone permission in your browser settings.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please try speaking closer to the microphone.');
        } else {
          setErrorMsg(`Voice recognition notice: ${event.error}. You can type directly below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setIsSupported(false);
    }
  }, [language]);

  const toggleListening = () => {
    if (!isSupported) {
      setErrorMsg('Web Speech recognition is not supported in this browser. Please use the text input below.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMsg(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const handleApplyVoice = () => {
    if (!transcript.trim()) return;

    // Smart heuristic extraction from spoken sentence
    const lower = transcript.toLowerCase();
    let qty: number | undefined;
    let unit: string = 'KG';
    let materialName: string | undefined;
    let condition: string = 'Recyclable';

    // Extract quantity (e.g., "850 kg" or "10 mt" or numbers)
    const qtyMatch = lower.match(/(\d+[\d,.]*)\s*(kg|kilos|கிலோ|ton|tons|டன்|mt)?/i);
    if (qtyMatch) {
      const numStr = qtyMatch[1].replace(/,/g, '');
      qty = parseFloat(numStr);
      if (qtyMatch[2] && (qtyMatch[2].includes('ton') || qtyMatch[2].includes('டன்') || qtyMatch[2].includes('mt'))) {
        unit = 'MT';
      }
    }

    // Material detection
    if (lower.includes('copper') || lower.includes('காப்பர்') || lower.includes('செம்பு')) {
      materialName = 'Copper Wire Scrap';
    } else if (lower.includes('aluminium') || lower.includes('அலுமினியம்')) {
      materialName = 'Aluminium Scrap Offcuts';
    } else if (lower.includes('steel') || lower.includes('எஃகு') || lower.includes('இரும்பு')) {
      materialName = 'Heavy Melting Steel Scrap';
    } else if (lower.includes('motor') || lower.includes('மோட்டார்')) {
      materialName = 'Reusable Induction Motors';
      condition = 'Reusable';
    } else if (lower.includes('pcb') || lower.includes('electronic') || lower.includes('மின்னணு')) {
      materialName = 'Industrial Electronic Scrap';
    }

    onParsedData({
      materialName,
      quantity: qty,
      unit,
      condition,
      rawText: transcript,
    });
  };

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-[#20A486] text-white animate-pulse ring-4 ring-[#20A486]/30'
                : 'bg-[#20A486]/10 text-[#20A486]'
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18324B]">{t('voiceInput')}</h4>
            <span className="text-[11px] text-[#64748B]">
              {language === 'ta' ? 'தமிழ் பேச்சு அடையாளம் (Tamil Speech)' : 'English Voice Dictation'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleListening}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isListening
              ? 'bg-[#B91C1C] text-white'
              : 'bg-[#20A486] hover:bg-[#17856C] text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" />
              <span>Start Speaking</span>
            </>
          )}
        </button>
      </div>

      {/* Spoken content display with edit option */}
      <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] my-2">
        {isListening ? (
          <div className="flex items-center gap-2 text-xs text-[#20A486] font-medium py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20A486] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20A486]"></span>
            </span>
            <span>{t('voiceListening')}</span>
          </div>
        ) : isEditing ? (
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full text-xs text-[#1E293B] bg-white border border-[#CBD5E1] rounded p-2 outline-none focus:border-[#20A486]"
            rows={2}
          />
        ) : (
          <p className="text-xs text-[#1E293B] italic">
            {transcript
              ? `“${transcript}”`
              : '“என்னிடம் 850 கிலோ காப்பர் வயர் ஸ்கிராப் உள்ளது” or “I have 850 kg copper scrap for disposal”'}
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-1.5 text-xs text-[#B45309] bg-[#FEF3C7] p-2 rounded-lg border border-[#FDE68A] mb-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-[#64748B] hover:text-[#18324B] flex items-center gap-1 font-medium"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Done Editing' : 'Edit Text Manually'}</span>
        </button>

        {transcript && (
          <button
            type="button"
            onClick={handleApplyVoice}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#18324B] hover:bg-[#243B53] text-white transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-[#20A486]" />
            <span>{t('useVoiceData')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
