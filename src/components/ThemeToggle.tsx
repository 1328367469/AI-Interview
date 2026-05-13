import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function ThemeToggle({ className, isCollapsed }: { className?: string; isCollapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group",
        "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300",
        className
      )}
      title={theme === 'light' ? '切换至暗黑模式' : '切换至明亮模式'}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <motion.div
           initial={false}
           animate={{ 
             scale: theme === 'dark' ? 1 : 0,
             rotate: theme === 'dark' ? 0 : 90,
             opacity: theme === 'dark' ? 1 : 0
           }}
           className="absolute"
        >
          <Moon size={24} />
        </motion.div>
        
        <motion.div
           initial={false}
           animate={{ 
             scale: theme === 'light' ? 1 : 0,
             rotate: theme === 'light' ? 0 : -90,
             opacity: theme === 'light' ? 1 : 0
           }}
           className="absolute"
        >
          <Sun size={24} />
        </motion.div>
      </div>

      {!isCollapsed && (
        <span className="hidden lg:block text-sm font-bold tracking-widest uppercase transition-all duration-300">
          {theme === 'dark' ? '暗黑模式' : '明亮模式'}
        </span>
      )}
    </button>
  );
}
