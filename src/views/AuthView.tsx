import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Smartphone, Key, User, Target, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function AuthView() {
  const { navigate } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (!phone || phone.length !== 11) {
      alert("请输入有效的11位手机号");
      return;
    }
    setIsCodeSent(true);
    setCountdown(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !code || (!isLogin && !name)) return;
    
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    
    // Save mock token & navigate
    localStorage.setItem('nexus_auth_token', 'mock_token_' + Date.now());
    const hasSeenOnboarding = localStorage.getItem('nexus_onboarding_seen');
    navigate(hasSeenOnboarding ? 'home' : 'onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.2)] relative">
            <Zap className="text-cyan-400 absolute w-8 h-8 opacity-50 blur-sm" />
            <Target className="text-cyan-400 w-8 h-8 relative z-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-mono tracking-wider">CAREER NEXUS.</h1>
          <p className="text-slate-500 text-sm mt-2">The Ultimate AI Interview Terminal</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <div className="flex mb-8 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              登录
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                !isLogin ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.9 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">用户名</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-600" />
                    </div>
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                      placeholder="Your Name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">手机号 (Phone Number)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone size={16} className="text-slate-600" />
                </div>
                <input 
                  type="tel" 
                  maxLength={11}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  placeholder="13800138000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-500 mb-1 ml-1">验证码 (Verification Code)</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key size={16} className="text-slate-600" />
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                    placeholder="123456"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-xs font-mono whitespace-nowrap transition-all",
                    countdown > 0 
                      ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed" 
                      : "bg-cyan-950/30 border-cyan-800/50 text-cyan-500 hover:bg-cyan-900/50 hover:text-cyan-400"
                  )}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{isLogin ? '系统登入 (LOGIN)' : '建立档案 (REGISTER)'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      
      <div className="absolute bottom-4 text-xs font-mono text-slate-600 text-center w-full">
        v2.4.0_alpha / AI-DRIVEN SYSTEM SECURED
      </div>
    </div>
  );
}
