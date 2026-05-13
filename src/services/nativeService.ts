import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export const isNative = () => Capacitor.isNativePlatform();

export const requestSpeechPermissions = async () => {
  if (!isNative()) return true;
  const status = await SpeechRecognition.requestPermissions();
  return status.speechRecognition === 'granted';
};

export const startSpeechToText = async (onResult: (text: string) => void) => {
  if (!isNative()) {
    // Fallback to Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    recognition.start();
    return () => recognition.stop();
  }

  // Native Capacitor Plugin
  const isAvailable = await SpeechRecognition.available();
  if (!isAvailable) return;

  SpeechRecognition.addListener('partialResults', (data: any) => {
    if (data.matches && data.matches.length > 0) {
      onResult(data.matches[0]);
    }
  });

  await SpeechRecognition.start({
    language: 'zh-CN',
    partialResults: true,
    popup: false,
  });

  return async () => {
    await SpeechRecognition.stop();
    SpeechRecognition.removeAllListeners();
  };
};

export const requestCameraPermissions = async () => {
  if (!isNative()) return true;
  // Capacitor Camera permissions would go here
  // For now we assume standard WebView handling
  return true;
};
