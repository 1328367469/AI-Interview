import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Settings2, Hand, Video, VideoOff, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { requestCameraPermissions } from '../services/nativeService';
import { useSpeechRecognition } from '../services/audioService';
import { useEmotionAnalyzer } from '../services/emotionService';
import axios from 'axios';

// Offline replies as requested by user
const OFFLINE_REPLIES = [
  "我明白了。",
  "好的，我了解了。",
  "嗯，清楚了。",
  "好的，感谢你的分享。"
];

const PRELOADED_QUESTIONS = [
  "您好，我是系统虚拟面试官。很高兴今天与您交流。准备好的话，请做一个简单的自我介绍。",
  "我看你上一份工作表现不错，为什么决定离职寻找新的机会呢？",
  "对于接下来的职业发展，你有什么规划吗？",
  "如果你负责的前端项目首屏加载很慢，你会从哪些方面去排查和优化？",
  "针对我们刚才讨论的前端优化，你在实际业务中有遇到过什么特别难解的性能瓶颈吗？"
];

export default function ActiveInterviewView() {
  const { navigate, setInterviewResult, interviewSession, setInterviewSession } = useAppContext() as any;
  
  // App state
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [time, setTime] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Staged Question State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [unfamiliarTech, setUnfamiliarTech] = useState<string[]>([]);
  
  // Script and Context
  const [transcript, setTranscript] = useState("准备启动...");
  const [userBuffer, setUserBuffer] = useState("");
  const [interimText, setInterimText] = useState("");
  const hasInitializedRef = useRef(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hook 1: Emotion Analyzer
  const { isModelLoaded, currentEmotion, stressLevel, isFaceDetected } = useEmotionAnalyzer(videoRef);

  // Anti-cheating detection
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  useEffect(() => {
    let timeout: any;
    if (!isFaceDetected) {
       timeout = setTimeout(() => {
          setCheatWarnings(prev => prev + 1);
          setShowCheatWarning(true);
       }, 2000);
    } else {
       setShowCheatWarning(false);
    }
    return () => clearTimeout(timeout);
  }, [isFaceDetected]);

  // Stats mapped from emotion for UI
  const [biometrics, setBiometrics] = useState({
    confidence: 88,
    eyeContact: 95
  });

  useEffect(() => {
    setBiometrics(prev => ({
      ...prev,
      confidence: Math.min(100, Math.max(0, 100 - stressLevel * 1.5 + (Math.random() * 4 - 2))),
      eyeContact: Math.min(100, Math.max(60, prev.eyeContact + (Math.random() * 10 - 5)))
    }));
  }, [stressLevel]);

  // Hook 2: Continuous Hearing
  const handleUserSilence = async () => {
    if (userBuffer.trim().length === 0 && interimText.trim().length === 0) return;
    if (isAiSpeaking) return;
    
    const finalUserInput = userBuffer + " " + interimText;
    setUserBuffer(""); 
    setInterimText("");
    stopListening(); 
    setTranscript("分析片段命中词...");
    
    const { questions, records } = interviewSession;
    
    let generatedReply = "";
    let isEnding = false;
    let matchRate = 0;
    
    if (currentQuestionIndex === -1) {
        // Just started, the user responded to the opening
        setCurrentQuestionIndex(0);
        generatedReply = "那么第一个问题：" + questions[0].spokenText;
    } else {
        const currentQ = questions[currentQuestionIndex];
        const keywords = currentQ.expectedKeywords || [];
        
        let matchCount = 0;
        if (keywords.length > 0) {
           matchCount = keywords.filter((kw: string) => finalUserInput.toLowerCase().includes(kw.toLowerCase())).length;
           matchRate = matchCount / keywords.length;
        } else {
           matchRate = finalUserInput.length > 20 ? 1 : 0;
        }

        // Add Record
        setInterviewSession((prev: any) => ({
            ...prev,
            records: [...prev.records, {
                question: currentQ.question,
                spokenText: currentQ.spokenText,
                expectedKeywords: keywords,
                userAnswer: finalUserInput,
                matchRate
            }]
        }));

        // Extract unfamiliar tech stacks
        const negativeKeywords = ["不知道", "不了解", "没听过", "不熟悉", "忘了"];
        const hasNegative = negativeKeywords.some(kw => finalUserInput.includes(kw));
        if (hasNegative || matchRate < 0.2) {
           setUnfamiliarTech(prev => Array.from(new Set([...prev, currentQ.knowledgePoint])));
        }

        await new Promise(r => setTimeout(r, 800));

        const isRelevant = finalUserInput.length > 10;
        if (!isRelevant) {
          // Follow up
          generatedReply = "你好像没有正面回答我的问题或者说得太简短了，能详细一点说吗？我想了解的是：" + currentQ.spokenText;
          // Don't advance index
        } else {
          // Good or acceptable answer
          const replyPrefix = OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
          if (currentQuestionIndex < questions.length - 1) {
             generatedReply = replyPrefix + " 那么下一个问题，" + questions[currentQuestionIndex + 1].spokenText;
             setCurrentQuestionIndex(prev => prev + 1);
          } else {
             generatedReply = replyPrefix + " 今天的面试差不多就到这里了，后续系统会生成专家的面试诊断报告给你，祝你好运。[INTERVIEW_ENDED]";
          }
        }
    }
    
    let cleanResponse = generatedReply;
    if (cleanResponse.includes('[INTERVIEW_ENDED]')) {
       cleanResponse = cleanResponse.replace('[INTERVIEW_ENDED]', '').trim();
       isEnding = true;
    }

    speakText(cleanResponse, isEnding);
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (text: string) => {
       setUserBuffer(prev => prev + text + " ");
       setInterimText("");
    },
    onInterimResult: (text: string) => {
       setInterimText(text);
    },
    onSilence: handleUserSilence
  });

  // Camera Setup
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function setupCamera() {
      const hasPermission = await requestCameraPermissions();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, 
          audio: false 
        });
        activeStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { }
    }
    setupCamera();
    return () => {
      if (activeStream) activeStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Voice output logic
  const speakText = async (text: string, isEnding: boolean = false) => {
    const finishInterview = () => {
        stopListening();
        window.speechSynthesis?.cancel();
        setInterviewResult({ 
          stress: stressLevel, 
          confidence: biometrics.confidence, 
          duration: time, 
          metrics: { depth: 85, breadth: 72, logic: 90, clarity: 88 },
          unfamiliarTech 
        });
        navigate('report');
    };

    const playFallback = () => {
      if (!window.speechSynthesis) {
         if (isEnding) finishInterview();
         return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const zhVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoices.length > 0) {
         const preferred = zhVoices.find(v => v.name.includes('Xiaoxiao') || v.name.includes('Tingting') || v.name.includes('Google'));
         if (preferred) {
           utterance.voice = preferred;
         } else {
           utterance.voice = zhVoices[0];
         }
      }

      utterance.volume = 1;
      utterance.rate = 1.05;
      utterance.pitch = 0.9;
      utterance.lang = 'zh-CN';
      
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setTranscript(text);
        stopListening(); 
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (isEnding) {
           finishInterview();
        } else {
           startListening(); 
        }
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        if (isEnding) {
           finishInterview();
        } else {
           startListening();
        }
      };
      
      window.speechSynthesis.speak(utterance);
    };

    playFallback(); // Forcing fallback immediately for faster simulation
  };

  // Initial Greeting
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initInterview = async () => {
        // Pre-load logic happened conceptually before loading screen ends
        speakText(interviewSession?.opening || "系统初始化完成，请做个自我介绍吧。");
    };
    
    initInterview();
    
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const [visualVolume, setVisualVolume] = useState(0.2);
  useEffect(() => {
    if (isAiSpeaking) {
      const i = setInterval(() => setVisualVolume(Math.random() * 0.8 + 0.2), 100);
      return () => clearInterval(i);
    } else {
      setVisualVolume(0.1);
    }
  }, [isAiSpeaking]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex h-full bg-slate-950 relative overflow-hidden">
      
      {/* MAIN VIEW (AI Interviewer) */}
      <div className="absolute inset-0 z-0 bg-slate-900 flex items-center justify-center overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,rgba(2,6,23,1)_100%)]"></div>
         
         <motion.div 
           animate={{ scale: isAiSpeaking ? [1, 1.02, 1] : 1, opacity: isAiSpeaking ? [0.8, 1, 0.8] : 0.6 }}
           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
           className="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center pointer-events-none"
         >
           <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(2,6,23,1)] z-10 pointer-events-none"></div>
           
           <div className="absolute flex flex-col items-center justify-center w-48 h-64 border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-sm shadow-[0_0_40px_rgba(6,182,212,0.1)] hexagon overflow-hidden">
              <div className="w-20 h-20 rounded-full border border-cyan-400/30 flex items-center justify-center relative">
                 <div className="w-12 h-12 bg-cyan-500 rounded-full blur-xl opacity-50"></div>
                 <motion.div 
                   animate={{ height: isAiSpeaking ? 4 + visualVolume * 20 : 4 }}
                   className="absolute bg-cyan-400 w-8 rounded-full z-20" 
                 />
              </div>
              <div className="absolute bottom-4 text-[9px] font-mono text-cyan-500 tracking-widest text-glow whitespace-nowrap">ORACLE V.9 / AI 面试官</div>
           </div>
           
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none z-20"></div>
         </motion.div>

         {/* Floating Indicators */}
         <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700/50 backdrop-blur text-slate-200 rounded-full text-xs font-mono flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {formatTime(time)}
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 text-glow leading-tight">
              {isListening ? 'MIC ACTIVE (收音中)' : 'AI SPEAKING...'}
            </div>
            <div className="text-[9px] font-mono text-slate-400 tracking-widest mt-2 px-1">
              STRESS: {stressLevel.toFixed(1)}%<br/>
              CONFIDENCE: {biometrics.confidence.toFixed(1)}%<br/>
              CURRENT Q: {Math.max(0, currentQuestionIndex + 1)}/{interviewSession?.questions?.length || 1}
            </div>
            
            <AnimatePresence>
              {showCheatWarning && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0 }}
                  className="mt-4 px-3 py-2 bg-rose-950/80 border-l-2 border-rose-500 text-rose-300 text-[10px] font-mono backdrop-blur-md rounded-r shadow-[0_0_15px_rgba(225,29,72,0.3)] max-w-[200px]"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-rose-400 font-bold">
                    <ShieldAlert size={12} />
                    <span>系统警告</span>
                  </div>
                  检测到视线偏离屏幕或焦点丢失，疑似异常辅助行为（已记录: {cheatWarnings} 次）
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      </div>

      {/* Floating User POV */}
      <motion.div 
        drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        className="absolute top-6 right-6 z-40 w-28 sm:w-32 h-40 sm:h-44 bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden tech-glass cursor-grab active:cursor-grabbing"
      >
        {isVideoOff ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 bg-slate-950">
            <VideoOff size={24} />
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
        )}
        <div className="absolute bottom-1 left-2 text-[7px] font-mono text-white/50 bg-black/30 px-1 rounded backdrop-blur-sm uppercase">User</div>
        {/* Buffer preview */}
        {(userBuffer || interimText) && (
           <div className="absolute inset-x-2 bottom-6 bg-black/60 backdrop-blur-md text-white text-[12px] p-2 rounded-lg max-h-24 overflow-y-auto font-medium">
             <div className="text-[10px] text-emerald-400 mb-1 opacity-80 uppercase tracking-widest">Candidate Speech</div>
             {userBuffer} <span className="opacity-70">{interimText}</span>
           </div>
        )}
      </motion.div>

      {/* UI Controls Overlay */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col pointer-events-none p-6">
        <div className="mb-6 flex justify-center w-full">
           <AnimatePresence mode="popLayout">
              {transcript && (
                  <motion.div 
                    key={transcript}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    className="bg-slate-900/60 backdrop-blur-xl border-l-2 border-cyan-500 p-4 rounded-r-xl max-w-md w-full pointer-events-auto shadow-2xl"
                  >
                    <div className="text-[10px] font-mono text-cyan-400 mb-1 tracking-widest">{isAiSpeaking ? 'AI INTERVIEWER' : 'SYSTEM'}</div>
                    <p className="text-lg text-slate-100 font-medium leading-relaxed drop-shadow-md">
                      "{transcript}"
                    </p>
                  </motion.div>
              )}
           </AnimatePresence>
        </div>

        <div className="flex gap-4 justify-center items-center pointer-events-auto max-w-[300px] mx-auto w-full">
          {userBuffer.trim().length > 0 && !isAiSpeaking && (
            <button 
               onClick={() => handleUserSilence()}
               className="flex-1 py-4 bg-cyan-600 text-white rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all font-bold tracking-widest touch-manipulation"
            >
               我讲完了
            </button>
          )}

          <button 
            onClick={() => setShowConfirm(true)}
            className="flex-none p-4 rounded-2xl flex items-center justify-center bg-rose-600/20 border border-rose-500/30 text-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.1)] active:scale-95 transition-all outline-rose-500/30"
          >
            <PhoneOff size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="tech-glass tech-border-glow w-full max-w-[300px] rounded-2xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
              
              <h3 className="text-xl font-bold text-white mb-2 text-center">终止进程？</h3>
              <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
                结束模拟，AI 将停止收音，并为您评估最终表现。
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    stopListening();
                    window.speechSynthesis?.cancel();
                    setInterviewResult({ 
                      stress: stressLevel, 
                      confidence: biometrics.confidence, 
                      duration: time, 
                      metrics: { depth: 85, breadth: 72, logic: 90, clarity: 88 },
                      unfamiliarTech
                    });
                    setShowConfirm(false);
                    navigate('report');
                  }}
                  className="w-full py-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold rounded-xl hover:bg-rose-500/20 transition-colors"
                >
                  终止并生成报告
                </button>
                <button 
                  onClick={() => {
                    setShowConfirm(false);
                    startListening();
                  }}
                  className="w-full py-3.5 bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] font-semibold rounded-xl hover:bg-cyan-500 transition-colors"
                >
                  继续面试
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
