import React from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle,
  Timer,
} from 'lucide-react';

export const PomodoroModal: React.FC = () => {
  const {
    isPomodoroModalOpen,
    setIsPomodoroModalOpen,
    tasks,
    activePomodoroTaskId,
    pomodoroSecondsLeft,
    pomodoroMode,
    pomodoroIsRunning,
    pomodoroSessionsCount,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    settings,
    updateSettings,
  } = useTasks();

  if (!isPomodoroModalOpen) return null;

  const totalSecondsForMode =
    pomodoroMode === 'work'
      ? settings.pomodoroWorkMinutes * 60
      : pomodoroMode === 'short_break'
      ? settings.pomodoroShortBreakMinutes * 60
      : settings.pomodoroLongBreakMinutes * 60;

  const progressPercent = Math.max(
    0,
    Math.min(100, ((totalSecondsForMode - pomodoroSecondsLeft) / totalSecondsForMode) * 100)
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTask = tasks.find((t) => t.id === activePomodoroTaskId);

  // SVG circular ring calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Pomodoro Focus Timer
            </h2>
          </div>
          <button
            onClick={() => setIsPomodoroModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 text-xs font-semibold">
            <button
              onClick={() => resetPomodoro('work')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pomodoroMode === 'work'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Work ({settings.pomodoroWorkMinutes}m)
            </button>
            <button
              onClick={() => resetPomodoro('short_break')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pomodoroMode === 'short_break'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Short Break ({settings.pomodoroShortBreakMinutes}m)
            </button>
            <button
              onClick={() => resetPomodoro('long_break')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                pomodoroMode === 'long_break'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Long Break ({settings.pomodoroLongBreakMinutes}m)
            </button>
          </div>

          {/* Circular Countdown Progress Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              {/* Active Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                className={`transition-all duration-500 ${
                  pomodoroMode === 'work'
                    ? 'stroke-indigo-600 dark:stroke-indigo-500'
                    : pomodoroMode === 'short_break'
                    ? 'stroke-emerald-500'
                    : 'stroke-blue-500'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {formatTime(pomodoroSecondsLeft)}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">
                {pomodoroMode === 'work' ? 'Deep Work' : 'Recharge'}
              </span>
            </div>
          </div>

          {/* Associated Task Indicator */}
          {activeTask ? (
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-700 dark:text-indigo-300 font-medium max-w-xs text-center truncate">
              🎯 Focusing on: {activeTask.title}
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-400">
              No specific task linked · General session
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => resetPomodoro(pomodoroMode)}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {pomodoroIsRunning ? (
              <button
                onClick={pausePomodoro}
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startPomodoro}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4" />
                <span>Start Focus</span>
              </button>
            )}

            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-3 rounded-full border transition-colors ${
                settings.soundEnabled
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200'
              }`}
              title={settings.soundEnabled ? 'Sound alerts enabled' : 'Sound muted'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Session Counter */}
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>{pomodoroSessionsCount} sessions completed today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
