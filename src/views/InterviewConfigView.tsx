import React, { useState } from 'react';
import { ArrowLeft, Play, Briefcase, Search, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function InterviewConfigView() {
  const { navigate } = useAppContext();
  
  const [type, setType] = useState('depth');
  const [duration, setDuration] = useState('30');
  const [targetRole, setTargetRole] = useState('高级产品经理');
  const [showJobModal, setShowJobModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    setTimeout(() => {
      navigate('active-interview');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto pb-48 relative">
      <header className="px-6 py-4 flex flex-col gap-3 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/10">
        <h1 className="text-sm font-bold text-white tracking-[0.2em] flex items-center gap-2.5 font-mono uppercase">
          <div className="w-1.5 h-4 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
          初始化系统
        </h1>
      </header>

      <div className="px-6 pt-6 space-y-8">
        
        {/* Job Selection (Modal Trigger) */}
        <section className="tech-glass p-5 rounded-2xl tech-border-glow">
           <label className="block text-xs font-mono text-cyan-500 uppercase tracking-widest mb-4">Target Role / 目标节点</label>
           
           <button 
             onClick={() => setShowJobModal(true)}
             className="w-full flex items-center justify-between bg-slate-900/80 border border-slate-700 p-4 rounded-xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all text-left group"
           >
             <div className="flex items-center gap-3">
               <Briefcase size={20} className="text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
               <div>
                  <div className="text-sm font-medium text-slate-100">{targetRole}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">点击切换节点领域</div>
               </div>
             </div>
             <ChevronRight size={18} className="text-slate-500 group-hover:text-cyan-400 shrink-0" />
           </button>
        </section>

        {/* Interview Type */}
        <section className="tech-glass p-5 rounded-2xl">
          <label className="block text-xs font-mono text-cyan-500 uppercase tracking-widest mb-4">Protocol / 验证协议</label>
          <div className="grid grid-cols-1 gap-3">
            <RadioRow active={type === 'depth'} onClick={() => setType('depth')} title="行业深度探测" desc="岗位核心技能与专业实战考核" />
            <RadioRow active={type === 'behavioral'} onClick={() => setType('behavioral')} title="行为表现分析" desc="职场软实力、沟通与价值观匹配" />
            <RadioRow active={type === 'stress'} onClick={() => setType('stress')} title="高压抗压测试" desc="模拟高强度冲突与突发状况应对" />
          </div>
        </section>

        {/* Duration */}
        <section className="tech-glass p-5 rounded-2xl">
          <label className="block text-xs font-mono text-cyan-500 uppercase tracking-widest mb-4">Duration / 持续时间</label>
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
             {[15, 30, 45].map((val) => (
               <button 
                 key={val}
                 onClick={() => setDuration(val.toString())}
                 className={cn(
                   "flex-1 py-2.5 text-[14px] font-medium rounded-lg transition-all font-mono",
                   duration === val.toString() 
                     ? "bg-cyan-950 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-800" 
                     : "text-slate-500 hover:text-slate-300"
                 )}
               >
                 {val}m
               </button>
             ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-[68px] sm:bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-10 pointer-events-none">
        <motion.button 
          whileHover={!isStarting ? { scale: 1.02 } : {}}
          whileTap={!isStarting ? { scale: 0.98 } : {}}
          onClick={handleStart}
          className={cn(
            "pointer-events-auto w-full text-white rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-[14px] sm:text-[16px] transition-all duration-300 relative overflow-hidden group mt-8 sm:mb-6",
            isStarting 
              ? "bg-cyan-400 scale-[1.02] animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.6)]" 
              : "bg-cyan-600 hover:bg-cyan-500 shadow-[0_4px_20px_rgba(6,182,212,0.4)]"
          )}
        >
          {!isStarting && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>}
          <Play size={18} fill="currentColor" className={isStarting ? "animate-bounce" : ""} />
          <span className="tracking-wider">{isStarting ? "INITIALIZING..." : "START_SIMULATION / 开始模拟"}</span>
        </motion.button>
      </div>

      {/* Modern Job Selector Modal */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
              <h3 className="text-lg font-bold text-white">选择目标领域</h3>
              <button onClick={() => setShowJobModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="搜索职位 (如: 后端工程师)" 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-6">
              <JobCategory 
                title="研发/工程" 
                jobs={['高级前端开发工程师', 'Java架构师', '数据分析师', '算法工程师', '测试开发']} 
                onSelect={(j) => { setTargetRole(j); setShowJobModal(false); }}
                selected={targetRole}
              />
              <JobCategory 
                title="产品/设计" 
                jobs={['高级产品经理', '用户增长PM', 'UI/UX设计师', '交互设计师', '内容策划']} 
                onSelect={(j) => { setTargetRole(j); setShowJobModal(false); }}
                selected={targetRole}
              />
              <JobCategory 
                title="职能/管理" 
                jobs={['人力资源总监', '财务审计', '行政总助', '法务顾问']} 
                onSelect={(j) => { setTargetRole(j); setShowJobModal(false); }}
                selected={targetRole}
              />
              <JobCategory 
                title="金牌/销售" 
                jobs={['区域销售经理', '大客户经理', '渠道总监', '售前咨询']} 
                onSelect={(j) => { setTargetRole(j); setShowJobModal(false); }}
                selected={targetRole}
              />
              <JobCategory 
                title="医疗/教研" 
                jobs={['主治医师', '教育顾问', '学术研究员', '课程研发']} 
                onSelect={(j) => { setTargetRole(j); setShowJobModal(false); }}
                selected={targetRole}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function RadioRow({ active, onClick, title, desc }: { active: boolean, onClick: () => void, title: string, desc: string }) {
  return (
    <button 
      className={cn(
        "w-full flex items-center p-4 text-left rounded-xl transition-all border",
        active ? "bg-cyan-950/40 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]" : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      )} 
      onClick={onClick}
    >
      <div className="flex-1">
        <div className={cn("text-[15px] font-bold mb-1 tracking-wide", active ? "text-cyan-400 text-glow" : "text-slate-300")}>{title}</div>
        <div className="text-[12px] text-slate-500">{desc}</div>
      </div>
      <div className={cn("shrink-0 ml-4 flex items-center justify-center w-5 h-5 rounded-sm border", active ? "border-cyan-400" : "border-slate-600")}>
        {active && <div className="w-2.5 h-2.5 bg-cyan-400 rounded-[1px] shadow-[0_0_8px_#22d3ee]" />}
      </div>
    </button>
  );
}

function JobCategory({ title, jobs, onSelect, selected }: { title: string, jobs: string[], onSelect: (j: string) => void, selected: string }) {
  return (
    <div>
      <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3 pl-1">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {jobs.map(job => (
          <button
            key={job}
            onClick={() => onSelect(job)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm transition-colors border",
              selected === job 
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
            )}
          >
            {job}
          </button>
        ))}
      </div>
    </div>
  );
}
