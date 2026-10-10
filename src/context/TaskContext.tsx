import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  Project,
  Category,
  FocusSession,
  UserSettings,
  AuthUser,
  ToastMessage,
  ViewType,
  Priority,
  TaskStatus,
} from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/audio';
import { notificationService } from '../services/notifications';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { formatLocalDate, calculateNextRecurrenceDate, formatFriendlyDate } from '../utils/dateUtils';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  focusSessions: FocusSession[];
  settings: UserSettings;
  user: AuthUser;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt';
  setSortBy: (s: 'dueDate' | 'priority' | 'title' | 'createdAt') => void;
  viewMode: 'list' | 'board';
  setViewMode: (m: 'list' | 'board') => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Task modal & editing
  isTaskModalOpen: boolean;
  openTaskModal: (task?: Task, prefillDate?: string, prefillProject?: string) => void;
  closeTaskModal: () => void;
  editingTask: Task | null;
  prefillDueDate: string | null;
  prefillProjectId: string | null;

  // AI Modal
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;

  // Pomodoro
  isPomodoroModalOpen: boolean;
  setIsPomodoroModalOpen: (open: boolean) => void;
  activePomodoroTaskId: string | null;
  pomodoroSecondsLeft: number;
  pomodoroMode: 'work' | 'short_break' | 'long_break';
  pomodoroIsRunning: boolean;
  pomodoroSessionsCount: number;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: (mode?: 'work' | 'short_break' | 'long_break') => void;
  startPomodoroForTask: (taskId: string) => void;

  // CRUD
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string, allowUndo?: boolean) => Promise<void>;
  duplicateTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;

  // Project CRUD
  createProject: (data: Omit<Project, 'id' | 'userId' | 'createdAt'>) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  // Category
  createCategory: (name: string, color: string) => Promise<void>;

  // Focus
  logFocusSession: (session: Omit<FocusSession, 'id' | 'userId' | 'completedAt'>) => Promise<void>;

  // Settings & Theme
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetDemoData: () => void;
  streakDays: number;
  motivationalQuote: { quote: string; author: string };
  exportCSV: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<void>;

  // Auth & Mode
  switchToDemoUser: () => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

const MOTIVATIONAL_QUOTES = [
  { quote: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { quote: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { quote: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { quote: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { quote: 'Simplicity boils down to two steps: Identify the essential. Eliminate the rest.', author: 'Leo Babauta' },
  { quote: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { quote: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>({
    uid: 'demo-user',
    email: 'alex.student@demo.taskflow.app',
    displayName: 'Alex Chen',
    isDemo: true,
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const deletedTaskHistory = useRef<Task | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefillDueDate, setPrefillDueDate] = useState<string | null>(null);
  const [prefillProjectId, setPrefillProjectId] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);

  // Pomodoro state
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string | null>(null);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(settings.pomodoroWorkMinutes * 60);
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
  const [pomodoroSessionsCount, setPomodoroSessionsCount] = useState(0);

  // Load initial data
  const loadData = useCallback(async (currUser: AuthUser) => {
    try {
      const [loadedTasks, loadedProjects, loadedCats, loadedFocus] = await Promise.all([
        storage.getTasks(currUser.uid, currUser.isDemo),
        storage.getProjects(currUser.uid, currUser.isDemo),
        storage.getCategories(),
        storage.getFocusSessions(currUser.uid, currUser.isDemo),
      ]);
      setTasks(loadedTasks);
      setProjects(loadedProjects);
      if (loadedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(loadedProjects[0].id);
      }
      setCategories(loadedCats);
      setFocusSessions(loadedFocus);
    } catch (err) {
      console.error('Failed to load tasks and projects:', err);
    }
  }, [selectedProjectId]);

  // Firebase auth listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isDemo: false,
          };
          setUser(authUser);
          loadData(authUser);
        } else {
          const demoUser: AuthUser = {
            uid: 'demo-user',
            email: 'alex.student@demo.taskflow.app',
            displayName: 'Alex Chen',
            isDemo: true,
          };
          setUser(demoUser);
          loadData(demoUser);
        }
      });
      return () => unsubscribe();
    } else {
      loadData(user);
    }
  }, [loadData]);

  // Apply dark/light theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Pomodoro interval timer
  useEffect(() => {
    let interval: any = null;
    if (pomodoroIsRunning && pomodoroSecondsLeft > 0) {
      interval = setInterval(() => {
        setPomodoroSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroIsRunning && pomodoroSecondsLeft === 0) {
      setPomodoroIsRunning(false);
      if (settings.soundEnabled) {
        sound.playTimerDone();
      }
      if (settings.notificationsEnabled) {
        notificationService.notifyPomodoroDone(pomodoroMode);
      }

      if (pomodoroMode === 'work') {
        const newCount = pomodoroSessionsCount + 1;
        setPomodoroSessionsCount(newCount);

        const activeTask = tasks.find((t) => t.id === activePomodoroTaskId);
        const session: FocusSession = {
          id: `focus-${Date.now()}`,
          userId: user.uid,
          taskId: activePomodoroTaskId || undefined,
          taskTitle: activeTask?.title,
          durationMinutes: settings.pomodoroWorkMinutes,
          completedAt: new Date().toISOString(),
          mode: 'work',
        };
        storage.logFocusSession(session, user.isDemo);
        setFocusSessions((prev) => [session, ...prev]);

        showToast({
          type: 'success',
          title: 'Great work! Focus session finished.',
          message: `${settings.pomodoroWorkMinutes} minutes of deep focus logged!`,
        });

        if (newCount % 4 === 0) {
          setPomodoroMode('long_break');
          setPomodoroSecondsLeft(settings.pomodoroLongBreakMinutes * 60);
        } else {
          setPomodoroMode('short_break');
          setPomodoroSecondsLeft(settings.pomodoroShortBreakMinutes * 60);
        }
      } else {
        showToast({
          type: 'info',
          title: 'Break finished!',
          message: 'Ready for another round of productive focus?',
        });
        setPomodoroMode('work');
        setPomodoroSecondsLeft(settings.pomodoroWorkMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [pomodoroIsRunning, pomodoroSecondsLeft, pomodoroMode, pomodoroSessionsCount, settings, activePomodoroTaskId, tasks, user]);

  // Periodic reminder checking (every 60 seconds)
  useEffect(() => {
    const checkReminders = () => {
      if (!settings.notificationsEnabled) return;
      const now = new Date();
      const todayStr = formatLocalDate(now);
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();

      tasks.forEach((task) => {
        if (task.status === 'completed' || !task.dueDate) return;

        if (task.dueDate === todayStr && task.dueTime) {
          const [hStr, mStr] = task.dueTime.split(':');
          const h = parseInt(hStr, 10);
          const m = parseInt(mStr, 10);
          const diffMinutes = (h - currentHours) * 60 + (m - currentMins);

          const reminderThreshold = task.reminderMinutesBefore || 30;
          if (diffMinutes <= reminderThreshold && diffMinutes >= 0) {
            notificationService.notifyTaskReminder(task.id, task.title, task.dueTime);
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [tasks, settings.notificationsEnabled]);

  // Toast actions
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Task Modal controls
  const openTaskModal = useCallback((task?: Task, prefillDate?: string, prefillProject?: string) => {
    setEditingTask(task || null);
    setPrefillDueDate(prefillDate || null);
    setPrefillProjectId(prefillProject || null);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setPrefillDueDate(null);
    setPrefillProjectId(null);
  }, []);

  // CRUD Operations
  const createTask = useCallback(
    async (data: Partial<Task>): Promise<Task> => {
      const now = new Date().toISOString();
      const todayStr = formatLocalDate();
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: user.uid,
        title: data.title?.trim() || 'Untitled Task',
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        category: data.category || 'Study',
        tags: data.tags || [],
        dueDate: data.dueDate || todayStr,
        dueTime: data.dueTime,
        projectId: data.projectId,
        subtasks: data.subtasks || [],
        recurrence: data.recurrence || 'none',
        estimatedMinutes: data.estimatedMinutes || 30,
        reminderMinutesBefore: data.reminderMinutesBefore,
        createdAt: now,
        updatedAt: now,
        order: tasks.length + 1,
      };

      await storage.saveTask(newTask, user.isDemo);
      setTasks((prev) => [newTask, ...prev]);
      showToast({
        type: 'success',
        title: 'Task created',
        message: `"${newTask.title}" added to your list.`,
      });
      return newTask;
    },
    [user, tasks.length, showToast]
  );

  const updateTask = useCallback(
    async (updated: Task) => {
      const full: Task = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      await storage.saveTask(full, user.isDemo);
      setTasks((prev) => prev.map((t) => (t.id === full.id ? full : t)));
      showToast({
        type: 'info',
        title: 'Task updated',
        message: `"${full.title}" updated successfully.`,
      });
    },
    [user, showToast]
  );

  const deleteTask = useCallback(
    async (taskId: string, allowUndo = true) => {
      const taskToDelete = tasks.find((t) => t.id === taskId);
      if (!taskToDelete) return;

      deletedTaskHistory.current = taskToDelete;
      await storage.deleteTask(taskId, user.uid, user.isDemo);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (allowUndo) {
        showToast({
          type: 'info',
          title: 'Task deleted',
          message: `"${taskToDelete.title}" removed.`,
          duration: 6000,
          action: {
            label: 'Undo',
            onClick: async () => {
              if (deletedTaskHistory.current) {
                const restored = deletedTaskHistory.current;
                await storage.saveTask(restored, user.isDemo);
                setTasks((prev) => [restored, ...prev]);
                deletedTaskHistory.current = null;
                showToast({
                  type: 'success',
                  title: 'Task restored',
                  message: `"${restored.title}" added back.`,
                });
              }
            },
          },
        });
      }
    },
    [tasks, user, showToast]
  );

  const duplicateTask = useCallback(
    async (taskId: string) => {
      const original = tasks.find((t) => t.id === taskId);
      if (!original) return;

      const duplicated: Task = {
        ...original,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined,
        status: 'todo',
        subtasks: original.subtasks.map((s) => ({
          ...s,
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          completed: false,
        })),
      };

      await storage.saveTask(duplicated, user.isDemo);
      setTasks((prev) => [duplicated, ...prev]);
      showToast({
        type: 'success',
        title: 'Task duplicated',
        message: `"${duplicated.title}" created.`,
      });
    },
    [tasks, user, showToast]
  );

  const toggleTaskComplete = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const isBecomingComplete = task.status !== 'completed';
      const updated: Task = {
        ...task,
        status: isBecomingComplete ? 'completed' : 'todo',
        completedAt: isBecomingComplete ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      let newNextRecurringTask: Task | null = null;

      // Handle recurrence if completing a recurring task
      if (isBecomingComplete && task.recurrence && task.recurrence !== 'none') {
        const nextDueDate = calculateNextRecurrenceDate(task.dueDate, task.recurrence);
        newNextRecurringTask = {
          ...task,
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'todo',
          dueDate: nextDueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: undefined,
          subtasks: task.subtasks.map((s) => ({ ...s, completed: false })),
        };
      }

      if (isBecomingComplete) {
        if (settings.soundEnabled) sound.playTaskCompleted();
        try {
          confetti({
            particleCount: 45,
            spread: 55,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#8b5cf6', '#10b981', '#3b82f6'],
          });
        } catch {
          // Confetti error ignored
        }
      }

      await storage.saveTask(updated, user.isDemo);
      if (newNextRecurringTask) {
        await storage.saveTask(newNextRecurringTask, user.isDemo);
      }

      setTasks((prev) => {
        const mapped = prev.map((t) => (t.id === taskId ? updated : t));
        return newNextRecurringTask ? [newNextRecurringTask, ...mapped] : mapped;
      });

      showToast({
        type: isBecomingComplete ? 'success' : 'info',
        title: isBecomingComplete ? 'Task Completed! 🎉' : 'Task Reopened',
        message: newNextRecurringTask
          ? `Completed! Next recurring task scheduled for ${newNextRecurringTask.dueDate}.`
          : `"${task.title}" marked as ${isBecomingComplete ? 'done' : 'to do'}.`,
      });
    },
    [tasks, settings.soundEnabled, user, showToast]
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );

      const allSubtasksDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

      const updatedTask: Task = {
        ...task,
        subtasks: updatedSubtasks,
        status: allSubtasksDone ? 'completed' : task.status,
        completedAt: allSubtasksDone ? new Date().toISOString() : task.completedAt,
        updatedAt: new Date().toISOString(),
      };

      if (allSubtasksDone && task.status !== 'completed' && settings.soundEnabled) {
        sound.playTaskCompleted();
      }

      await storage.saveTask(updatedTask, user.isDemo);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    },
    [tasks, settings.soundEnabled, user]
  );

  const restoreTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const restored: Task = {
        ...task,
        status: 'todo',
        completedAt: undefined,
        updatedAt: new Date().toISOString(),
      };

      await storage.saveTask(restored, user.isDemo);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? restored : t)));
      showToast({
        type: 'info',
        title: 'Task restored',
        message: `"${restored.title}" moved back to active tasks.`,
      });
    },
    [tasks, user, showToast]
  );

  const clearCompletedTasks = useCallback(async () => {
    const remainingTasks = tasks.filter((t) => t.status !== 'completed');
    const removedCount = tasks.length - remainingTasks.length;
    await storage.saveAllTasks(remainingTasks, user.uid, user.isDemo);
    setTasks(remainingTasks);
    showToast({
      type: 'info',
      title: 'Completed tasks cleared',
      message: `Archived ${removedCount} completed tasks.`,
    });
  }, [tasks, user, showToast]);

  // Project operations
  const createProject = useCallback(
    async (data: Omit<Project, 'id' | 'userId' | 'createdAt'>): Promise<Project> => {
      const newProject: Project = {
        ...data,
        id: `proj-${Date.now()}`,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };
      await storage.saveProject(newProject, user.isDemo);
      setProjects((prev) => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
      showToast({
        type: 'success',
        title: 'Project created',
        message: `Project "${newProject.name}" added.`,
      });
      return newProject;
    },
    [user, showToast]
  );

  const updateProject = useCallback(
    async (project: Project) => {
      await storage.saveProject(project, user.isDemo);
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
      showToast({
        type: 'info',
        title: 'Project updated',
        message: `Project "${project.name}" saved.`,
      });
    },
    [user, showToast]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      const proj = projects.find((p) => p.id === projectId);
      await storage.deleteProject(projectId, user.uid, user.isDemo);
      const remainingProjects = projects.filter((p) => p.id !== projectId);
      setProjects(remainingProjects);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
      }

      // Unlink tasks from project and PERSIST!
      const updatedTasks = tasks.map((t) =>
        t.projectId === projectId ? { ...t, projectId: undefined } : t
      );
      await storage.saveAllTasks(updatedTasks, user.uid, user.isDemo);
      setTasks(updatedTasks);

      showToast({
        type: 'info',
        title: 'Project deleted',
        message: proj ? `Project "${proj.name}" removed.` : 'Project deleted.',
      });
    },
    [projects, tasks, selectedProjectId, user, showToast]
  );

  const createCategory = useCallback(
    async (name: string, color: string) => {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        color,
      };
      await storage.saveCategory(newCat);
      setCategories((prev) => [...prev, newCat]);
      showToast({
        type: 'success',
        title: 'Category added',
        message: `"${newCat.name}" is now available.`,
      });
    },
    [showToast]
  );

  const logFocusSession = useCallback(
    async (sessionData: Omit<FocusSession, 'id' | 'userId' | 'completedAt'>) => {
      const session: FocusSession = {
        ...sessionData,
        id: `focus-${Date.now()}`,
        userId: user.uid,
        completedAt: new Date().toISOString(),
      };
      await storage.logFocusSession(session, user.isDemo);
      setFocusSessions((prev) => [session, ...prev]);
    },
    [user]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<UserSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      storage.saveSettings(updated);
      showToast({
        type: 'info',
        title: 'Preferences saved',
        message: 'Settings updated successfully.',
      });
    },
    [settings, showToast]
  );

  const resetDemoData = useCallback(() => {
    const data = storage.resetDemoData(user.uid);
    setTasks(data.tasks);
    setProjects(data.projects);
    setCategories(data.categories);
    setFocusSessions([]);
    if (data.projects.length > 0) {
      setSelectedProjectId(data.projects[0].id);
    }
    showToast({
      type: 'info',
      title: 'Demo reset',
      message: 'Restored original demo tasks and projects.',
    });
  }, [user, showToast]);

  const switchToDemoUser = useCallback(() => {
    const demoUser: AuthUser = {
      uid: 'demo-user',
      email: 'alex.student@demo.taskflow.app',
      displayName: 'Alex Chen',
      isDemo: true,
    };
    setUser(demoUser);
    loadData(demoUser);
    showToast({
      type: 'info',
      title: 'Demo Mode Active',
      message: 'Running in demo mode with local storage.',
    });
  }, [loadData, showToast]);

  // Pomodoro control
  const startPomodoro = useCallback(() => {
    setPomodoroIsRunning(true);
  }, []);

  const pausePomodoro = useCallback(() => {
    setPomodoroIsRunning(false);
  }, []);

  const resetPomodoro = useCallback(
    (mode: 'work' | 'short_break' | 'long_break' = 'work') => {
      setPomodoroIsRunning(false);
      setPomodoroMode(mode);
      if (mode === 'work') setPomodoroSecondsLeft(settings.pomodoroWorkMinutes * 60);
      else if (mode === 'short_break') setPomodoroSecondsLeft(settings.pomodoroShortBreakMinutes * 60);
      else setPomodoroSecondsLeft(settings.pomodoroLongBreakMinutes * 60);
    },
    [settings]
  );

  const startPomodoroForTask = useCallback(
    (taskId: string) => {
      setActivePomodoroTaskId(taskId);
      setPomodoroMode('work');
      setPomodoroSecondsLeft(settings.pomodoroWorkMinutes * 60);
      setPomodoroIsRunning(true);
      setIsPomodoroModalOpen(true);
    },
    [settings]
  );

  // Productivity streak calculation (using formatLocalDate)
  const streakDays = useMemo(() => {
    const completedTasksWithDates = tasks
      .filter((t) => t.status === 'completed' && t.completedAt)
      .map((t) => formatLocalDate(new Date(t.completedAt!)));

    const uniqueDates = Array.from(new Set(completedTasksWithDates)).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const todayStr = formatLocalDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatLocalDate(yesterday);

    if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let checkDate = new Date();
    if (!uniqueDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = formatLocalDate(checkDate);
      if (uniqueDates.includes(dateStr)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(streak, 1);
  }, [tasks]);

  const motivationalQuote = useMemo(() => {
    const day = new Date().getDate();
    return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
  }, []);

  const exportCSV = useCallback(() => {
    storage.exportTasksToCSV(tasks);
    showToast({ type: 'success', title: 'Exported to CSV' });
  }, [tasks, showToast]);

  const exportJSON = useCallback(() => {
    storage.exportToJSON({ tasks, projects, categories, settings }, 'taskflow_backup.json');
    showToast({ type: 'success', title: 'Exported backup JSON' });
  }, [tasks, projects, categories, settings, showToast]);

  const importJSON = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          await storage.saveAllTasks(parsed.tasks, user.uid, user.isDemo);
          setTasks(parsed.tasks);
        }
        if (parsed.projects && Array.isArray(parsed.projects)) {
          for (const p of parsed.projects) {
            await storage.saveProject(p, user.isDemo);
          }
          setProjects(parsed.projects);
          if (parsed.projects.length > 0) {
            setSelectedProjectId(parsed.projects[0].id);
          }
        }
        showToast({
          type: 'success',
          title: 'Import Successful',
          message: 'Your tasks and projects were imported.',
        });
      } catch {
        showToast({
          type: 'error',
          title: 'Import Failed',
          message: 'Invalid JSON backup file.',
        });
      }
    },
    [user, showToast]
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        categories,
        focusSessions,
        settings,
        user,
        activeView,
        setActiveView,
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedPriority,
        setSelectedPriority,
        selectedStatus,
        setSelectedStatus,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        toasts,
        showToast,
        removeToast,
        isTaskModalOpen,
        openTaskModal,
        closeTaskModal,
        editingTask,
        prefillDueDate,
        prefillProjectId,
        isAIModalOpen,
        setIsAIModalOpen,
        isPomodoroModalOpen,
        setIsPomodoroModalOpen,
        activePomodoroTaskId,
        pomodoroSecondsLeft,
        pomodoroMode,
        pomodoroIsRunning,
        pomodoroSessionsCount,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        startPomodoroForTask,
        createTask,
        updateTask,
        deleteTask,
        duplicateTask,
        toggleTaskComplete,
        toggleSubtask,
        restoreTask,
        clearCompletedTasks,
        createProject,
        updateProject,
        deleteProject,
        createCategory,
        logFocusSession,
        updateSettings,
        resetDemoData,
        streakDays,
        motivationalQuote,
        exportCSV,
        exportJSON,
        importJSON,
        switchToDemoUser,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
