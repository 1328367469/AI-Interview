import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, TerminalSquare, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import Markdown from 'react-markdown';

// Global cache to avoid refetching during session
let cachedInterviews: any[] | null = null;

export default function QuestionBankView() {
  const { userProfile, navigate, generatedQuestions, isGeneratingQuestions } = useAppContext() as any;
  const [searchQuery, setSearchQuery] = useState('');
  const [interviews, setInterviews] = useState<any[]>(cachedInterviews || []);
  const [isLoading, setIsLoading] = useState(!cachedInterviews);
  const [activeDoc, setActiveDoc] = useState<any | null>(null);

  useEffect(() => {
    if (cachedInterviews) return;
    setIsLoading(true);
    const fetchQbData = async () => {
      try {
        const res = await fetch('/api/qb/interviews');
        const data = await res.json();
        const results = data.interviews || [];
        setInterviews(results);
        cachedInterviews = results;
      } catch (err) {
        console.error("Failed to fetch Question Bank data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQbData();
  }, []);

  const scoredInterviews = useMemo(() => {
    if (!interviews.length) return [];

    let keywords: string[] = [];
    if (userProfile) {
       const profileStr = [
         userProfile.profession, 
         userProfile.skills, 
         userProfile.interests, 
         userProfile.traits,
         userProfile.education
       ].filter(Boolean).join(' ').toLowerCase();
       
       // Extract words avoiding punctuation
       const words = profileStr.match(/[\w\u4e00-\u9fa5]+/g) || [];
       keywords = Array.from(new Set(words)).filter(w => w.length > 1);
    }

    const processed = interviews.map(item => {
      let tags: string[] = [];
      try { 
        tags = Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? JSON.parse(item.tags) : []); 
      } catch(e) {}
      
      let matchScore = 0;
      
      if (keywords.length > 0) {
        const titleTarget = (item.title || '').toLowerCase();
        const contentTarget = (item.content || '').toLowerCase();
        const tagsTarget = tags.map((t: string) => t.toLowerCase());

        keywords.forEach(kw => {
          if (titleTarget.includes(kw)) matchScore += 10;
          if (tagsTarget.some((t: string) => t.includes(kw) || kw.includes(t))) matchScore += 15;
          
          // count occurrences in content
          const contentMatches = contentTarget.split(kw).length - 1;
          matchScore += Math.min(contentMatches * 2, 20); // max 20 points from content per keyword
        });
      }

      return {
        ...item,
        parsedTags: tags,
        matchScore
      };
    });

    // Sort by match score descending, then by days_ago ascending
    let sorted = processed.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.days_ago - b.days_ago;
    });

    // Apply search filter if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(item => 
        item.title?.toLowerCase().includes(q) || 
        item.company?.toLowerCase().includes(q) ||
        item.parsedTags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return sorted;
  }, [interviews, userProfile, searchQuery]);

  const generationSteps = [
    "🧠 AI 正在读取您的专属面诊报告...",
    "🔍 正在提炼核心技术盲区...",
    "📝 结合全网面经并匹配考点...",
    "✨ 正在生成您的专属模拟训练题..."
  ];

  const [loadingStep, setLoadingStep] = useState(0);
  useEffect(() => {
    if (!isGeneratingQuestions) return;
    let currentStep = 0;
    const interval = setInterval(() => {
       if (currentStep < 3) {
          currentStep++;
          setLoadingStep(currentStep);
       }
    }, 2500);
    return () => clearInterval(interval);
  }, [isGeneratingQuestions]);

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] overflow-y-auto pb-safe custom-scrollbar">
      <header className="px-5 py-6 sticky top-0 bg-[#0a0f18]/95 backdrop-blur-xl z-20">
        <button 
          onClick={() => navigate('tools')}
          className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">BACK / 返回</span>
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-cyan-400" size={24} />
          面试知识库
        </h1>
      </header>

      <div className="px-5 mt-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search / 搜索知识碎片..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-800 transition-colors"
          />
        </div>
      </div>

      <div className="px-5 mt-6 pb-12 space-y-4">
        {isGeneratingQuestions ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-t-2 border-l-2 border-cyan-500 opacity-80"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                  className="absolute inset-3 rounded-full border-b-2 border-r-2 border-fuchsia-500 opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TerminalSquare className="text-cyan-400" size={32} />
                </div>
              </div>
              <motion.div 
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyan-400 font-mono tracking-widest text-sm text-center"
              >
                {generationSteps[loadingStep] || "处理中..."}
              </motion.div>
            </div>
          ) : generatedQuestions && generatedQuestions.length > 0 ? (
            <div className="space-y-8">
              {generatedQuestions.map((cat: any, i: number) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                    <h2 className="text-lg font-bold text-white tracking-wide">{cat.categoryName}专区</h2>
                    <span className="text-xs text-slate-500 font-mono">({cat.questions.length} 题)</span>
                  </div>
                  <div className="grid gap-4">
                    {cat.questions.map((q: any, qIdx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qIdx * 0.02 }}
                        key={qIdx}
                        className="bg-[#111827] border border-[#1f2937] p-5 rounded-2xl cursor-pointer hover:border-cyan-900/50"
                        onClick={() => setActiveDoc({ title: q.question, content: q.answer, accesses: Math.floor(Math.random() * 100) + 10 })}
                      >
                        <h3 className="font-bold text-slate-200 mb-2">{q.question}</h3>
                        <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
                          <span>专项突破</span>
                          <span className="text-cyan-600 font-bold hover:text-cyan-400 transition-colors">查看详细解法 →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-slate-500 font-mono text-sm">暂无专属训练题，请先参加模拟面试并生成报告</div>
          )
        }
      </div>

      <AnimatePresence>
        {activeDoc && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-[#0a0f18] flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2937] bg-[#0a0f18]/95 backdrop-blur-xl shrink-0">
              <button 
                onClick={() => setActiveDoc(null)}
                className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5"
              >
                <ArrowLeft size={20} />
                <span className="text-xs font-mono tracking-widest uppercase">BACK / 返回</span>
              </button>
              <div className="text-amber-500 text-xs font-mono flex items-center gap-1">
                <Star size={14} className="fill-amber-500" />
                {activeDoc.accesses} accesses
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-safe px-5 py-6 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6 leading-snug">{activeDoc.title}</h1>
                <div className="markdown-body text-slate-300 text-[15px]">
                  <Markdown>{activeDoc.content}</Markdown>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1f2937] bg-[#0a0f18]/95 shrink-0 pb-safe">
               <button className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                  导入该经验至 AI 模拟面试
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
