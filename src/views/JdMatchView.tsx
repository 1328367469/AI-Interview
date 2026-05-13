import React, { useState } from 'react';
import { Network, Zap, ExternalLink, ShieldCheck, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function JdMatchView() {
  const { navigate } = useAppContext();
  const [analyzing, setAnalyzing] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  // Mock Analysis
  const triggerAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResultReady(true);
    }, 2000);
  };

  const jobs = [
    { title: "高级前端开发", company: "字节跳动", location: "北京·海淀区", salary: "35-60K", match: 92, missing: "Rust/WASM" },
    { title: "前端架构师", company: "腾讯", location: "深圳·南山区", salary: "40-70K", match: 86, missing: "亿级流量架构经验" },
    { title: "Web前端专家", company: "阿里集团", location: "杭州·余杭区", salary: "40-60K", match: 89, missing: "Node.js 底层优化" },
  ];

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
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
          <Network className="text-cyan-400" size={28} />
          JD 精准匹配
        </h1>
        <p className="text-xs text-slate-400 mt-2">基于您的简历画像，AI 已计算全网相关热门岗位匹配度。</p>
      </header>

      {!resultReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
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
                <>SCANNING<br/>(扫描中)...</>
              ) : (
                <>START_SYNC<br/>(开始同步)</>
              )}
            </span>
          </motion.button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-cyan-400" size={20} />
            <h2 className="text-lg font-bold text-white">内推与热招预测</h2>
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
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2.5">
                      <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium rounded-lg transition-colors">
                        针对性优化简历
                      </button>
                      <button className="flex-[1.2] py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-colors flex items-center justify-center gap-1.5">
                        一键投递 <ExternalLink size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => navigate('active-interview')}
                      className="w-full py-2.5 bg-slate-800 border border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-400/50 text-emerald-400 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap size={16} className="text-emerald-400" />
                      仿真面试 (全真流程)
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
