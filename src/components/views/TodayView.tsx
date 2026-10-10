import React, { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { QuickAddBar } from '../tasks/QuickAddBar';
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Flame,
} from 'lucide-react';
import { Priority } from '../../types';
import { formatLocalDate } from '../../utils/dateUtils';

export const TodayView: React.FC = () => {
  const { tasks, openTaskModal } = useTasks();

  const todayStr = formatLocalDate();

  // Today's tasks (sorted by priority weight, then due time)
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === todayStr)
      .sort((a, b) => {
        // Incomplete first
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;

        // Priority weight
        const weights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        const diff = weights[b.priority] - weights[a.priority];
        if (diff !== 0) return diff;

        // Due time
        if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
        return 0;
      });
  }, [tasks, todayStr]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  const completedTodayCount = todayTasks.filter((t) => t.status === 'completed').length;
  const pendingTodayCount = todayTasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Today&apos;s Focus
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · {pendingTodayCount} remaining, {completedTodayCount} completed
          </p>
        </div>

        <button
          onClick={() => openTaskModal(undefined, todayStr)}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task for Today</span>
        </button>
      </div>

      {/* Quick Add Bar prefilled with Today */}
      <QuickAddBar defaultDueDate={todayStr} placeholder="Add a task for today..." />

      {/* Overdue Warning Section */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Tasks Requiring Attention ({overdueTasks.length})</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* Today Tasks Section */}
      <div className="space-y-3">
        {todayTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tasks scheduled for today
            </p>
            <p className="text-xs">
              Enjoy your clear schedule, or add tasks to stay ahead of upcoming deadlines.
            </p>
          </div>
        ) : (
          todayTasks.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
};
