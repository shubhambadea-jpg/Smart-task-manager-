import React, { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { formatLocalDate, parseLocalDate, formatFriendlyDate } from '../../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { tasks, openTaskModal, settings } = useTasks();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatLocalDate());
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Navigation
  const prevPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatLocalDate(today));
  };

  // Build Month Calendar Matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = settings.weekStartsOn === 'monday'
      ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1)
      : firstDayOfMonth;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = formatLocalDate();

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    return days;
  }, [year, month, settings.weekStartsOn]);

  // Build Week View days (7 days starting Monday or Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const diff = settings.weekStartsOn === 'monday'
      ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
      : -dayOfWeek;

    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() + diff);

    const days = [];
    const todayStr = formatLocalDate();

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = formatLocalDate(d);
      days.push({
        date: d,
        dateStr: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: dStr === todayStr,
        tasks: tasks.filter((t) => t.dueDate === dStr),
      });
    }

    return days;
  }, [currentDate, tasks, settings.weekStartsOn]);

  // Tasks for selected date
  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const weekDayLabels = settings.weekStartsOn === 'monday'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500">
              {calendarMode === 'month' ? 'Monthly Calendar View' : 'Weekly Schedule View'} · Click any date to view or add tasks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                calendarMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                calendarMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openTaskModal(undefined, selectedDateStr)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {calendarMode === 'month' ? (
        /* MONTH VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="grid grid-cols-7 mb-2 text-center">
              {weekDayLabels.map((w, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1"
                >
                  {w}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = day.dateStr === selectedDateStr;
                const dayTasks = tasks.filter((t) => t.dueDate === day.dateStr);
                const pendingCount = dayTasks.filter((t) => t.status !== 'completed').length;
                const hasUrgent = dayTasks.some(
                  (t) => t.priority === 'urgent' && t.status !== 'completed'
                );

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                        : day.isToday
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                        : day.isCurrentMonth
                        ? 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        : 'border-transparent bg-slate-50/40 dark:bg-slate-950/30 opacity-40 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          day.isToday
                            ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px]'
                            : isSelected
                            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                            : day.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {pendingCount > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1 rounded ${
                            hasUrgent
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {pendingCount}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 mt-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[9px] truncate px-1 rounded ${
                            t.status === 'completed'
                              ? 'line-through text-slate-400 bg-slate-100 dark:bg-slate-800'
                              : t.priority === 'urgent'
                              ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-slate-400 pl-1 block">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatFriendlyDate(selectedDateStr)} ({selectedDateStr})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDateTasks.length} tasks scheduled for this day
                  </p>
                </div>
                <button
                  onClick={() => openTaskModal(undefined, selectedDateStr)}
                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                  title="Add task on this date"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs">No tasks scheduled on {selectedDateStr}.</p>
                  <button
                    onClick={() => openTaskModal(undefined, selectedDateStr)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add task for this day
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {selectedDateTasks.map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => openTaskModal(undefined, selectedDateStr)}
              className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              + Create Task on {selectedDateStr}
            </button>
          </div>
        </div>
      ) : (
        /* WEEK VIEW */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`p-3 rounded-2xl border flex flex-col min-h-[460px] transition-all ${
                day.isToday
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">
                    {day.dayName}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      day.isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openTaskModal(undefined, day.dateStr);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Add task on this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto">
                {day.tasks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-6">No tasks</p>
                ) : (
                  day.tasks.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
