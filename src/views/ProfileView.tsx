import React from 'react';
import { Settings, History, Bookmark, RefreshCw, FileCode, ChevronRight, Fingerprint, Crown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProfileView() {
  const { navigate } = useAppContext();

  return (
    <div className="h-full overflow-y-auto pb-safe bg-[var(--bg-primary)] relative transition-colors duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Futuristic Profile Header */}
      <div className="pt-12 pb-8 px-6 flex items-center gap-6 relative z-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-hexagon bg-[var(--bg-secondary)] border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] p-1 hexagon flex items-center justify-center">
            <div className="w-full h-full bg-[var(--bg-primary)] rounded-hexagon hexagon flex items-center justify-center overflow-hidden">
               <Fingerprint className="text-cyan-400 opacity-80" size={40} />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1 rounded-sm border border-slate-900">
             <Crown size={12} className="text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-wide mb-1 transition-colors duration-300">USER_77073</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-cyan-400 border border-cyan-900 bg-cyan-950/50 px-2 py-0.5 rounded">Lvl 45</span>
            <span className="text-[var(--text-secondary)] uppercase tracking-widest transition-colors duration-300">Frontend Architect (前端架构师)</span>
          </div>
        </div>
      </div>

      {/* Cyber Stats */}
      <div className="px-6 mb-8">
        <div className="tech-glass tech-border-glow rounded-xl p-4 flex divide-x divide-slate-800/80 transition-colors duration-300">
          <div className="flex-1 text-center">
            <div className="text-xl font-mono font-bold">24</div>
            <div className="text-[10px] text-slate-500 uppercase leading-tight mt-1">Simulations<br className="sm:hidden"/>(模拟数)</div>
          </div>
          <div className="flex-1 text-center border-slate-800/80">
            <div className="text-xl font-mono font-bold text-emerald-400">92%</div>
            <div className="text-[10px] text-slate-500 uppercase leading-tight mt-1">Avg Score<br className="sm:hidden"/>(平均分)</div>
          </div>
          <div className="flex-1 text-center border-slate-800/80">
            <div className="text-xl font-mono font-bold text-amber-400">1.2k</div>
            <div className="text-[10px] text-slate-500 uppercase leading-tight mt-1">Questions<br className="sm:hidden"/>(刷题数)</div>
          </div>
        </div>
      </div>

      {/* Subsystems */}
      <div className="px-6 space-y-4 relative z-10 w-full overflow-hidden">
        <h3 className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest pl-1 mb-2">Subsystems / 子系统</h3>
        
        <div className="space-y-3">
           <ListRow icon={<History className="text-blue-400" size={20} />} title="历史面试归档" desc="回溯过去的心电/语音/打分数据" onClick={() => navigate('report')} />
           <ListRow icon={<FileCode className="text-emerald-400" size={20} />} title="结构化简历库" desc="管理同步至云端的多版本简历" onClick={() => navigate('resume-library')} />
           <ListRow icon={<Bookmark className="text-amber-400" size={20} />} title="全网收藏节点" desc="猎头与直招岗位的观测点" />
        </div>
      </div>

      <div className="px-6 mt-8 space-y-4 relative z-10 w-full">
        <h3 className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest pl-1 mb-2">System Config / 系统配置</h3>
         <div className="space-y-3 pb-8">
           <ListRow icon={<RefreshCw className="text-slate-400" size={20} />} title="清除本地缓存" />
           <ListRow icon={<Settings className="text-slate-400" size={20} />} title="核心偏好设置" />
        </div>
      </div>
    </div>
  );
}

function ListRow({ icon, title, desc, onClick }: { icon?: React.ReactNode, title: string, desc?: string, onClick?: () => void }) {
  return (
    <button 
      className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)]/50 border border-[var(--panel-border)] rounded-xl hover:border-cyan-500/30 hover:bg-[var(--bg-secondary)]/80 transition-all text-left group shadow-sm" 
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 p-2 bg-[var(--bg-primary)] rounded-lg group-hover:bg-cyan-950/30 transition-colors">{icon}</div>
        <div>
          <div className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{title}</div>
          {desc && <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{desc}</div>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-600 group-hover:text-cyan-400" />
    </button>
  );
}
