import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share, ShieldAlert, CheckCircle, Crosshair, Cpu, Hand, Loader } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

export default function ReportView() {
  const { navigate, interviewResult } = useAppContext() as any;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.post('/api/generate-report', {
          userId: 'user_123',
          interviewResult
        });
        setReport(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [interviewResult]);

  if (loading) {
    return (
      <div className="flex h-full bg-slate-950 items-center justify-center flex-col gap-4">
        <Loader className="animate-spin text-cyan-500" size={32} />
        <div className="text-cyan-500 font-mono text-sm tracking-widest">
          GENERATING DIAGNOSTICS...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full bg-slate-950 items-center justify-center flex-col gap-4">
         <div className="text-rose-500 font-mono text-sm tracking-widest">
            REPORT GENERATION FAILED
         </div>
         <button onClick={() => navigate('home')} className="mt-4 px-4 py-2 border border-cyan-500/50 text-cyan-400 rounded">RETURN HOME</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto pb-safe">
      <header className="px-6 py-6 border-b border-cyan-900/30 sticky top-0 bg-slate-950/80 backdrop-blur z-20 flex justify-between items-center">
        <button 
          onClick={() => navigate('home')}
          className="text-cyan-500 hover:text-cyan-400 flex items-center gap-1.5"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">CLOSE / 关闭</span>
        </button>
        <button className="text-slate-400 hover:text-cyan-400 transition-colors">
          <Share size={20} />
        </button>
      </header>

      <div className="p-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Global Score Core */}
        <div className="flex flex-col items-center justify-center pt-4 pb-8 border-b border-slate-800/50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-full border border-emerald-500/30 flex items-center justify-center relative bg-emerald-950/20 shadow-[0_0_40px_rgba(16,185,129,0.1)] mb-6 hexagon"
          >
            <div className="absolute inset-2 border border-emerald-500/20 rounded-full hexagon"></div>
            <div className="absolute inset-4 border border-emerald-500/10 rounded-full hexagon flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 text-glow">{report.sysScore || 85}</span>
              <span className="text-[8px] sm:text-[10px] text-emerald-500/80 uppercase tracking-widest font-mono mt-1 text-center leading-tight">SYS_SCORE<br/>(系统评分)</span>
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-white tracking-wide">{report.title || "分析报告"}</h2>
          <p className="text-sm text-slate-400 mt-2 font-mono flex items-center gap-2"><Cpu size={14}/> 基于当前面试状态动态生成</p>
        </div>

        {/* Radar / Metrics Simulation */}
        <div className="py-8 grid grid-cols-2 gap-4">
           {Object.keys(report.metrics || { depth: 80, breadth: 80, logic: 80, clarity: 80 }).map((key, i) => (
             <div key={i} className="tech-glass p-3 border border-slate-800 rounded-xl relative overflow-hidden">
               <div className="absolute left-0 bottom-0 h-1 bg-emerald-500" style={{ width: `${report.metrics[key]}%` }}></div>
               <div className="text-[9px] font-mono text-cyan-500 mb-1 uppercase">{key}</div>
               <div className="text-lg font-bold text-slate-200 font-mono">{report.metrics[key]}/100</div>
             </div>
           ))}
        </div>

        <section className="mt-4 space-y-6">
          <div className="tech-glass p-5 rounded-2xl border border-emerald-900/30">
            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-4 bg-emerald-950/50 inline-flex px-3 py-1 rounded border border-emerald-900 border-l-4 border-l-emerald-400/80 uppercase">
              <CheckCircle size={16} /> 核心优势
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {(report.positives || []).map((pos: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-mono mt-0.5">●</span>
                  <span>{pos}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tech-glass p-5 rounded-2xl border border-amber-900/30">
            <h3 className="flex items-center gap-2 text-sm font-bold text-amber-400 mb-4 bg-amber-950/50 inline-flex px-3 py-1 rounded border border-amber-900 border-l-4 border-l-amber-400/80 uppercase">
              <ShieldAlert size={16} /> 需要改进
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
               {(report.negatives || []).map((neg: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-mono mt-0.5">●</span>
                  <span>{neg}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="tech-glass p-5 rounded-2xl border border-cyan-900/30">
            <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-4 bg-cyan-950/50 inline-flex px-3 py-1 rounded border border-cyan-900 border-l-4 border-l-cyan-400/80 uppercase">
              <Crosshair size={16} /> 系统修复建议
            </h3>
            <div className="bg-slate-900/80 p-4 rounded-xl text-sm text-slate-300 leading-relaxed border border-slate-800">
              <p>为了达到极高标准的候选人要求，建议您：</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                 {(report.suggestions || []).map((sug: string, idx: number) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* New Behavioral Analysis Section */}
          <div className="tech-glass p-5 rounded-2xl border border-rose-900/30">
            <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400 mb-6 bg-rose-950/50 inline-flex px-3 py-1 rounded border border-rose-900 border-l-4 border-l-rose-400/80 uppercase">
              <Hand size={16} /> 行为与心理评估 (Behavioral Analysis)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>心理稳定性 (Stability)</span>
                  <span className="text-emerald-400">{report.behavioral?.stability || 'Stable / 稳定'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${report.behavioral?.stabilityScore || 90}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                  <span>状态自控 (Control)</span>
                  <span className="text-emerald-400">{report.behavioral?.integrity || 'High / 极高'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${report.behavioral?.integrityScore || 90}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4">
               {(report.behavioral?.details || []).map((detail: any, idx: number) => (
                 <div key={idx} className="flex items-start gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${detail.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                     {detail.type === 'positive' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                   </div>
                   <div>
                     <div className="text-xs font-bold text-slate-200 mb-1">{detail.label}</div>
                     <p className="text-[11px] text-slate-400 leading-relaxed">{detail.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
          <button 
            className="mt-2 w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-colors font-bold uppercase tracking-widest text-[13px]"
            onClick={() => navigate('question-bank')}
          >
            一键生成复习训练计划
          </button>

        </section>
      </div>
    </div>
  );
}
