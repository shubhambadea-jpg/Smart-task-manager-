import React, { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  CheckCheck,
  RotateCcw,
  Trash2,
  Calendar,
  Search,
  AlertTriangle,
  Folder,
} from 'lucide-react';

export const CompletedView: React.FC = () => {
  const { tasks, restoreTask, deleteTask, clearCompletedTasks, projects } = useTasks();

  const [search, setSearch] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'completed')
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dateA = a.completedAt || a.updatedAt || '';
        const dateB = b.completedAt || b.updatedAt || '';
        return dateB.localeCompare(dateA);
      });
  }, [tasks, search]);

  const formatCompletedTimestamp = (isoStr?: string) => {
    if (!isoStr) return 'Completed';
    try {
      const d = new Date(isoStr);
      return `Completed ${d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Completed';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Completed Tasks Archive ({completedTasks.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            History of all finished tasks with completion records.
          </p>
        </div>

        {completedTasks.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Completed History</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {tasks.some((t) => t.status === 'completed') && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {completedTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <CheckCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No completed tasks found
            </p>
            <p className="text-xs">
              Check off tasks as you finish them and they will be archived here!
            </p>
          </div>
        ) : (
          completedTasks.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-through">
                      {t.title}
                    </h3>
                  </div>

                  {t.description && (
                    <p className="text-xs text-slate-400 mt-1 pl-6 line-clamp-1">
                      {t.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 pl-6 text-[11px] text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCompletedTimestamp(t.completedAt)}
                    </span>
                    <span>·</span>
                    <span>Category: {t.category}</span>
                    {project && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-indigo-500">
                          <Folder className="w-3 h-3" />
                          <span>{project.name}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restoreTask(t.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Restore task to active"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(t.id, false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Clear Completed Tasks?
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete all {completedTasks.length} completed tasks from your history. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await clearCompletedTasks();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
