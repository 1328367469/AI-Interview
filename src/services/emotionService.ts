import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

export function useEmotionAnalyzer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string>('Neutral');
  const [stressLevel, setStressLevel] = useState<number>(10);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (e) {
        console.warn('Could not load face-api models:', e);
      }
    }
    loadModels();

    return () => clearInterval(intervalRef.current);
  }, []);

  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(true);

  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    const analyze = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const detections = await faceapi.detectSingleFace(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceExpressions();

          if (detections) {
            setIsFaceDetected(true);
            const expressions = detections.expressions;

            // Map expressions to stress and states
            // face-api returns objects like { neutral: 0.8, happy: 0.1, angry: 0.05, ... }
            let maxEmotion = 'neutral';
            let maxValue = 0;
            
            for (const [emotion, value] of Object.entries(expressions)) {
               if (value > maxValue) {
                 maxValue = value;
                 maxEmotion = emotion;
               }
            }

            // Estimate stress
            // Angry, sad, fearful, disgusted increase stress
            let stress = 10;
            stress += (expressions.angry || 0) * 40;
            stress += (expressions.fearful || 0) * 50;
            stress += (expressions.sad || 0) * 30;
            stress += (expressions.disgusted || 0) * 20;
            
            // Happy, neutral decrease stress
            stress -= (expressions.happy || 0) * 20;

            setStressLevel(Math.min(100, Math.max(0, stressLevel * 0.7 + stress * 0.3))); // Smooth transition
            
            const emotionMapping: Record<string, string> = {
              neutral: 'Stable / 稳定',
              happy: 'Confident / 自信',
              sad: 'Anxious / 焦虑',
              angry: 'Tense / 紧张',
              fearful: 'Stressed / 极度抗压',
              disgusted: 'Uncomfortable / 不适',
              surprised: 'Surprised / 惊讶'
            };

            setCurrentEmotion(emotionMapping[maxEmotion] || 'Stable / 稳定');
          } else {
             setIsFaceDetected(false);
          }
        } catch (e) {
          // Ignore canvas read errors if tab is inactive
        }
      }
    };

    intervalRef.current = setInterval(analyze, 1000); // 1 FPS to save battery

    return () => clearInterval(intervalRef.current);
  }, [isModelLoaded, videoRef]);

  return { isModelLoaded, currentEmotion, stressLevel, isFaceDetected };
}
