import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ViewState } from '../types';

interface Message {
  id: string;
  role: 'user' | 'ai' | 'assistant';
  content: string;
  isActionable?: boolean;
}

interface AppContextValue {
  currentView: ViewState;
  navigate: (view: ViewState) => void;
  completeOnboarding: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userProfile: any;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  dbStatus: 'checking' | 'connected' | 'error';
  fetchData: () => Promise<void>;
  isRefreshing: boolean;
  interviewResult: any;
  setInterviewResult: React.Dispatch<React.SetStateAction<any>>;
  parsedResumeResult: any;
  setParsedResumeResult: React.Dispatch<React.SetStateAction<any>>;
  parsedResumeFile: File | null;
  setParsedResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
  isParsingResume: boolean;
  setIsParsingResume: React.Dispatch<React.SetStateAction<boolean>>;
  resumeParsingStep: number;
  setResumeParsingStep: React.Dispatch<React.SetStateAction<number>>;
  parseErrorMsg: string | null;
  setParseErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  interviewSession: any;
  setInterviewSession: React.Dispatch<React.SetStateAction<any>>;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const hasSeenOnboarding = localStorage.getItem('nexus_onboarding_seen');
    return hasSeenOnboarding ? 'home' : 'onboarding';
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_1',
      role: 'ai',
      content: 'SYSTEM ONLINE (系统已上线)。我是您的主控 AI 面试控制台。我已经准备好基于您的个人偏好和习惯为您提供服务。您可以随时提问。',
      isActionable: true,
    }
  ]);
  const [userProfile, setUserProfile] = useState<any>({});
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [parsedResumeResult, setParsedResumeResult] = useState<any>(null);
  const [parsedResumeFile, setParsedResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParsingStep, setResumeParsingStep] = useState(0);
  const [parseErrorMsg, setParseErrorMsg] = useState<string | null>(null);

  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [interviewSession, setInterviewSession] = useState<any>(null);

  const userId = 'user_123';

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/db-test');
      const data = await res.json();
      setDbStatus(data.status === 'ok' ? 'connected' : 'error');

      // Fetch Profile & History
      const [profileRes, historyRes] = await Promise.all([
        fetch(`/api/profile/${userId}`),
        fetch(`/api/history/${userId}`)
      ]);
      
      const profileData = await profileRes.json();
      if (profileData.profile) {
        setUserProfile(profileData.profile);
      }

      const historyData = await historyRes.json();
      if (historyData.history && historyData.history.length > 0) {
        const loadedMessages = historyData.history.map((h: any) => ({
          id: h.id.toString(),
          role: h.role === 'assistant' ? 'ai' : h.role,
          content: h.content,
          isActionable: false,
        }));
        setMessages([
          {
            id: 'welcome_1',
            role: 'ai',
            content: 'SYSTEM ONLINE (系统已上线)。我是您的主控 AI 面试控制台。我已经准备好基于您的个人偏好和习惯为您提供服务。您可以随时提问。',
            isActionable: true,
          },
          ...loadedMessages
        ]);
      }
    } catch (err) {
      setDbStatus('error');
    } finally {
      setIsRefreshing(false);
      setHasInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized) {
      fetchData();
    }
  }, [hasInitialized, fetchData]);

  const navigate = (view: ViewState) => setCurrentView(view);

  const completeOnboarding = () => {
    localStorage.setItem('nexus_onboarding_seen', 'true');
    navigate('home');
  };

  return (
    <AppContext.Provider value={{ 
      currentView, 
      navigate, 
      completeOnboarding,
      messages,
      setMessages,
      userProfile,
      setUserProfile,
      dbStatus,
      fetchData,
      isRefreshing,
      interviewResult,
      setInterviewResult,
      parsedResumeResult,
      setParsedResumeResult,
      parsedResumeFile,
      setParsedResumeFile,
      isParsingResume,
      setIsParsingResume,
      resumeParsingStep,
      setResumeParsingStep,
      parseErrorMsg,
      setParseErrorMsg,
      interviewSession,
      setInterviewSession
    } as any}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
