import React, { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import { formatLocalDate } from '../../utils/dateUtils';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, categories, settings } = useTasks();

  const todayStr = formatLocalDate();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  );

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  // Total Focus Minutes
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // 14-Day Completion Velocity (AreaChart)
  const fourteenDayTrend = useMemo(() => {
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatLocalDate(d);
      const label = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      const count = completedTasks.filter(
        (t) => t.completedAt && formatLocalDate(new Date(t.completedAt)) === dStr
      ).length;
      data.push({
        date: label,
        Completed: count,
      });
    }
    return data;
  }, [completedTasks]);

  // Category Distribution (PieChart)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    const palette = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    return Object.keys(counts).map((catName, idx) => ({
      name: catName,
      value: counts[catName],
      color: palette[idx % palette.length],
    }));
  }, [tasks]);

  // Priority Distribution (BarChart)
  const priorityData = useMemo(() => {
    const priorities = ['urgent', 'high', 'medium', 'low'] as const;
    return priorities.map((p) => {
      const total = tasks.filter((t) => t.priority === p).length;
      const done = tasks.filter((t) => t.priority === p && t.status === 'completed').length;
      return {
        priority: p.charAt(0).toUpperCase() + p.slice(1),
        Total: total,
        Completed: done,
      };
    });
  }, [tasks]);

  // Peak productivity day calculation
  const peakDayName = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const dayIdx = new Date(t.completedAt).getDay();
        dayCounts[dayIdx]++;
      }
    });
    const maxIdx = dayCounts.indexOf(Math.max(...dayCounts));
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[maxIdx] || 'Wednesday';
  }, [completedTasks]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Productivity Analytics & Trends
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on task completion velocity, focus hours, and priority distribution.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {completedTasks.length} of {totalTasks} finished
          </div>
        </div>

        {/* Deep Focus Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Focus Logged</span>
            <Timer className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalFocusHours}h</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {focusSessions.length} Pomodoro sessions
          </div>
        </div>

        {/* Overdue Risk */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {overdueTasks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Past scheduled deadline</div>
        </div>

        {/* Peak Velocity Day */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Peak Output Day</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{peakDayName}</div>
          <div className="text-[11px] text-slate-400 mt-1">Highest completion rate</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 14-Day Completion Velocity Trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>14-Day Task Completion Trend</span>
            </h3>
            <p className="text-xs text-slate-500">
              Daily volume of completed assignments and milestones
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fourteenDayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: settings.theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Completed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (BarChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Priority Breakdown: Total vs Completed</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution across urgency tiers</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="priority" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: settings.theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: settings.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (PieChart) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Workload by Category</span>
            </h3>
            <p className="text-xs text-slate-500">Proportional task allocation</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-slate-400">No categories found</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Focus Sessions History */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Recent Pomodoro Focus Sessions</span>
              </h3>
              <p className="text-xs text-slate-500">Latest recorded deep-work blocks</p>
            </div>

            {focusSessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No focus sessions recorded yet. Launch the Pomodoro timer to start logging!
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {focusSessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                        {s.taskTitle || 'General Focus Session'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(s.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded shrink-0">
                      +{s.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
