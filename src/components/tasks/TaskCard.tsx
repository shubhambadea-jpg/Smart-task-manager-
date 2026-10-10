import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Task, Priority } from '../../types';
import {
  Check,
  Calendar,
  Clock,
  Flag,
  MoreVertical,
  Timer,
  Copy,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Folder,
} from 'lucide-react';
import { formatLocalDate, formatFriendlyDate } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const {
    toggleTaskComplete,
    toggleSubtask,
    deleteTask,
    duplicateTask,
    openTaskModal,
    startPomodoroForTask,
    projects,
  } = useTasks();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const todayStr = formatLocalDate();
  const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'completed';
  const isToday = task.dueDate === todayStr && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  const project = projects.find((p) => p.id === task.projectId);

  const priorityConfigs: Record<Priority, { label: string; color: string; iconColor: string }> = {
    urgent: { label: 'Urgent', color: 'text-rose-600 dark:text-rose-400 font-semibold', iconColor: 'text-rose-600 fill-rose-500/20' },
    high: { label: 'High', color: 'text-amber-600 dark:text-amber-400 font-medium', iconColor: 'text-amber-600 fill-amber-500/20' },
    medium: { label: 'Medium', color: 'text-blue-600 dark:text-blue-400', iconColor: 'text-blue-500' },
    low: { label: 'Low', color: 'text-slate-500 dark:text-slate-400', iconColor: 'text-slate-400' },
  };

  const priorityMeta = priorityConfigs[task.priority] || priorityConfigs.medium;

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;

  const formatDateDisplay = (dateStr: string) => {
    return formatFriendlyDate(dateStr);
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-80'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-800 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      } p-3.5 sm:p-4`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Checkbox */}
        <button
          onClick={() => toggleTaskComplete(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
            isCompleted
              ? 'bg-indigo-600 text-white'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-transparent'
          }`}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => openTaskModal(task)}
              className={`text-sm font-semibold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions Trigger */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:opacity-100"
                aria-label="Task options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-6 z-40 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg py-1 text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openTaskModal(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        startPomodoroForTask(task.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span>Focus Session</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        duplicateTask(task.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        deleteTask(task.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Task</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description Snippet */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Unboxed Metadata (Follows zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Priority Indicator */}
            <div className={`flex items-center gap-1 ${priorityMeta.color}`}>
              <Flag className={`w-3 h-3 ${priorityMeta.iconColor}`} />
              <span>{priorityMeta.label}</span>
            </div>

            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>

            {/* Category */}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {task.category}
            </span>

            {/* Project if assigned */}
            {project && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                  <Folder className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{project.name}</span>
                </span>
              </>
            )}

            {/* Due Date Indicator */}
            {task.dueDate && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span
                  className={`flex items-center gap-1 ${
                    isOverdue
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : isToday
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateDisplay(task.dueDate)}</span>
                  {task.dueTime && <span>{task.dueTime}</span>}
                </span>
              </>
            )}

            {/* Estimated Duration */}
            {task.estimatedMinutes > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.estimatedMinutes}m</span>
                </span>
              </>
            )}

            {/* Subtask toggle badge button */}
            {totalSubtasksCount > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <span>
                    {completedSubtasksCount}/{totalSubtasksCount} subtasks
                  </span>
                  {showSubtasks ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Subtasks Expanded List */}
          {showSubtasks && totalSubtasksCount > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 pl-1">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtask(task.id, sub.id)}
                  className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 py-0.5"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                      sub.completed
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
