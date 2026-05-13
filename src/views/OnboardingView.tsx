import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Zap, Network, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

const STEPS = [
  {
    id: 'welcome',
    icon: <Cpu className="text-cyan-400" size={48} />,
    title: '系统接入: NEXUS_AI',
    subtitle: 'SYSTEM_BOOT_SEQUENCE / 启动序列',
    description: '欢迎使用 Nexus AI 面试领航员。我们通过神经链路技术，为您提供最真实的面试仿真与职业数据分析。',
    accent: 'cyan'
  },
  {
    id: 'interview',
    icon: <Zap className="text-emerald-400" size={48} />,
    title: '仿真面试引擎',
    subtitle: 'REALITY_SIMULATION / 拟真引擎',
    description: '全真 AI 面试官对话，覆盖大厂真实面试流程、压力测试与实时语音响应，让您在实战前已胸有成竹。',
    accent: 'emerald'
  },
  {
    id: 'jd-match',
    icon: <Network className="text-blue-400" size={48} />,
    title: '岗位置信分析',
    subtitle: 'PATH_CALIBRATION / 路径校准',
    description: '深度解析职位描述 (JD)，精准匹配简历差距，并根据企业真实流程定制专属面试拓扑。',
    accent: 'blue'
  },
  {
    id: 'ready',
    icon: <ShieldCheck className="text-amber-400" size={48} />,
    title: '就绪指令下达',
    subtitle: 'DEPLOYMENT_READY / 部署就绪',
    description: '数据矩阵已就绪，神经链路连接稳定。准备好开启您的职场进化之旅了吗？',
    accent: 'amber'
  }
];

export default function OnboardingView() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAppContext();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            {/* Icon Hexagon Container */}
            <div className="mb-8 relative flex justify-center">
              <div className={cn(
                "w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500",
                step.accent === 'cyan' && "bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]",
                step.accent === 'emerald' && "bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
                step.accent === 'blue' && "bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
                step.accent === 'amber' && "bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              )}>
                <div className="absolute inset-0 rounded-2xl border border-white/10 tech-glass"></div>
                {step.icon}
              </div>
              
              {/* Spinning Ring */}
              <div className="absolute inset-0 animate-spin-slow pointer-events-none">
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-glow",
                  step.accent === 'cyan' && "bg-cyan-400",
                  step.accent === 'emerald' && "bg-emerald-400",
                  step.accent === 'blue' && "bg-blue-400",
                  step.accent === 'amber' && "bg-amber-400"
                )}></div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white tracking-[0.1em] uppercase break-words px-4">
                {step.title}
              </h2>
              <div className={cn(
                "inline-block px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest border transition-colors",
                step.accent === 'cyan' && "text-cyan-400 border-cyan-500/30 bg-cyan-950/40",
                step.accent === 'emerald' && "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
                step.accent === 'blue' && "text-blue-400 border-blue-500/30 bg-blue-950/40",
                step.accent === 'amber' && "text-amber-400 border-amber-500/30 bg-amber-950/40"
              )}>
                {step.subtitle}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mt-4">
                {step.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-12">
        {STEPS.map((_, idx) => (
          <div 
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === currentStep ? "w-8 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]" : "w-2 bg-slate-800"
            )}
          />
        ))}
      </div>

      {/* Action Button */}
      <div className="relative z-10 pb-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={cn(
            "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest text-sm transition-all duration-300 relative overflow-hidden group",
            currentStep === STEPS.length - 1 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]" 
              : "bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          )}
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              INITIALIZE_SYSTEM / 立即进入系统
              <Play size={18} fill="currentColor" />
            </>
          ) : (
            <>
              NEXT_FRAGMENT / 下一步
              <ArrowRight size={18} />
            </>
          )}
          
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </motion.button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text-glow {
          text-shadow: 0 0 10px currentColor;
        }
        .shadow-glow {
          box-shadow: 0 0 10px currentColor;
        }
      `}} />
    </div>
  );
}
