import React from 'react';
import { FileCode, Compass, Briefcase, FileSearch, Link2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function ToolsView() {
  const { navigate } = useAppContext();

  return (
    <div className="p-6 h-full overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] pb-32 transition-colors duration-300">
      <header className="pt-2 pb-6 border-b border-cyan-900/10 mb-8 sticky top-0 bg-[var(--bg-primary)]/80 backdrop-blur z-10 flex flex-col transition-colors duration-300">
        <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] uppercase break-words font-mono">Tool_Nexus / 工具枢纽</h1>
        <div className="w-8 h-0.5 mt-2 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] opacity-80"></div>
      </header>

      <div className="space-y-8">
        {tools.map((section, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
          >
            <h2 className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2 pl-1">
              <Link2 size={12}/> {section.category}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {section.items.map((tool, i) => (
                <button 
                  key={i}
                  onClick={() => tool.route && navigate(tool.route as any)}
                  className="w-full flex items-center gap-4 p-4 tech-glass border border-[var(--panel-border)] rounded-xl hover:border-cyan-500/50 transition-all text-left group relative overflow-hidden shadow-sm hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
                  
                  <div className={`p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--panel-border)] text-${tool.color}-400 shrink-0 group-hover:border-${tool.color}-500/30 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all`}>
                    {tool.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-[15px] font-bold tracking-wide font-sans mb-1 flex items-center justify-between transition-colors duration-300">
                      {tool.title}
                      {tool.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-rose-500/50 bg-rose-500/10 text-rose-400 font-mono tracking-widest">BETA (测试)</span>
                      )}
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)] line-clamp-1 transition-colors duration-300">{tool.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const tools = [
  {
    category: 'KNOWLEDGE_CORE (知识核心)',
    items: [
      {
        icon: <BookOpen size={20} />,
        title: '面试知识库 / 文档',
        desc: '核心概念、模拟流程与岗位考点查阅',
        color: 'rose',
        route: 'questions'
      }
    ]
  },
  {
    category: 'IDENTITY_MATRIX (履历特征)',
    items: [
      {
        icon: <FileSearch size={20} />,
        title: 'ATS 简历透视扫描',
        desc: '底层结构分析，查找匹配度缺陷边界',
        color: 'cyan',
        route: 'resume-parser',
        badge: true
      },
      {
        icon: <FileCode size={20} />,
        title: 'STAR 架构重写',
        desc: '生成高通过率的结构化项目经历',
        color: 'emerald',
        route: 'resume-parser'
      }
    ]
  },
  {
    category: 'TARGET_SYNC (目标网关)',
    items: [
      {
        icon: <Compass size={20} />,
        title: '技能树推演算法',
        desc: '3-5 年深度职业晋升拓扑图生成',
        color: 'purple',
        route: 'career-plan'
      },
      {
        icon: <Briefcase size={20} />,
        title: '全栈 JD 匹配分析',
        desc: '对接各大平台解析所需核心维度',
        color: 'blue',
        route: 'jd-match'
      }
    ]
  }
];
