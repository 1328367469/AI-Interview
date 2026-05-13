import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, TerminalSquare, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import Markdown from 'react-markdown';

// Global cache to avoid refetching during session
let cachedInterviews: any[] | null = null;

export default function QuestionBankView() {
  const { userProfile, navigate } = useAppContext();
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
        {isLoading ? (
          <div className="text-center py-10 text-slate-500 font-mono text-sm animate-pulse">
            LOADING KNOWLEDGE BASE...
          </div>
        ) : scoredInterviews.length > 0 ? (
          scoredInterviews.map((item, idx) => {
            const tags = item.parsedTags;
            const matchPercentage = Math.min(Math.round((item.matchScore / 60) * 100), 99); // Normalize a bit
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.id}
                className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden transition-all hover:border-cyan-900/50 relative"
              >
                {item.matchScore > 20 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500/20 to-transparent pl-8 pr-4 py-1 text-[10px] text-emerald-400 font-mono font-bold tracking-widest rounded-bl-xl border-b border-l border-emerald-500/20">
                    MATCH: {matchPercentage > 0 ? matchPercentage : 45}%
                  </div>
                )}
                
                <div 
                  className="p-5 cursor-pointer pt-6"
                  onClick={() => setActiveDoc(item)}
                >
                  <div className="flex items-start gap-4">
                    <TerminalSquare className={cn("shrink-0 mt-1", item.matchScore > 20 ? "text-emerald-500" : "text-cyan-600")} size={20} />
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-white mb-3 leading-snug pr-16">{item.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#1f2937] text-slate-300 text-[11px] font-mono rounded border border-slate-700 uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Star size={14} className="fill-amber-500" />
                          <span>{item.accesses} accesses</span>
                        </div>
                        <span>{item.days_ago} 天前</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
           <div className="text-center py-10 text-slate-500 font-mono text-sm">NO_DATA_FOUND</div>
        )}
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
