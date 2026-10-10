import React from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  Timer,
  Menu,
  Search,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    user,
    settings,
    updateSettings,
    openTaskModal,
    setIsAIModalOpen,
    setIsPomodoroModalOpen,
    pomodoroIsRunning,
    pomodoroSecondsLeft,
    pomodoroMode,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
  } = useTasks();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formatTimerMinSec = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Left: Mobile menu toggle & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>
              {getGreeting()}, {user.displayName?.split(' ')[0] || 'there'}!
            </span>
            {user.isDemo && (
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                Demo Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{formattedDate}</p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'tasks' && e.target.value.trim().length > 0) {
                setActiveView('tasks');
              }
            }}
            placeholder="Search tasks, descriptions, tags... (Press /)"
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pomodoro Quick Pill */}
        <button
          onClick={() => setIsPomodoroModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            pomodoroIsRunning
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
          title="Open Focus Timer"
        >
          <Timer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {pomodoroMode === 'work' ? 'Focus' : 'Break'}:
          </span>
          <span className="font-mono font-semibold">{formatTimerMinSec(pomodoroSecondsLeft)}</span>
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
          title="Smart AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Planner</span>
        </button>

        {/* Quick Add Task Button */}
        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition-all"
          title="Create New Task (N)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          aria-label="Toggle color theme"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile / Demo Indicator */}
        <div
          onClick={() => setActiveView('settings')}
          className="hidden md:flex items-center gap-2 pl-2 cursor-pointer group"
          title="Account Settings"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
