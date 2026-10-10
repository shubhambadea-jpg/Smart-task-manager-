import React, { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { QuickAddBar } from '../tasks/QuickAddBar';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
} from 'lucide-react';
import { formatLocalDate } from '../../utils/dateUtils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    setActiveView,
    openTaskModal,
    setIsAIModalOpen,
    streakDays,
    motivationalQuote,
    settings,
  } = useTasks();

  const todayStr = formatLocalDate();

  // Statistics calculation
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && formatLocalDate(new Date(t.completedAt)) === todayStr
  ).length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  ).length;
  const dueTodayTasks = tasks.filter(
    (t) => t.dueDate === todayStr && t.status !== 'completed'
  );

  const dailyGoalPercent = Math.min(
    100,
    Math.round((completedToday / Math.max(1, settings.dailyGoalTasks)) * 100)
  );

  // Weekly Productivity Chart Data (Past 7 days)
  const weeklyChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const completed = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && formatLocalDate(new Date(t.completedAt)) === dateStr
      ).length;

      const createdOrDue = tasks.filter(
        (t) => t.dueDate === dateStr && t.status !== 'completed'
      ).length;

      days.push({
        name: dayName,
        Completed: completed,
        Pending: createdOrDue,
      });
    }
    return days;
  }, [tasks]);

  // Upcoming deadlines (next 7 days excluding today)
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate > todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [tasks, todayStr]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Daily Focus & Motivation</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white leading-snug">
              &ldquo;{motivationalQuote.quote}&rdquo;
            </h2>
            <p className="text-xs text-indigo-200/90 mt-1 font-medium">
              — {motivationalQuote.author}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-xs flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Plan Generator</span>
            </button>
            <button
              onClick={() => openTaskModal()}
              className="px-3.5 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-2xl" />
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div
          onClick={() => setActiveView('tasks')}
          className="cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Tasks</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">In active registry</div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setActiveView('tasks')}
          className="cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">To do & in progress</div>
        </div>

        {/* Due Today */}
        <div
          onClick={() => setActiveView('today')}
          className="cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Due Today</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {dueTodayTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Scheduled for today</div>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => setActiveView('completed')}
          className="cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Done Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedToday}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Finished today</div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setActiveView('tasks')}
          className="cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1">Needs immediate review</div>
        </div>

        {/* Daily Goal Completion % */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Daily Goal</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dailyGoalPercent}%
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${dailyGoalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Visual Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Weekly Productivity Velocity</span>
              </h3>
              <p className="text-xs text-slate-500">
                Completed vs Pending items across the last 7 days
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              {streakDays} Day Streak 🔥
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upcoming Deadlines</span>
              </h3>
              <button
                onClick={() => setActiveView('upcoming')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming deadlines in the next 7 days!
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => openTaskModal(t)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                        {t.title}
                      </span>
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                        {t.dueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{t.category}</span>
                      <span>·</span>
                      <span className="capitalize">{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => openTaskModal()}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            + Add New Deadline
          </button>
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Today&apos;s Focus List ({dueTodayTasks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Tasks scheduled for today. Check off as you complete!
            </p>
          </div>
          <button
            onClick={() => setActiveView('today')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View dedicated Today view →
          </button>
        </div>

        {/* Quick Add Bar */}
        <QuickAddBar defaultDueDate={todayStr} placeholder="Quickly add a task for today..." />

        {/* Task Cards */}
        {dueTodayTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              All caught up for today!
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have no pending tasks due today. Add a new task above or explore upcoming tasks.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dueTodayTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
