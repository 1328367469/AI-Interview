import React from 'react';
import { Target, CheckCircle2, Lock, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function LearnView() {
  const { userProfile } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] overflow-y-auto pb-safe">
      <header className="px-5 py-6 sticky top-0 bg-[#0a0f18]/95 backdrop-blur-xl z-20">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Target className="text-emerald-400" size={28} />
          针对性专项刷题
        </h1>
        <p className="text-slate-400 text-sm mt-2">基于您的历史面评，动态生成的薄弱点强化突击</p>
      </header>

      <div className="px-5 mt-4 space-y-6">
        <div className="bg-gradient-to-br from-emerald-950/40 to-[#111827] border border-emerald-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-400">
            <Flame size={20} />
            <h2 className="text-lg font-bold">高优先级突击区</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            系统检测到您在<span className="text-emerald-400 font-bold px-1">{userProfile?.profession || '本职岗位'}</span>的深度广度上有进一步提升空间，已为您生成专属题库。
          </p>
          <button className="mt-5 w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            开始 10 道突击测试
          </button>
        </div>

        <div>
          <h3 className="text-sm font-mono text-slate-500 mb-3 px-1 uppercase tracking-widest hidden sm:block">知识体系拆解 (Module Breakdown)</h3>
          
          <div className="space-y-3">
            {[
              { title: '底层原理与框架设计', progress: 30, questions: 45 },
              { title: '工程化与性能优化', progress: 65, questions: 22 },
              { title: '高可用架构与实战', progress: 10, questions: 89 },
            ].map((mod, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col gap-3 group hover:border-emerald-900/50 transition-colors"
                onClick={() => alert(`模块 ${mod.title} 题库准备中...`)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-200">{mod.title}</div>
                  <div className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono">
                    {mod.questions} 题
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mod.progress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono text-right">
                  掌握度 {mod.progress}%
                </div>
              </motion.div>
            ))}

            <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex items-center justify-between opacity-60">
               <div>
                 <div className="font-bold text-slate-400">大厂高频真题集合</div>
                 <div className="text-xs text-slate-500 mt-1">需在上一次全真模拟中获取 B+ 以上评分解锁</div>
               </div>
               <Lock size={18} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
