import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Priority, Recurrence } from '../../types';
import { Plus, Calendar, Flag, Clock } from 'lucide-react';

interface QuickAddBarProps {
  defaultCategory?: string;
  defaultDueDate?: string;
  defaultProjectId?: string;
  placeholder?: string;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  defaultCategory = 'Study',
  defaultDueDate,
  defaultProjectId,
  placeholder = 'Add a new task... (e.g. Finish physics lab report) - press Enter',
}) => {
  const { createTask, categories } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(defaultCategory);
  const [dueDate, setDueDate] = useState(
    defaultDueDate || new Date().toISOString().split('T')[0]
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    await createTask({
      title: title.trim(),
      priority,
      category,
      dueDate,
      estimatedMinutes,
      projectId: defaultProjectId,
      subtasks: [],
      recurrence: 'none' as Recurrence,
    });

    setTitle('');
    setIsExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-all shrink-0"
        >
          Add
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category dropdown */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority selection */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Date picker */}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Calendar className="w-3 h-3 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Estimated minutes */}
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Clock className="w-3 h-3 text-slate-400" />
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
                className="w-10 bg-transparent text-xs focus:outline-none text-slate-700 dark:text-slate-200"
              />
              <span>m</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Collapse
          </button>
        </div>
      )}
    </form>
  );
};
