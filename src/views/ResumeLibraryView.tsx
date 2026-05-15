import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Edit3, Trash2, ChevronRight, Plus, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function ResumeLibraryView() {
  const { navigate } = useAppContext();
  
  const [resumes, setResumes] = useState([
    { id: 1, name: '前端开发_张三_2024.pdf', date: '2024-03-12', target: '通用大厂前端', tags: ['React', '通用'] },
    { id: 2, name: '前端架构师_深度定制版.docx', date: '2024-05-10', target: '字节跳动/架构师', tags: ['架构', '性能优化', '定制版'] },
  ]);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] overflow-y-auto pb-safe">
      <header className="p-4 sm:p-6 sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur border-b border-cyan-900/30">
        <button 
          onClick={() => navigate('profile')} 
          className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 mb-4 transition-colors p-2 -ml-2 rounded-lg hover:bg-cyan-500/10 w-fit"
        >
          <ArrowLeft size={20} />
          <span className="text-xs font-mono tracking-widest uppercase">BACK / 个人中心</span>
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
              <FileText className="text-cyan-400" size={28} />
              结构化简历库
            </h1>
            <p className="text-xs text-slate-400 mt-2">云端同步多版本简历，针对不同 JD 深度定制与回溯。</p>
          </div>
          <button 
            onClick={() => navigate('resume-parser')}
            className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4">
        <AnimatePresence>
          {resumes.map(resume => (
            <motion.div 
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-secondary)]/50 border border-slate-800 rounded-xl p-4 tech-glass relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400" title="编辑/优化"><Edit3 size={16}/></button>
                 <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-emerald-400" title="下载"><Download size={16}/></button>
                 <button className="p-2 bg-slate-800 hover:bg-red-900/50 rounded text-rose-400" title="删除"><Trash2 size={16}/></button>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{resume.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">{resume.date}</span>
                    <span className="text-[10px] text-cyan-500/70 border border-cyan-900 px-1 rounded">Target: {resume.target}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {resume.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                 <button 
                   onClick={() => navigate('resume-parser')}
                   className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                 >
                   <ScanFace size={14}/> 进行 ATS 诊断分析
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
