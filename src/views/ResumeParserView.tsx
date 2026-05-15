import React, { useState, useEffect } from 'react';
import { Upload, RefreshCcw, ChevronRight, ArrowLeft, CheckCircle2, AlertCircle, Bookmark, FileText, Bot, Download, X, Check, Search, Crosshair, HelpCircle, Target, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export default function ResumeParserView() {
  const { navigate, parsedResumeResult: result, setParsedResumeResult: setResult, parsedResumeFile: file, setParsedResumeFile: setFile, isParsingResume, setIsParsingResume, resumeParsingStep: parsingStep, setResumeParsingStep: setParsingStep, parseErrorMsg: errorMsg, setParseErrorMsg: setErrorMsg } = useAppContext();
  
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsParsingResume(true);
    setParsingStep(0);
    
    // Manage fake progress globally so component unmount doesn't stop it
    setTimeout(() => setParsingStep((prev: number) => Math.max(prev, 1)), 2500);
    setTimeout(() => setParsingStep((prev: number) => Math.max(prev, 2)), 8000);

    setErrorMsg(null);
    
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const base64Data = (e.target?.result as string).split(',')[1];
          const response = await fetch('/api/parse-resume-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              filename: file.name,
              content: base64Data 
            }),
          });
          
          if (!response.ok) {
            let errStr = "分析失败，请检查服务配置";
            try {
               const errText = await response.text();
               if (errText.includes('Cookie check')) {
                   throw new Error("平台鉴权拦截 (Cookie Check)：由于浏览器跨域限制或会话过期，API 请求被阻断。请刷新页面，或点击右上角「在新标签页中打开应用」后再试。");
               }
               try {
                 const errBody = JSON.parse(errText);
                 if (errBody.error) errStr = errBody.error + " " + JSON.stringify(errBody.fullError || "");
               } catch(e) { errStr = "Status " + response.status + ": " + errText.substring(0, 50); }
            } catch(e: any) {
               if (e.message && e.message.includes('Cookie check')) throw e;
            }
            throw new Error(errStr);
          }
          
          const responseText = await response.text();
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
             if (responseText.includes('Cookie check')) {
                throw new Error("平台鉴权拦截 (Cookie Check)：由于浏览器跨域限制或会话过期，API 请求被阻断。请刷新页面，或点击右上角「在新标签页中打开应用」后再试。");
             }
             throw new Error("Invalid JSON from server. Response starts with: " + responseText.substring(0, 100));
          }
          setResult(data);
        } catch (err: any) {
          setErrorMsg("ATS 解析失败：" + err.message);
        } finally {
          setIsParsingResume(false);
        }
      };
      fileReader.onerror = () => {
        setErrorMsg("ATS 解析失败：无法读取文件");
        setIsParsingResume(false);
      };
      fileReader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg("ATS 解析失败：" + err.message);
      setIsParsingResume(false);
    }
  };

  const applyFix = (id: string, isAccepted: boolean) => {
    setResult((prev: any) => {
      const nextDiag = { ...prev.diagnostics, [id]: { ...prev.diagnostics[id], accepted: isAccepted } };
      
      const nextDoc = prev.documentLines.map((line: any) => {
         if (line.id === id && isAccepted) {
            return { ...line, text: prev.diagnostics[id].suggested, highlight: 'resolved' };
         }
         if (line.id === id && !isAccepted) {
            return { ...line, highlight: 'dismissed' };
         }
         return line;
      });

      return { ...prev, diagnostics: nextDiag, documentLines: nextDoc };
    });
    setSelectedHighlight(null);
  };

  const handleExportDocx = async () => {
    if (!result) return;
    try {
      const paragraphs = result.documentLines.map((line: any) => {
        return new Paragraph({
          children: [new TextRun({ text: line.text, size: 24 })],
          spacing: { after: 200 }
        });
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "优化版本_穿透版.docx");
    } catch (e) {
      console.error("Export failed", e);
      alert("导出失败，请稍后重试");
    }
  };

  const hasPending = result ? Object.values(result.diagnostics).some((d: any) => d.accepted === null) : false;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between bg-[var(--bg-primary)]/80 backdrop-blur z-20 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('tools')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-cyan-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2"><ScanFace className="text-cyan-400" size={24}/> ATS 履历透视与纠偏</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">模拟大厂机器初筛算法，深度圈注缺陷并生成可落地的修改方案</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {!result ? (
          <div className="overflow-auto h-full p-6 flex flex-col justify-center">
            <div className="max-w-2xl mx-auto w-full">
              <div className="tech-glass p-8 rounded-2xl border border-slate-700 space-y-6 shadow-2xl min-h-[400px] flex flex-col justify-center">
                {isParsingResume ? (
                   <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-8">
                      <div className="relative w-28 h-28 flex items-center justify-center">
                         <div className="absolute inset-0 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin"></div>
                         <div className="absolute inset-2 border-4 border-emerald-500/10 border-b-emerald-400 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                         <Bot size={40} className="text-cyan-400 animate-pulse" />
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">执行底层透析中...</h3>
                        <p className="text-xs sm:text-sm text-cyan-400 font-mono animate-pulse opacity-80">正在扫描文本特征并应用 ATS 规则引擎，约需 15-30s</p>
                      </div>
                      
                      <div className="w-full max-w-sm mt-8 space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                         <div className={`flex items-center gap-3 text-sm ${parsingStep >= 0 ? 'text-emerald-400' : ''}`}>
                            {parsingStep > 0 ? <CheckCircle2 size={18} className="flex-none" /> : <span className="w-4 h-4 rounded-full border-2 border-emerald-500/50 border-t-emerald-400 animate-spin flex-none"></span>}
                            <span className="font-medium">1. 剥离简历排版格式，提取原始文本</span>
                         </div>
                         <div className={`flex items-center gap-3 text-sm transition-all duration-500 ${parsingStep >= 1 ? (parsingStep > 1 ? 'text-emerald-400' : 'text-cyan-300 opacity-100') : 'text-slate-500 opacity-50'}`}>
                            {parsingStep > 1 ? <CheckCircle2 size={18} className="flex-none" /> : (parsingStep === 1 ? <span className="w-4 h-4 rounded-full border-2 border-cyan-500/50 border-t-cyan-400 animate-spin flex-none"></span> : <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex-none bg-slate-800"></div>)}
                            <span className="font-medium">2. 机器初筛算法介入，诊断业务量化度</span>
                         </div>
                         <div className={`flex items-center gap-3 text-sm transition-all duration-500 ${parsingStep >= 2 ? 'text-cyan-300 opacity-100' : 'text-slate-500 opacity-50'}`}>
                            {parsingStep === 2 ? <span className="w-4 h-4 rounded-full border-2 border-cyan-500/50 border-t-cyan-400 animate-spin flex-none"></span> : <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex-none bg-slate-800"></div>}
                            <span className="font-medium">3. 深度圈注缺陷，生成靶向修复方案</span>
                         </div>
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl p-12 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all cursor-pointer group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Upload className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 mb-4 transition-colors relative z-10" />
                      <h3 className="text-lg font-bold text-slate-300 group-hover:text-white mb-1 relative z-10">丢入你的简历 (PDF/DOC/DOCX)</h3>
                      <p className="text-xs text-slate-500 relative z-10">系统将暂时剥离排版，直接扫描底层文本特征及其业务权重</p>
                      <label className="absolute inset-0 cursor-pointer z-20">
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                      </label>
                    </div>
                    {file && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-900 rounded-xl border border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <FileText className="text-emerald-500 shrink-0" size={28}/>
                           <div>
                             <div className="text-sm font-bold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{file.name}</div>
                             <div className="text-[10px] text-slate-500 font-mono">{(file.size/1024/1024).toFixed(2)} MB · 就绪等待扫描</div>
                           </div>
                        </div>
                        <button disabled={isParsingResume} onClick={handleUpload} className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:opacity-70 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                          {isParsingResume ? <RefreshCcw size={18} className="animate-spin" /> : <Bot size={18} />}
                          {isParsingResume ? "执行底层透析 (约30s)..." : "启动全卷宗 ATS 渗透"}
                        </button>
                      </motion.div>
                    )}
                    {errorMsg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm flex font-medium items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden w-full">
            
            {/* Left Column: Document View - Full height on desktop */}
            <div className="flex-none lg:flex-[1.5] lg:overflow-y-auto relative border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
                 <div className="absolute top-4 right-8 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded text-[10px] font-mono font-bold uppercase tracking-widest z-10 hidden sm:block">
                    Scanner Engine / 扫描引擎视图
                 </div>
                 <div className="bg-[#fdfcfb] text-slate-900 max-w-2xl mx-auto shadow-2xl min-h-[400px] lg:min-h-full mb-8 border border-slate-300 p-8 sm:p-14 text-sm font-sans leading-loose relative selection:bg-cyan-200 transition-all">
                    {result.documentLines.map((line: any, idx: number) => {
                       if (line.type === 'header') return <div key={idx} className="text-3xl font-black text-slate-800 text-center mb-1">{line.text}</div>;
                       if (line.type === 'contact') return <div key={idx} className="text-[11px] text-slate-500 text-center mb-8 pb-4 border-b border-slate-200">{line.text}</div>;
                       if (line.type === 'section') return <div key={idx} className="text-base font-black text-[#0f172a] border-l-4 border-[#0f172a] pl-3 mt-8 mb-4 bg-slate-100 py-1">{line.text}</div>;
                       if (line.type === 'spacer') return <div key={idx} className="h-2"></div>;
                       
                       // Normal content with potential highlights from ATS breakdown
                       if (line.highlight) {
                          let hlClass = "";
                          if (line.highlight === 'risk') hlClass = "bg-rose-500/20 border-b-2 border-rose-500 cursor-pointer hover:bg-rose-500/30 transition-colors text-rose-900";
                          if (line.highlight === 'warning') hlClass = "bg-amber-500/20 border-b-2 border-amber-500 cursor-pointer hover:bg-amber-500/30 transition-colors text-amber-900";
                          if (line.highlight === 'resolved') hlClass = "bg-emerald-50 text-emerald-800 border-none px-0 cursor-default";
                          if (line.highlight === 'dismissed') hlClass = "opacity-50 line-through decoration-slate-400";

                          const isSelected = selectedHighlight === line.id && (line.highlight === 'risk' || line.highlight === 'warning');

                          return (
                            <div key={idx} className={`mb-3 relative font-medium group ${idx === 0 ? 'text-2xl font-bold text-center text-slate-800 mb-6' : ''}`}>
                              <span 
                                onClick={() => {
                                   if (line.highlight === 'risk' || line.highlight === 'warning') {
                                      setSelectedHighlight(line.id);
                                   }
                                }}
                                className={`px-1 py-0.5 rounded cursor-pointer ${hlClass} ${isSelected ? 'ring-2 ring-rose-400 ring-offset-2' : ''}`}
                              >
                                {line.text}
                              </span>
                              {isSelected && <span className="absolute -left-6 top-1 text-rose-500 animate-pulse"><Crosshair size={18}/></span>}
                            </div>
                          )
                       }

                       return (
                         <div key={idx} className={`mb-3 relative text-slate-700 ${idx === 0 ? 'text-2xl font-bold text-center text-slate-800 mb-6' : ''}`}>
                           {line.text}
                         </div>
                       )
                    })}
                 </div>
            </div>

            {/* AI Fix Modal */}
            <AnimatePresence>
               {selectedHighlight && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-slate-900 border border-slate-700/80 p-6 rounded-2xl shadow-2xl max-w-lg w-full relative"
                     >
                        <button 
                           onClick={() => setSelectedHighlight(null)} 
                           className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
                        >
                           <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-2 mb-6">
                           <span className="w-2 h-6 bg-rose-500 rounded-sm inline-block"></span>
                           <h3 className="text-base font-bold text-slate-200">缺陷归因分析</h3>
                        </div>
                        
                        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 relative mb-4">
                           <AlertCircle className="absolute top-5 right-5 text-rose-500/50" size={24}/>
                           <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2 inline-block">Reason / 扣分机制</p>
                           <p className="text-sm text-slate-200 leading-relaxed font-medium">
                           {result.diagnostics[selectedHighlight].reason}
                           </p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-950/40 to-[#0b1120] p-5 rounded-2xl border border-emerald-900/50 relative overflow-hidden shadow-[0_0_30px_rgba(5,150,105,0.05)] mb-6">
                           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[40px] rounded-full"></div>
                           <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-3 border-b border-emerald-900 pb-2 inline-block relative z-10">AI Fix / 靶向重组文案</p>
                           <p className="text-sm text-emerald-100 leading-relaxed relative z-10 font-bold tracking-wide">
                           "{result.diagnostics[selectedHighlight].suggested}"
                           </p>
                        </div>

                        <div className="flex gap-4">
                           <button onClick={() => applyFix(selectedHighlight, false)} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors border border-slate-700 hover:border-slate-600">
                              <X size={16} className="inline mr-1 -mt-0.5"/> 忽略 (保留原样)
                           </button>
                           <button onClick={() => applyFix(selectedHighlight, true)} className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-transform active:scale-95 shadow-[0_5px_20px_rgba(5,150,105,0.3)]">
                              <Check size={16} className="inline mr-1 -mt-0.5"/> 采纳重写并覆盖
                           </button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
            
            {/* Right Column (or Top on Mobile): Dashboard & Fix Console */}
            <div className="flex flex-col flex-none lg:flex-[1.2] lg:min-h-0 w-full relative order-1 lg:order-2 bg-[#0b1120]">
               
               {/* Dashboard Section */}
               <div className="flex-none p-5 sm:p-6 lg:p-8 border-b border-slate-800 bg-slate-900 w-full z-20 shadow-lg lg:overflow-y-auto">
                   <h2 className="hidden lg:flex text-lg font-bold text-slate-100 mb-4 items-center gap-2">
                     <Target className="text-cyan-400" size={20}/> ATS 诊断图谱
                   </h2>
                   <div className="hidden lg:grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800 text-center ring-1 ring-white/5">
                         <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">关键词命中率</div>
                         <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">{result.atsMetrics.keywordMatch}%</div>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800 text-center ring-1 ring-white/5">
                         <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">逻辑可读性</div>
                         <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{result.atsMetrics.readability}%</div>
                      </div>
                      <div className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-rose-900/40 text-center ring-1 ring-rose-500/20 bg-rose-500/5">
                         <div className="text-[10px] text-rose-400/80 mb-1 uppercase font-bold">业务量化度(STAR)</div>
                         <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">{result.atsMetrics.starCompliance}%</div>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="text-xs text-slate-300 bg-cyan-950/40 p-4 rounded-xl border border-cyan-900/50 leading-relaxed shadow-inner">
                        <strong className="text-cyan-400 font-bold block mb-1">🔍 履历全局解析摘要：</strong>
                        <span className="opacity-90">{result.atsBasis?.issueSummary || "当前版本存在大量非标准化描述，缺乏数据化证明，导致大厂 ATS 评级过低。"}</span>
                      </div>
                      <div className="text-xs text-amber-500 font-bold pt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> 
                        请点击简历正文中的<span className="bg-rose-500/20 text-rose-400 px-1 mx-0.5 rounded border border-rose-500/30">红色</span>或<span className="bg-amber-500/20 text-amber-400 px-1 mx-0.5 rounded border border-amber-500/30">橙色</span>高亮文本块，展开始源修复。
                      </div>
                   </div>
               </div>

               <div className="flex-1 min-h-0 flex flex-col p-5 sm:p-6 lg:p-8 relative w-full shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,0.5)] justify-end">
                  <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="text-xs text-slate-500">全部修复完毕后可导出更新版本</div>
                     <button 
                       disabled={hasPending}
                       onClick={handleExportDocx}
                       className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${hasPending ? 'bg-slate-800/80 text-slate-600 cursor-not-allowed border border-slate-800' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transform hover:-translate-y-0.5'}`}
                     >
                       <Download size={18} />
                       {hasPending ? '清空警告后导出' : '导出穿透版 DOCX'}
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
