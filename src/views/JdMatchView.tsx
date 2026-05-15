import React, { useState } from 'react';
import { Network, Zap, ExternalLink, ShieldCheck, MapPin, Briefcase, ArrowLeft, Settings2, FileText, ChevronRight, Download, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function JdMatchView() {
  const { navigate, parsedResumeResult } = useAppContext();
  const [analyzing, setAnalyzing] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [region, setRegion] = useState("全国");
  const [jobType, setJobType] = useState("前端开发");
  const [showConfig, setShowConfig] = useState(false);
  const [showStrategy, setShowStrategy] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  // Mock Analysis
  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const resumeText = parsedResumeResult?.documentLines?.map((l: any) => l.text).join('\n') || '';
      const response = await fetch('/api/search-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region, jobType, resumeText })
      });
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
      setResultReady(true);
    } catch (e) {
      console.error(e);
      alert("JD爬取/生成失败！");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyStrategy = (idx: number) => {
    setShowStrategy(showStrategy === idx ? null : idx);
  };

  const startTargetedInterview = (job: any) => {
    // Ideally pass the job payload or store it globally.
    // For now we just navigate to 'active-interview'
    navigate('active-interview');
  };

  const handleExportTargetedResume = (job: any) => {
    alert(`已为您生成针对【${job.company} - ${job.title}】的定制版简历。\n包含对应的 STAR 优化。\n(模拟下载 DOCX)`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto pb-safe">
      <header className="px-6 py-6 border-b border-cyan-900/30 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20">
        <button 
          onClick={() => navigate('tools')}
          className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">BACK / 返回</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
              <Network className="text-cyan-400" size={28} />
              真实岗位感知
            </h1>
            <p className="text-xs text-slate-400 mt-2">爬取真实 JD 招聘数据，生成定制投递策略与仿真面试。</p>
          </div>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 border border-slate-800 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 transition-colors"
          >
            <Settings2 size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showConfig && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Location (地域)</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option>全国</option>
                    <option>北京</option>
                    <option>上海</option>
                    <option>深圳</option>
                    <option>杭州</option>
                    <option>成都</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 block">Job Type (岗位意向)</label>
                  <input 
                    type="text" 
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button 
                  onClick={() => { setShowConfig(false); setResultReady(false); triggerAnalysis(); }}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors"
                >
                  更新爬取参数
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {!resultReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
          <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={triggerAnalysis}
             className="w-40 h-40 rounded-full border border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center gap-4 group relative"
          >
            {analyzing && (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400"
              />
            )}
            <Zap size={40} className={analyzing ? "text-cyan-400 animate-pulse" : "text-slate-400 group-hover:text-cyan-400"} />
            <span className="text-sm font-mono font-bold text-slate-300 text-center leading-tight">
              {analyzing ? (
                <>CRAWLING<br/>(智能爬取中)...</>
              ) : (
                <>START_FETCH<br/>(开始抓取)</>
              )}
            </span>
          </motion.button>
        </div>
      ) : (
        <div className="p-6 space-y-6 pb-24">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-cyan-400" size={20} />
              <h2 className="text-lg font-bold text-white">[{region}] {jobType} 推荐池</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="tech-glass p-5 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-[17px] font-bold text-slate-100 flex items-center gap-2">
                      {job.title} 
                      <span className="text-sm font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded">{job.salary}</span>
                    </h3>
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1"><Briefcase size={14}/> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end relative z-10 w-24">
                    <span className="text-2xl font-black font-mono text-emerald-400 text-glow">{job.match}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap">Match Rate (匹配率)</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-rose-400/80 mb-3 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-rose-950 rounded border border-rose-900 whitespace-nowrap">GAP (差距)</span> 
                    <span className="truncate">缺少经验：{job.missing}</span>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 mb-2">
                     <button 
                       onClick={() => handleExportTargetedResume(job)}
                       className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                     >
                       <FileText size={14}/> 定制化简历 (DOCX)
                     </button>
                     <button 
                       onClick={() => handleApplyStrategy(idx)}
                       className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                     >
                       <Bot size={14}/> AI 投递防坑指南
                     </button>
                  </div>

                  <AnimatePresence>
                     {showStrategy === idx && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden mb-4"
                       >
                         <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-lg text-xs leading-relaxed text-slate-300 space-y-3 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                           <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-700 pb-2 mb-2">
                             <ShieldCheck size={16}/> 多维避坑指南 & 流程内幕预测
                           </div>
                           <div>
                             <span className="text-cyan-400 font-bold">● 渠道优势：</span>{job.strategyData?.directHint || "建议优先使用牛客网内推，或通过脉脉寻找该部门员工直推。直接官网投递该岗位简历被淹没的概率极大。"}
                           </div>
                           <div>
                             <span className="text-rose-400 font-bold">● JD 陷阱拆解：</span>{job.strategyData?.jdTrap || `JD 中优先考虑具备 ${job.missing} 经验，实际上是隐性的硬性门槛。务必在面试前准备相关造轮子经历。`}
                           </div>
                           <div>
                             <span className="text-amber-400 font-bold">● HC (Headcount) 真实性测算：</span>{job.strategyData?.hcReality || "本岗位可能为招聘 KPI 占位岗位。建议作为保底池投递，不宜抱太大期望。"}
                           </div>
                           <div className="bg-slate-950 p-3 rounded border border-slate-800">
                             <p className="text-emerald-400 font-bold mb-1">🔥 核心面试流程预测：</p>
                             <ul className="space-y-1 text-slate-400 pl-2">
                               {job.strategyData?.rounds?.length ? (
                                 job.strategyData.rounds.map((round: string, i: number) => (
                                   <li key={i}>- <strong className="text-slate-300">第{i+1}轮</strong>：{round}</li>
                                 ))
                               ) : (
                                 <>
                                   <li>- <strong className="text-slate-300">一面 (1小时)</strong>：八股文轰炸 + 手撕两道力扣 Medium。</li>
                                   <li>- <strong className="text-slate-300">二面 (交叉面)</strong>：深挖项目架构，重点拷问性能优化极值记录、内存泄漏排查等。</li>
                                   <li>- <strong className="text-slate-300">三面 (主管总监)</strong>：考核抗压能力，为什么离职，如何横向协助。</li>
                                   <li>- <strong className="text-slate-300">HR面</strong>：薪酬拉锯战，背调。</li>
                                 </>
                               )}
                             </ul>
                           </div>
                         </div>
                       </motion.div>
                     )}
                  </AnimatePresence>

                  <button 
                    onClick={() => startTargetedInterview(job)}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2"
                  >
                    <Zap size={16} className="text-white" />
                    根据该 JD 发起全流程仿真面试
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
