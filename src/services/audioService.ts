import { useEffect, useState, useRef } from 'react';

export function useSpeechRecognition({ onResult, onInterimResult, onSilence, silenceDuration = 5000 }: { onResult: (text: string) => void, onInterimResult?: (text: string) => void, onSilence: () => void, silenceDuration?: number }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const hasSpokenRef = useRef<boolean>(false);
  const callbacksRef = useRef({ onResult, onInterimResult, onSilence });

  // VAD refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const checkIntervalRef = useRef<any>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const vadTriggeredRef = useRef<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    callbacksRef.current = { onResult, onInterimResult, onSilence };
  }, [onResult, onInterimResult, onSilence]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onstart = () => {
       setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = finalTranscript || interimTranscript;
      if (currentText.trim().length > 0) {
         hasSpokenRef.current = true;
         // No longer relying purely on transcription timing
      }

      if (interimTranscript && callbacksRef.current.onInterimResult) {
         callbacksRef.current.onInterimResult(interimTranscript);
      }

      if (finalTranscript) {
         callbacksRef.current.onResult(finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (recognitionRef.current?.shouldBeListening) {
         try { recognition.start(); } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    // init robust VAD with AudioContext
    let dataArray = new Uint8Array(0);
    const initVAD = async () => {
       try {
           const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
           mediaStreamRef.current = stream;
           const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
           const ctx = new AudioContext();
           audioContextRef.current = ctx;
           const analyser = ctx.createAnalyser();
           analyser.fftSize = 512;
           analyser.smoothingTimeConstant = 0.5;
           analyserRef.current = analyser;
           
           const microphone = ctx.createMediaStreamSource(stream);
           microphone.connect(analyser);

           dataArray = new Uint8Array(analyser.frequencyBinCount);
       } catch (e) {
           console.warn("VAD init failed", e);
       }
    };
    initVAD();

    checkIntervalRef.current = setInterval(() => {
       if (!recognitionRef.current?.shouldBeListening || !analyserRef.current) return;
       
       analyserRef.current.getByteFrequencyData(dataArray);
       let sum = 0;
       for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
       }
       const avg = sum / dataArray.length;
       
       // Threshold of 15 for normal speaking
       if (avg > 15) {
          lastSpeechTimeRef.current = Date.now();
          vadTriggeredRef.current = false;
       }
       
       const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
       
       // If quiet for 1.5s after having spoken something
       if (timeSinceLastSpeech > silenceDuration && avg <= 15) {
          if (hasSpokenRef.current && !vadTriggeredRef.current) {
             vadTriggeredRef.current = true;
             callbacksRef.current.onSilence();
          }
       }
    }, 100);

    return () => {
      recognition.stop();
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(()=>{});
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []); // Run only once

  const startListening = () => {
    if (recognitionRef.current) {
       recognitionRef.current.shouldBeListening = true;
       hasSpokenRef.current = false;
       vadTriggeredRef.current = false;
       lastSpeechTimeRef.current = Date.now(); // reset VAD timer
       if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
         audioContextRef.current.resume();
       }
       try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
       recognitionRef.current.shouldBeListening = false;
       recognitionRef.current.stop();
    }
  };

  return { isListening, startListening, stopListening };
}
