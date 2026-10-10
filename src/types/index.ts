export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  tags: string[];
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  projectId?: string;
  subtasks: Subtask[];
  recurrence: Recurrence;
  estimatedMinutes: number;
  reminderMinutesBefore?: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  completedAt?: string; // ISO
  order?: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  deadline?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completedAt: string;
  mode: 'work' | 'short_break' | 'long_break';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  weekStartsOn: 'monday' | 'sunday';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  dailyGoalTasks: number;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ViewType =
  | 'dashboard'
  | 'tasks'
  | 'today'
  | 'upcoming'
  | 'calendar'
  | 'projects'
  | 'completed'
  | 'analytics'
  | 'settings';
