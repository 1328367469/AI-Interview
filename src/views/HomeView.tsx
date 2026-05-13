import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Cpu, Database, ChevronRight, Mic, Sparkles, Settings, X, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { startSpeechToText, requestSpeechPermissions } from '../services/nativeService';

export default function HomeView() {
  const { 
    navigate, 
    messages, 
    setMessages, 
    userProfile, 
    setUserProfile, 
    dbStatus, 
    fetchData, 
    isRefreshing 
  } = useAppContext();
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>({});
  
  const userId = 'user_123'; // Mock user ID for now
  const endRef = useRef<HTMLDivElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  const isInitialMount = useRef(true);

  // Sync editing profile when settings modal opens or userProfile changes
  useEffect(() => {
    if (showSettings) {
      setEditingProfile(userProfile);
    }
  }, [showSettings, userProfile]);

  const handleSend = async () => {
    if (!inputValue.trim() || isAiThinking) return;
    
    // Create a new array from context messages to avoid potential stale closures if we use functional update below,
    // though functional update on context setter is fine.
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: inputValue };
    setMessages((prev: any) => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, userId, profileOverride: userProfile }) // use userProfile instead of editingProfile to avoid syncing issues
      });
      
      if (!res.ok) {
        throw new Error('网络请求失败');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const tempAiId = (Date.now() + 1).toString();
      
      setMessages((prev: any) => [...prev, { id: tempAiId, role: 'ai', content: '' }]);

      let buffer = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                 try {
                     const data = JSON.parse(line.slice(6));
                     const content = data.choices[0]?.delta?.content || "";
                     if (content) {
                       setMessages((prev: any) => prev.map((m: any) => m.id === tempAiId ? { ...m, content: m.content + content } : m));
                     }
                 } catch (e) {}
            }
          }
        }
      }
      
      // Fetch latest profile automatically after chat (in case it updated traits behind the scenes)
      fetchData();
    } catch (err: any) {
      setMessages((prev: any) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `> ERROR (故障): ${err.message || '无法连接到 AI 服务'}`
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const saveConfig = async () => {
    try {
      await fetch(`/api/profile/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: editingProfile })
      });
      setUserProfile(editingProfile);
      setShowSettings(false);
      
      // Also fetch in case we want to show anything else
      fetchData();
    } catch (err) {
      alert('保存失败');
    }
  };

  const prevMessagesLength = useRef(messages?.length || 0);

  useEffect(() => {
    if (isInitialMount.current) {
      endRef.current?.scrollIntoView({ behavior: 'auto' });
      isInitialMount.current = false;
    } else {
      const behavior = (messages?.length || 0) > prevMessagesLength.current ? 'smooth' : 'auto';
      endRef.current?.scrollIntoView({ behavior });
    }
    prevMessagesLength.current = messages?.length || 0;
  }, [messages]);

  const toggleListening = async () => {
    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const hasPermission = await requestSpeechPermissions();
    if (!hasPermission) {
      alert('无法获取麦克风权限');
      return;
    }

    setIsListening(true);
    const stop = await startSpeechToText((text) => {
      setInputValue(text);
    });
    
    if (stop) {
      stopListeningRef.current = stop;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] relative transition-colors duration-300">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-950/20 to-transparent pointer-events-none"></div>
      
      <header className="px-6 py-4 sticky top-0 z-20 tech-glass border-b border-cyan-900/20 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
           <Cpu className="text-cyan-400/80" size={18} />
           <h1 className="text-sm font-bold tracking-[0.25em] font-mono">NEXUS_AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0 opacity-80">
             <div className={cn(
               "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
               dbStatus === 'connected' ? "bg-emerald-400 text-emerald-400 animate-pulse" : 
               dbStatus === 'error' ? "bg-rose-400 text-rose-400" : "bg-slate-500 text-slate-500 animate-pulse"
             )}></div>
             <span className="text-[9px] text-slate-500 font-mono tracking-tighter whitespace-nowrap uppercase">
               DB_{dbStatus === 'connected' ? 'SYNC' : (dbStatus === 'error' ? 'FAIL' : 'INIT')}
             </span>
             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_#34d399] ml-2"></div>
             <span className="text-[9px] text-slate-500 font-mono tracking-tighter sm:tracking-normal whitespace-nowrap uppercase">LINK: ACTIVE</span>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={msg.id} 
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "px-4 py-3 rounded-xl text-[14px] leading-relaxed transition-colors duration-300",
              msg.role === 'user' 
                ? "bg-cyan-600 text-white rounded-br-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                : "bg-[var(--bg-secondary)] border border-[var(--panel-border)] text-[var(--text-primary)] rounded-bl-sm tech-glass w-full shadow-lg"
            )}>
              {msg.role === 'ai' ? (
                <div className="markdown-body transition-colors duration-300">
                  <Terminal size={14} className="inline-block mr-2 mb-0.5 text-cyan-500 opacity-70" />
                  <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                </div>
              ) : (
                msg.content
              )}
            </div>

            {msg.isActionable && msg.role === 'ai' && (
               <div className="mt-4 grid grid-cols-1 gap-2 w-full sm:w-80">
                 <ActionCard 
                   icon={<Cpu size={16} className="text-amber-400" />} 
                   title="INIT_SIMULATION (启动面试)" 
                   onClick={() => navigate('interview-config')} 
                 />
                 <ActionCard 
                   icon={<Database size={16} className="text-emerald-400" />} 
                   title="DATA_SYNC (精简简历)" 
                   onClick={() => navigate('resume-opt')} 
                 />
               </div>
            )}
          </motion.div>
        ))}
        <div ref={endRef} />
        {isAiThinking && (
          <div className="flex items-center gap-2 text-cyan-500 font-mono text-[10px] animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> THINKING... (AI 思考中)
          </div>
        )}
      </div>

      <div className="p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md border-t border-[var(--panel-border)] transition-colors duration-300">
        <div className="relative flex items-center bg-[var(--bg-secondary)] border border-[var(--panel-border)] rounded-lg overflow-hidden focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
          <div className="pl-3 pr-2 text-cyan-500 font-mono">&gt;</div>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isAiThinking ? "THINKING... (思考中)" : "TYPE_COMMAND / 输入..."}
            disabled={isAiThinking}
            className="w-full bg-transparent text-[var(--text-primary)] py-3.5 outline-none text-sm font-mono placeholder-slate-600 uppercase"
          />
          <button 
            onClick={inputValue.trim() ? handleSend : toggleListening}
            disabled={isAiThinking}
            className={cn(
              "px-4 transition-all duration-300 flex items-center justify-center border-l border-slate-800 h-full relative",
              inputValue.trim() ? "bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900" : (isListening ? "bg-rose-950/50 text-rose-400" : "bg-[var(--bg-secondary)] text-slate-600 hover:text-cyan-400")
            )}
          >
            {isListening && (
              <motion.div 
                layoutId="pulse"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-rose-500/20"
              />
            )}
            {isAiThinking ? <RefreshCw size={18} className="animate-spin text-cyan-400" /> : (inputValue.trim() ? <Send size={18} /> : (isListening ? <Sparkles size={18} className="animate-spin-slow" /> : <Mic size={18} />))}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--bg-secondary)] border border-[var(--panel-border)] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl tech-glass"
            >
              <div className="p-6 border-b border-[var(--panel-border)] flex justify-between items-center bg-[var(--bg-primary)]/50">
                <h3 className="text-sm font-bold tracking-widest font-mono flex items-center gap-2">
                  <Settings size={16} className="text-cyan-400" /> CONFIGURE_SYSTEM
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-rose-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">User Memory (系统认知)</div>
                    <button onClick={fetchData} disabled={isRefreshing} className="text-cyan-500 hover:text-cyan-300 transition-colors p-1 disabled:opacity-50" title="刷新认知结构">
                       <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                  </div>
                  <div className={cn("p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--panel-border)] space-y-4 transition-opacity duration-300", isRefreshing ? "opacity-50" : "opacity-100")}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">职业目标 / Profession</div>
                        <textarea
                          value={editingProfile.profession || ''}
                          onChange={(e) => setEditingProfile({...editingProfile, profession: e.target.value})}
                          className="w-full text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)]/50 border border-[var(--panel-border)] rounded-md p-3 outline-none focus:border-cyan-500/50 resize-y transition-colors placeholder:text-slate-600 custom-scrollbar"
                          rows={3}
                          placeholder="当前目标岗位..."
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">核心技能 / Skills</div>
                        <textarea
                          value={editingProfile.skills || ''}
                          onChange={(e) => setEditingProfile({...editingProfile, skills: e.target.value})}
                          className="w-full text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)]/50 border border-[var(--panel-border)] rounded-md p-3 outline-none focus:border-cyan-500/50 resize-y transition-colors placeholder:text-slate-600 custom-scrollbar"
                          rows={3}
                          placeholder="掌握的核心硬技能..."
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">教育经历 / Education</div>
                        <textarea
                          value={editingProfile.education || ''}
                          onChange={(e) => setEditingProfile({...editingProfile, education: e.target.value})}
                          className="w-full text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)]/50 border border-[var(--panel-border)] rounded-md p-3 outline-none focus:border-cyan-500/50 resize-y transition-colors placeholder:text-slate-600 custom-scrollbar"
                          rows={3}
                          placeholder="学校与学历信息..."
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">性格与偏好 / Traits</div>
                        <textarea
                          value={editingProfile.traits || ''}
                          onChange={(e) => setEditingProfile({...editingProfile, traits: e.target.value})}
                          className="w-full text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)]/50 border border-[var(--panel-border)] rounded-md p-3 outline-none focus:border-cyan-500/50 resize-y transition-colors placeholder:text-slate-600 custom-scrollbar"
                          rows={3}
                          placeholder="性格特征及用户习惯..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-primary)]/50 border-t border-[var(--panel-border)] flex justify-end gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={saveConfig}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                >
                  <Save size={14} /> SAVE_CHANGES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionCard({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]/80 border border-[var(--panel-border)] hover:border-cyan-500/50 active:scale-[0.98] transition-all text-left group shadow-sm"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[13px] font-mono font-bold text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">{title}</span>
      </div>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400" />
    </button>
  );
}
