import React, { useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { CalendarClock, Plus, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { formatLocalDate } from '../../utils/dateUtils';

export const UpcomingView: React.FC = () => {
  const { tasks, openTaskModal } = useTasks();

  const today = new Date();
  const todayStr = formatLocalDate(today);

  // Group tasks into:
  // Tomorrow, Day +2, Day +3, Next 7 Days, and Later
  const groupedTasks = useMemo(() => {
    const groups: Array<{ label: string; dateStr: string; tasks: Task[] }> = [];

    // Next 7 days
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dStr = formatLocalDate(d);

      let label = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      if (i === 1) label = `Tomorrow (${label})`;

      const matchingTasks = tasks.filter(
        (t) => t.dueDate === dStr && t.status !== 'completed'
      );

      groups.push({
        label,
        dateStr: dStr,
        tasks: matchingTasks,
      });
    }

    // Beyond 7 days
    const seventhDay = new Date(today);
    seventhDay.setDate(today.getDate() + 7);
    const seventhDayStr = formatLocalDate(seventhDay);

    const laterTasks = tasks.filter(
      (t) => t.dueDate && t.dueDate > seventhDayStr && t.status !== 'completed'
    );

    if (laterTasks.length > 0) {
      groups.push({
        label: 'Later & Beyond',
        dateStr: '',
        tasks: laterTasks,
      });
    }

    return groups;
  }, [tasks, today]);

  const totalUpcoming = groupedTasks.reduce((acc, g) => acc + g.tasks.length, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Upcoming Deadlines ({totalUpcoming})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks scheduled across the next seven days and beyond.
          </p>
        </div>

        <button
          onClick={() => openTaskModal()}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Date Groups */}
      <div className="space-y-6">
        {groupedTasks.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{group.label}</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({group.tasks.length})
                </span>
              </h3>

              {group.dateStr && (
                <button
                  onClick={() => openTaskModal(undefined, group.dateStr)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add for date</span>
                </button>
              )}
            </div>

            {group.tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-2 italic pl-1">
                No tasks scheduled for this day.
              </p>
            ) : (
              <div className="space-y-2">
                {group.tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
