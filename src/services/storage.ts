import { Task, Project, Category, FocusSession, UserSettings } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PROJECTS,
  DEFAULT_SETTINGS,
  createInitialDemoTasks,
  createInitialDemoFocusSessions,
} from './demoData';
import { firestore } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  PROJECTS: 'taskflow_projects',
  CATEGORIES: 'taskflow_categories',
  FOCUS: 'taskflow_focus_sessions',
  SETTINGS: 'taskflow_settings',
  INITIALIZED: 'taskflow_initialized_v3',
};

export class StorageService {
  initializeLocalStorage(userId = 'demo-user') {
    if (typeof window === 'undefined') return;

    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      const demoTasks = createInitialDemoTasks(userId);
      const demoFocus = createInitialDemoFocusSessions(userId);

      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(demoTasks));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(demoFocus));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // --- TASKS ---
  async getTasks(userId: string, isDemo = false): Promise<Task[]> {
    if (!isDemo && firestore) {
      try {
        const q = query(collection(firestore, 'tasks'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => docSnap.data() as Task);
      } catch (err) {
        console.warn('Firestore getTasks failed, falling back to local:', err);
      }
    }

    this.initializeLocalStorage(userId);
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return createInitialDemoTasks(userId);
    try {
      const parsed: Task[] = JSON.parse(data);
      return parsed.filter((t) => t.userId === userId || isDemo);
    } catch {
      return [];
    }
  }

  async saveTask(task: Task, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        await setDoc(doc(firestore, 'tasks', task.id), task, { merge: true });
        return;
      } catch (err) {
        console.warn('Firestore saveTask failed, falling back to local:', err);
      }
    }

    const tasks = await this.getTasks(task.userId, isDemo);
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.unshift(task);
    }
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  async saveAllTasks(tasks: Task[], userId: string, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        const batch = writeBatch(firestore);
        tasks.forEach((task) => {
          batch.set(doc(firestore!, 'tasks', task.id), task, { merge: true });
        });
        await batch.commit();
        return;
      } catch (err) {
        console.warn('Firestore saveAllTasks failed:', err);
      }
    }

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  async deleteTask(taskId: string, userId: string, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        await deleteDoc(doc(firestore, 'tasks', taskId));
        return;
      } catch (err) {
        console.warn('Firestore deleteTask failed, falling back to local:', err);
      }
    }

    const tasks = await this.getTasks(userId, isDemo);
    const updated = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
  }

  // --- PROJECTS ---
  async getProjects(userId: string, isDemo = false): Promise<Project[]> {
    if (!isDemo && firestore) {
      try {
        const q = query(collection(firestore, 'projects'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => docSnap.data() as Project);
      } catch (err) {
        console.warn('Firestore getProjects failed, fallback to local:', err);
      }
    }

    this.initializeLocalStorage(userId);
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return DEFAULT_PROJECTS;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PROJECTS;
    }
  }

  async saveProject(project: Project, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        await setDoc(doc(firestore, 'projects', project.id), project, { merge: true });
        return;
      } catch (err) {
        console.warn('Firestore saveProject failed, fallback to local:', err);
      }
    }

    const projects = await this.getProjects(project.userId, isDemo);
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  async deleteProject(projectId: string, userId: string, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        await deleteDoc(doc(firestore, 'projects', projectId));
        return;
      } catch (err) {
        console.warn('Firestore deleteProject failed, fallback to local:', err);
      }
    }

    const projects = await this.getProjects(userId, isDemo);
    const updated = projects.filter((p) => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
  }

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) return DEFAULT_CATEGORIES;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      categories[idx] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // --- FOCUS SESSIONS ---
  async getFocusSessions(userId: string, isDemo = false): Promise<FocusSession[]> {
    if (!isDemo && firestore) {
      try {
        const q = query(collection(firestore, 'focus_sessions'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => docSnap.data() as FocusSession);
      } catch (err) {
        console.warn('Firestore getFocusSessions failed, fallback:', err);
      }
    }

    this.initializeLocalStorage(userId);
    const data = localStorage.getItem(STORAGE_KEYS.FOCUS);
    if (!data) return createInitialDemoFocusSessions(userId);
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async logFocusSession(session: FocusSession, isDemo = false): Promise<void> {
    if (!isDemo && firestore) {
      try {
        await setDoc(doc(firestore, 'focus_sessions', session.id), session);
        return;
      } catch (err) {
        console.warn('Firestore logFocusSession failed:', err);
      }
    }

    const sessions = await this.getFocusSessions(session.userId, isDemo);
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(sessions));
  }

  // --- SETTINGS ---
  getSettings(): UserSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const dedicatedTheme = localStorage.getItem('taskflow_theme') as 'light' | 'dark' | null;
    let loaded: UserSettings = DEFAULT_SETTINGS;
    if (data) {
      try {
        loaded = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      } catch {
        loaded = DEFAULT_SETTINGS;
      }
    }
    if (dedicatedTheme === 'light' || dedicatedTheme === 'dark') {
      loaded.theme = dedicatedTheme;
    }
    return loaded;
  }

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.theme) {
      localStorage.setItem('taskflow_theme', settings.theme);
    }
  }

  // --- RESET DEMO DATA ---
  resetDemoData(userId = 'demo-user'): { tasks: Task[]; projects: Project[]; categories: Category[] } {
    const tasks = createInitialDemoTasks(userId);
    const focus = createInitialDemoFocusSessions(userId);

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(focus));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

    return {
      tasks,
      projects: DEFAULT_PROJECTS,
      categories: DEFAULT_CATEGORIES,
    };
  }

  // --- EXPORT TO CSV ---
  exportTasksToCSV(tasks: Task[]): void {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'DueDate', 'DueTime', 'EstimatedMinutes', 'CompletedAt'];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.dueDate,
      t.dueTime || '',
      t.estimatedMinutes || 0,
      t.completedAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taskflow_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- EXPORT TO JSON ---
  exportToJSON(data: any, filename = 'taskflow_backup.json'): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storage = new StorageService();
