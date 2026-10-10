import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { ViewType } from '../../types';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  CalendarClock,
  Calendar,
  FolderGit2,
  CheckCheck,
  BarChart3,
  Settings,
  Flame,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { formatLocalDate } from '../../utils/dateUtils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    tasks,
    projects,
    activeView,
    setActiveView,
    setSelectedProjectId,
    openTaskModal,
    streakDays,
    settings,
  } = useTasks();

  const todayStr = formatLocalDate();

  // Counts calculation
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completed').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const completedTodayCount = tasks.filter((t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr)).length;

  const navItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, count: pendingCount },
    {
      id: 'today',
      label: 'Today',
      icon: CalendarDays,
      count: todayCount,
      badgeColor: todayCount > 0 ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300' : undefined,
    },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: projects.length },
    { id: 'completed', label: 'Completed', icon: CheckCheck, count: completedCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView('projects');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const dailyGoalPercent = Math.min(
    100,
    Math.round((completedTodayCount / Math.max(1, settings.dailyGoalTasks)) * 100)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800/80">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  TaskFlow
                </span>
                <span className="text-[10px] block font-medium text-indigo-600 dark:text-indigo-400 -mt-1 tracking-wider uppercase">
                  Smart Tasks
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          item.badgeColor ||
                          (isActive
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Overdue Alert banner if any */}
            {overdueCount > 0 && (
              <div
                onClick={() => handleNavClick('tasks')}
                className="cursor-pointer p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-semibold">Attention Needed</span>
                </div>
                <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  {overdueCount} Overdue
                </span>
              </div>
            )}

            {/* Projects list */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Projects
                </span>
                <button
                  onClick={() => handleNavClick('projects')}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded"
                  title="Manage Projects"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                {projects.map((proj) => {
                  const projTasks = tasks.filter((t) => t.projectId === proj.id);
                  const projPending = projTasks.filter((t) => t.status !== 'completed').length;

                  return (
                    <button
                      key={proj.id}
                      onClick={() => handleProjectClick(proj.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      {projPending > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {projPending}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card: Daily Goal & Streak */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{streakDays} Day Streak</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {completedTodayCount}/{settings.dailyGoalTasks} Done
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                {dailyGoalPercent >= 100
                  ? '🎯 Daily goal achieved!'
                  : `${Math.max(0, settings.dailyGoalTasks - completedTodayCount)} more tasks to hit goal`}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
