import React, { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle2, ChevronRight, Wand2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';

export default function ResumeOptView() {
  const { navigate } = useAppContext();
  const [analyzing, setAnalyzing] = useState(false);

  const mockAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      // Logic for moving to next state could go here.
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto pb-safe text-white">
      <header className="px-6 py-6 border-b border-cyan-900/30 sticky top-0 bg-slate-950/80 backdrop-blur z-20 flex justify-between items-center">
        <button 
          onClick={() => navigate('tools')}
          className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">BACK / 返回</span>
        </button>
      </header>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-cyan-950/50 rounded-xl flex items-center justify-center border border-cyan-500/30">
             <FileText className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider">简历解析器</h1>
            <p className="text-xs font-mono text-cyan-500 mt-1 uppercase tracking-widest">RESUME_PARSER_V2 (简历解析器 V2)</p>
          </div>
        </div>

        <section className="tech-glass p-6 rounded-2xl border border-slate-800 mb-6">
          <h2 className="text-[14px] font-bold text-slate-200 mb-4 flex items-center justify-between">
            当前绑定节点
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono">STATUS: SYNCED (已同步)</span>
          </h2>
          
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
             <div className="w-12 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center border border-slate-600 shadow-inner">
               <span className="text-[10px] text-white font-mono uppercase bg-red-500 px-1 rounded-sm">PDF</span>
             </div>
             <div className="flex-1">
               <div className="text-[14px] font-medium text-slate-200">前端工程师-张三-2025.pdf</div>
               <div className="text-[11px] text-slate-500 mt-0.5 font-mono">1.2 MB · Uploaded 2h ago</div>
             </div>
             <button className="text-cyan-500 text-xs hover:text-cyan-400">重新上传</button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-mono font-bold text-cyan-500 uppercase mb-4 pl-1">Data Processing / 数据处理操作</h2>
          
          <div className="space-y-3">
            <ActionRow 
              icon={<Wand2 className="text-purple-400" size={20} />}
              title="一键转换 STAR 架构"
              desc="将经历使用 (情境, 任务, 行动, 结果) 原则重写一遍"
              onClick={mockAnalyze}
            />
            <ActionRow 
              icon={<CheckCircle2 className="text-emerald-400" size={20} />}
              title="关键词提取与分析"
              desc="比对大厂 JD 挖掘缺失的技能标签"
              onClick={mockAnalyze}
            />
          </div>
        </section>
        
        {analyzing && (
           <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full mb-4"
              />
              <p className="text-cyan-400 font-mono tracking-widest text-sm">PROCESSING_DATA (处理数据中)...</p>
           </div>
        )}
      </div>
    </div>
  );
}

function ActionRow({ icon, title, desc, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 p-2 bg-slate-800 rounded-lg group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-shadow">
          {icon}
        </div>
        <div>
          <div className="text-[15px] font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{title}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{desc}</div>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
    </button>
  );
}
