import React, { useState } from 'react';
import { BookOpen, Wrench, User, Mic, BrainCircuit, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppContext } from './context/AppContext';
import { cn } from './lib/utils';
import HomeView from './views/HomeView';
import ToolsView from './views/ToolsView';
import ProfileView from './views/ProfileView';
import InterviewConfigView from './views/InterviewConfigView';
import ActiveInterviewView from './views/ActiveInterviewView';
import ReportView from './views/ReportView';
import ResumeOptView from './views/ResumeOptView';
import CareerPlanView from './views/CareerPlanView';
import LearnView from './views/LearnView';
import QuestionBankView from './views/QuestionBankView';
import JdMatchView from './views/JdMatchView';
import OnboardingView from './views/OnboardingView';
import ThemeToggle from './components/ThemeToggle';

export default function MainLayout() {
  const { currentView, navigate } = useAppContext();

  const isImmersive = ['onboarding', 'active-interview', 'report', 'resume-opt', 'career-plan', 'jd-match'].includes(currentView);

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative selection:bg-cyan-500/30 transition-colors duration-300">
      
      {/* Side Navigation Rail (Desktop/Tablet) */}
      {!isImmersive && (
        <nav className="hidden sm:flex flex-col w-20 lg:w-64 border-r border-cyan-900/30 bg-[var(--bg-secondary)]/50 tech-glass z-50">
          <div 
            onClick={() => navigate('home')}
            className="p-6 mb-8 flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform duration-500">
              <BrainCircuit size={20} className="text-slate-900" />
            </div>
            <h1 className="hidden lg:block text-sm font-bold tracking-[0.2em] transition-colors duration-500 font-mono">NEXUS AI</h1>
          </div>

          <div className="flex-1 flex flex-col px-3 gap-2">
            <SideNavItem 
              icon={<Home size={24} />} 
              label="系统控制台" 
              isActive={currentView === 'home'} 
              onClick={() => navigate('home')} 
            />
            <SideNavItem 
              icon={<Wrench size={24} />} 
              label="工具 & 文档" 
              isActive={currentView === 'tools' || currentView === 'learn'} 
              onClick={() => navigate('tools')} 
            />
            <SideNavItem 
              icon={<BrainCircuit size={24} />} 
              label="有针对性的刷题" 
              isActive={currentView === 'learn'} 
              onClick={() => navigate('learn')} 
            />
            <SideNavItem 
              icon={<User size={24} />} 
              label="个人中心" 
              isActive={currentView === 'profile'} 
              onClick={() => navigate('profile')} 
            />
            
            <div className="mt-auto mb-2 border-t border-cyan-900/10 pt-4">
               <ThemeToggle />
            </div>
          </div>

          <div className="p-4 mb-4">
            <button 
              onClick={() => navigate('interview-config')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              <Mic size={22} className="group-hover:scale-110 transition-transform" />
              <span className="hidden lg:block font-bold">开启仿真面试</span>
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        <div className="flex-1 relative w-full h-full">
          <div className="absolute inset-0 flex justify-center">
            {/* Phone Frame Guide for Visual Consistency (Optional/Hidden on very large screens) */}
            <div className="w-full max-w-md h-full relative z-10 sm:border-x sm:border-cyan-900/10 sm:bg-[var(--bg-primary)]/30 transition-colors duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                >
                  {currentView === 'onboarding' && <OnboardingView />}
                  {currentView === 'home' && <HomeView />}
                  {currentView === 'tools' && <ToolsView />}
                  {currentView === 'learn' && <LearnView />}
                  {currentView === 'profile' && <ProfileView />}
                  {currentView === 'interview-config' && <InterviewConfigView />}
                  {currentView === 'active-interview' && <ActiveInterviewView />}
                  {currentView === 'report' && <ReportView />}
                  {currentView === 'resume-opt' && <ResumeOptView />}
                  {currentView === 'career-plan' && <CareerPlanView />}
                  {currentView === 'jd-match' && <JdMatchView />}
                  {currentView === 'question-bank' && <QuestionBankView />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Navigation (Mobile Only) */}
        {!isImmersive && (
          <div className="sm:hidden z-50 w-full tech-glass border-t border-cyan-900/30 pb-safe shrink-0">
            <div className="flex justify-around items-center px-1 py-3">
              <NavItem 
                icon={<Home size={22} />} 
                label="首页" 
                isActive={currentView === 'home'} 
                onClick={() => navigate('home')} 
              />
              <NavItem 
                icon={<Wrench size={22} />} 
                label="工具箱" 
                isActive={currentView === 'tools' || currentView === 'learn'} 
                onClick={() => navigate('tools')} 
              />
              
              {/* Center Big Button */}
              <div className="relative -top-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('interview-config')}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 p-4 rounded-hexagon shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all tech-border-glow hexagon flex items-center justify-center relative group"
                >
                  <div className="absolute inset-0 rounded-hexagon bg-cyan-400 opacity-0 group-hover:opacity-50 blur-md transition-opacity"></div>
                  <Mic size={28} className="relative z-10" />
                </motion.button>
              </div>

              <NavItem 
                icon={<BrainCircuit size={22} />} 
                label="刷题" 
                isActive={currentView === 'learn'} 
                onClick={() => navigate('learn')} 
              />
              <NavItem 
                icon={<User size={22} />} 
                label="我的" 
                isActive={currentView === 'profile'} 
                onClick={() => navigate('profile')} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SideNavItem({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group",
        isActive 
          ? "bg-cyan-500/15 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" 
          : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
      )}
    >
      <div className={cn(
        "transition-all duration-300",
        isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-slate-500 group-hover:text-slate-300"
      )}>
        {icon}
      </div>
      <span className={cn(
        "hidden lg:block text-sm font-bold tracking-widest uppercase transition-all duration-300",
        isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
      )}>
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="side-nav-indicator" 
          className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,1)]" 
        />
      )}
    </button>
  );
}

function NavItem({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all duration-300 px-3 py-1 rounded-xl",
        isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
      )}
    >
      <motion.div
        animate={isActive ? { y: -2 } : { y: 0 }}
        className="relative"
      >
        <div className={isActive ? "drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : ""}>
          {icon}
        </div>
        {isActive && (
          <motion.div layoutId="nav-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
        )}
      </motion.div>
      <span className={cn("text-[10px] font-medium tracking-wider", isActive && "text-glow")}>{label}</span>
    </button>
  );
}
