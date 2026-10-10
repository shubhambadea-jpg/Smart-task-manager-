import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from '../tasks/TaskCard';
import { QuickAddBar } from '../tasks/QuickAddBar';
import { Project } from '../../types';
import {
  FolderGit2,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    tasks,
    selectedProjectId,
    setSelectedProjectId,
    createProject,
    updateProject,
    deleteProject,
    openTaskModal,
  } = useTasks();

  // Modal for new/edit project
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [deadline, setDeadline] = useState('');

  const colors = [
    '#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#14b8a6',
  ];

  const handleOpenModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setName(proj.name);
      setDescription(proj.description || '');
      setColor(proj.color);
      setDeadline(proj.deadline || '');
    } else {
      setEditingProject(null);
      setName('');
      setDescription('');
      setColor(colors[Math.floor(Math.random() * colors.length)]);
      setDeadline('');
    }
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProject) {
      await updateProject({
        ...editingProject,
        name: name.trim(),
        description: description.trim(),
        color,
        deadline: deadline || undefined,
      });
    } else {
      const created = await createProject({
        name: name.trim(),
        description: description.trim(),
        color,
        deadline: deadline || undefined,
      });
      setSelectedProjectId(created.id);
    }
    setIsModalOpen(false);
  };

  const currentProjectId = selectedProjectId || (projects.length > 0 ? projects[0].id : null);
  const selectedProject = projects.find((p) => p.id === currentProjectId);
  const projectTasks = tasks.filter((t) => t.projectId === currentProjectId);
  const completedCount = projectTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = projectTasks.length > 0
    ? Math.round((completedCount / projectTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Projects & Initiatives
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize coursework, major milestones, and multi-step initiatives.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const tasksForProj = tasks.filter((t) => t.projectId === proj.id);
          const done = tasksForProj.filter((t) => t.status === 'completed').length;
          const pct = tasksForProj.length > 0 ? Math.round((done / tasksForProj.length) * 100) : 0;
          const isSelected = currentProjectId === proj.id;

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {proj.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(proj);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete project "${proj.name}"? Tasks will remain unassigned.`)) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>
                    {done}/{tasksForProj.length} Tasks
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: proj.color,
                    }}
                  />
                </div>

                {proj.deadline && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Target: {proj.deadline}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Detail Section */}
      {selectedProject && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject.name}
                </h3>
              </div>
              {selectedProject.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  {selectedProject.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openTaskModal(undefined, undefined, selectedProject.id)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task to Project</span>
              </button>
            </div>
          </div>

          {/* Quick Add Bar prefilled with this project */}
          <QuickAddBar
            defaultProjectId={selectedProject.id}
            placeholder={`Add a new task to ${selectedProject.name}...`}
          />

          {/* Tasks List */}
          <div className="space-y-2.5">
            {projectTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No tasks currently assigned to this project. Add one above!
              </div>
            ) : (
              projectTasks.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95"
            role="dialog"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Distributed Systems Lab"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the objective or scope?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
