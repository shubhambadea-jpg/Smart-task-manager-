import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Priority, TaskStatus, Recurrence, Subtask } from '../../types';
import {
  X,
  Calendar,
  Clock,
  Flag,
  Folder,
  Tag,
  Repeat,
  Bell,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    closeTaskModal,
    editingTask,
    prefillDueDate,
    prefillProjectId,
    createTask,
    updateTask,
    projects,
    categories,
    createCategory,
  } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Study');
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [projectId, setProjectId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | undefined>(30);
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
      setProjectId(editingTask.projectId || '');
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '');
      setEstimatedMinutes(editingTask.estimatedMinutes || 30);
      setRecurrence(editingTask.recurrence || 'none');
      setReminderMinutesBefore(editingTask.reminderMinutesBefore);
      setTagsInput((editingTask.tags || []).join(', '));
      setSubtasks(editingTask.subtasks || []);
    } else {
      // New task defaults
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory('Study');
      setProjectId(prefillProjectId || '');
      setDueDate(prefillDueDate || new Date().toISOString().split('T')[0]);
      setDueTime('');
      setEstimatedMinutes(30);
      setRecurrence('none');
      setReminderMinutesBefore(30);
      setTagsInput('');
      setSubtasks([]);
    }
  }, [editingTask, prefillDueDate, prefillProjectId, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleCreateNewCategory = async () => {
    if (!newCatName.trim()) return;
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await createCategory(newCatName.trim(), randomColor);
    setCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingTask) {
        await updateTask({
          ...editingTask,
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          category,
          projectId: projectId || undefined,
          dueDate,
          dueTime: dueTime || undefined,
          estimatedMinutes,
          recurrence,
          reminderMinutesBefore,
          tags,
          subtasks,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          category,
          projectId: projectId || undefined,
          dueDate,
          dueTime: dueTime || undefined,
          estimatedMinutes,
          recurrence,
          reminderMinutesBefore,
          tags,
          subtasks,
        });
      }
      closeTaskModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={closeTaskModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete calculus problem set 4"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key requirements, links, or notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Grid row 1: Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  const colors = {
                    low: 'text-slate-600 dark:text-slate-400',
                    medium: 'text-blue-600 dark:text-blue-400',
                    high: 'text-amber-600 dark:text-amber-400',
                    urgent: 'text-rose-600 dark:text-rose-400 font-bold',
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-2 py-1.5 rounded-lg text-xs capitalize border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      } ${colors[p]}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Grid row 2: Category & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {showAddCat ? 'Select existing' : '+ Custom'}
                </button>
              </div>

              {showAddCat ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Project (General)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid row 3: Due Date, Due Time, Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Due Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Time
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">mins</span>
              </div>
            </div>
          </div>

          {/* Grid row 4: Recurrence & Reminders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reminder Alert
              </label>
              <select
                value={reminderMinutesBefore ?? 30}
                onChange={(e) => setReminderMinutesBefore(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Exam, Math, Chapter4"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>

            {/* List */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
                  >
                    <div
                      onClick={() => handleToggleSubtask(sub.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                          sub.completed
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={sub.completed ? 'line-through text-slate-400 truncate' : 'text-slate-800 dark:text-slate-200 truncate'}>
                        {sub.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add subtask input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask step and press Enter"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
              >
                Add Subtask
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isSubmitting ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
