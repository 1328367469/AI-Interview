import React, { useEffect, useState } from 'react';
import { ArrowLeft, Route, GitCommit, ChevronRight, Target, BrainCircuit, Flame, Sparkles, TrendingUp, Compass, Award } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CareerNode {
  title: string;
  target: string;
  timeframe: string;
  salary: string;
  colorTheme: 'cyan' | 'purple' | 'emerald';
  items: Array<{ text: string; status: 'done' | 'current' | 'pending' }>;
}

export default function CareerPlanView() {
  const { navigate, userProfile } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [careerNodes, setCareerNodes] = useState<CareerNode[]>([]);
  const [actionGuide, setActionGuide] = useState<string>('');

  const fetchPlan = async (force: boolean = false) => {
    if (!userProfile) return;
    
    // Create cache key based on user profile
    const cacheKey = `careerPlan_${btoa(unescape(encodeURIComponent(JSON.stringify(userProfile))))}`;
    
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { careerNodes, actionGuide } = JSON.parse(cached);
          setCareerNodes(careerNodes);
          setActionGuide(actionGuide);
          return;
        } catch (e) {
          // Fall through to generating
        }
      }
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/career-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserProfile: userProfile })
      });
      const data = await response.json();
      if (data.careerNodes) {
        setCareerNodes(data.careerNodes);
        setActionGuide(data.actionGuide);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [userProfile]);

  const handleRegenerate = () => {
    fetchPlan(true);
  };

  return (
     <div className="flex flex-col h-full bg-[#0a0f18] overflow-y-auto pb-safe text-white">
      <header className="px-5 py-6 sticky top-0 bg-[#0a0f18]/95 backdrop-blur-xl z-20">
        <button 
          onClick={() => navigate('tools')}
          className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">BACK / 返回</span>
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-950/40 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
               <Compass className="text-purple-400" size={20} />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-wider">职业路径拓扑</h1>
                <p className="text-[10px] sm:text-[11px] font-mono text-purple-500/80 mt-0.5 uppercase tracking-widest leading-tight">CAREER_GRAPH_GENERATOR</p>
             </div>
          </div>
          <motion.button 
             whileTap={{ scale: 0.95 }}
             onClick={handleRegenerate}
             disabled={isGenerating}
             className="text-amber-500 hover:text-amber-400 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-900/50 p-2 rounded-lg transition-colors flex items-center gap-2"
          >
             <BrainCircuit size={18} className={isGenerating ? "animate-pulse" : ""} />
             <span className="text-xs font-bold font-mono tracking-wider hidden sm:inline-block">AI 重新推演</span>
          </motion.button>
        </div>
      </header>

      <div className="px-5 mt-4">
        {/* Dynamic Context Header */}
        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 mb-6 flex items-center gap-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="w-12 h-12 bg-slate-900 border border-slate-700/50 shadow-inner rounded-full flex flex-col items-center justify-center shrink-0 z-10">
              <Award size={20} className="text-slate-400" />
           </div>
           <div className="z-10">
              <div className="text-xs font-mono text-cyan-400 mb-1 uppercase tracking-widest">Base Identity</div>
              <div className="text-sm font-bold text-slate-200">
                {userProfile?.profession || '未知岗位'} <span className="text-slate-500 mx-1">|</span> {userProfile?.skills || '全栈体系'}
              </div>
           </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 relative overflow-hidden">
           {/* Cyber Grid background */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>

           <div className="space-y-6 relative z-10">
              <AnimatePresence>
                {isGenerating ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 flex flex-col items-center justify-center gap-4 text-purple-400 font-mono tracking-widest text-sm"
                  >
                    <Sparkles size={32} className="animate-spin text-purple-500" />
                    正在结合 {userProfile?.profession || '当前'} 画像重新推演技能分支...
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 relative"
                  >
                    {/* Continuous vertical line connecting all nodes */}
                    <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500/40 via-purple-500/40 to-emerald-500/40 z-0 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>

                    {careerNodes.map((node, index) => (
                      <Node 
                        key={index}
                        title={node.title}
                        target={node.target}
                        items={node.items}
                        salary={node.salary}
                        timeframe={node.timeframe}
                        colorTheme={node.colorTheme}
                        delay={index * 0.15}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        <div className="mt-6 mb-8 bg-gradient-to-br from-[#111827] to-cyan-950/20 border border-[#1f2937] p-5 rounded-xl block relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-full h-full bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="flex items-center gap-2 text-cyan-400 mb-3 relative z-10">
             <Flame size={18} />
             <span className="font-bold text-sm tracking-wide">行动指南 (ACTION_GUIDE)</span>
           </div>
           <p className="text-xs text-slate-400 leading-relaxed relative z-10">
             {actionGuide ? actionGuide : (
               <>
                 根据您的画像描述 <span className="text-amber-400/80 font-mono">[{[userProfile?.traits, userProfile?.education].filter(Boolean).join(' | ')}]</span>，系统建议在深挖底层原理时，必须兼顾<strong className="text-slate-200">商业思维与架构串讲能力</strong>。单纯的技术厚度已不足以支撑 P7/专家 级别的跨越，需在日常开发中沉淀可复用的基础组件，主动承担跨部门技术协同闭环。
               </>
             )}
           </p>
        </div>
      </div>
    </div>
  );
}

function Node({ title, target, items, salary, timeframe, colorTheme, delay }: any) {
  const colors: Record<string, string> = {
    cyan: "border-cyan-900/60 text-cyan-400 bg-cyan-950/40 icon-cyan-500 dot-cyan-400 badge-cyan-900/50 text-cyan-300",
    purple: "border-purple-900/60 text-purple-400 bg-purple-950/40 icon-purple-500 dot-purple-400 badge-purple-900/50 text-purple-300",
    emerald: "border-emerald-900/60 text-emerald-400 bg-emerald-950/40 icon-emerald-500 dot-emerald-400 badge-emerald-900/50 text-emerald-300",
  };

  // Manually extract for tailwind
  let borderColor = "border-cyan-900/60 hover:border-cyan-500/50";
  let textColor = "text-cyan-400";
  let bgColor = "bg-cyan-950/20";
  let iconColor = "border-cyan-500";
  let dotColor = "bg-cyan-400";
  let badgeColor = "bg-cyan-950/60 text-cyan-300 border-cyan-800/50";

  if (colorTheme === 'purple') {
    borderColor = "border-purple-900/60 hover:border-purple-500/50";
    textColor = "text-purple-400";
    bgColor = "bg-purple-950/20";
    iconColor = "border-purple-500";
    dotColor = "bg-purple-400";
    badgeColor = "bg-purple-950/60 text-purple-300 border-purple-800/50";
  } else if (colorTheme === 'emerald') {
    borderColor = "border-emerald-900/60 hover:border-emerald-500/50";
    textColor = "text-emerald-400";
    bgColor = "bg-emerald-950/20";
    iconColor = "border-emerald-500";
    dotColor = "bg-emerald-400";
    badgeColor = "bg-emerald-950/60 text-emerald-300 border-emerald-800/50";
  }

  return (
    <motion.div 
       initial={{ opacity: 0, x: -20 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay }}
       className={cn("p-5 rounded-xl border relative z-10 backdrop-blur-sm transition-colors", bgColor, borderColor)}
    >
      <div className={cn("absolute -left-3 top-6 w-8 h-8 bg-[#0a0f18] border-2 rounded-full flex items-center justify-center transform -translate-y-1/2 z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)]", iconColor)}>
         <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", dotColor)}></div>
      </div>
      <div className="pl-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
           <h3 className={cn("text-[16px] font-bold leading-tight", textColor)}>{title}</h3>
           <div className="flex items-center gap-2 font-mono shrink-0">
             <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 uppercase">{timeframe}</span>
             <span className={cn("text-[10px] px-2 py-1 rounded border flex items-center gap-1", badgeColor)}>
               <TrendingUp size={12} /> {salary}
             </span>
           </div>
        </div>
        
        <div className="text-[12px] text-slate-300 mb-4 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/50 font-medium">
          <span className="text-slate-500 font-mono text-[10px] mr-2">GOAL</span> {target}
        </div>

        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex gap-3 text-xs sm:text-[13px] text-slate-300 bg-slate-900/20 p-2 rounded-lg">
              <GitCommit size={16} className={cn("shrink-0 mt-0.5", item.status === 'done' ? 'text-emerald-500' : item.status === 'current' ? 'text-amber-500 animate-pulse' : 'text-slate-600')} />
              <span className="leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

