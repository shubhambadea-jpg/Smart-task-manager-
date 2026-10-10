import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { notificationService } from '../../services/notifications';
import {
  isFirebaseConfigured,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  resetPasswordFirebase,
} from '../../services/firebase';
import {
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Key,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    user,
    resetDemoData,
    exportCSV,
    exportJSON,
    importJSON,
    showToast,
    switchToDemoUser,
  } = useTasks();

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Notification state
  const [notifPermission, setNotifPermission] = useState(notificationService.permission);

  const handleRequestNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      updateSettings({ notificationsEnabled: true });
      notificationService.notify('TaskFlow Notifications Enabled 🎉', {
        body: 'You will receive reminders for upcoming and overdue tasks.',
      });
      showToast({ type: 'success', title: 'Notifications permitted!' });
    } else {
      showToast({
        type: 'warning',
        title: 'Permission Denied',
        message: 'Enable notifications in your browser site permissions to receive task alerts.',
      });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        showToast({ type: 'success', title: 'Logged in successfully!' });
      } else {
        await registerWithEmail(email, password);
        showToast({ type: 'success', title: 'Account registered successfully!' });
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setAuthError('Please enter your email above to reset password.');
      return;
    }
    try {
      await resetPasswordFirebase(email);
      showToast({ type: 'info', title: 'Password reset link sent to your email.' });
    } catch (err: any) {
      setAuthError(err?.message || 'Password reset failed');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importJSON(file);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Settings & Preferences
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize themes, focus timers, cloud persistence, and account settings.
        </p>
      </div>

      {/* Section 1: Account & Firebase Authentication */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Account & Authentication
            </h3>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              user.isDemo
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {user.isDemo ? 'Demo Mode Active' : 'Firebase Authenticated'}
          </span>
        </div>

        {user.isDemo ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Demo Profile: {user.displayName} ({user.email})
                </span>
                <span className="text-[11px] text-slate-400">Local Browser Storage</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                You are using the app in fully functional Demo Mode. All your tasks, subtasks, projects, and focus sessions are stored persistently in your browser.
              </p>
            </div>

            {isFirebaseConfigured() ? (
              <form onSubmit={handleAuthSubmit} className="space-y-3 pt-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Sign in with Firebase
                </span>
                {authError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 text-xs">
                    {authError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Log In' : 'Register'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      className="text-indigo-600 dark:text-indigo-400 underline"
                    >
                      {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Log In'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-slate-400 hover:text-slate-600 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Optional Firebase Cloud Database & Auth</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 font-semibold">
                    Local Demo Mode Active
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-800/90 dark:text-indigo-300/90">
                  TaskFlow operates seamlessly with full local persistence in Demo Mode. To connect real Firebase Authentication and Cloud Firestore for multi-device synchronization:
                </p>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] space-y-1">
                  <div>VITE_FIREBASE_API_KEY=&quot;your_api_key&quot;</div>
                  <div>VITE_FIREBASE_PROJECT_ID=&quot;your_project_id&quot;</div>
                  <div>VITE_FIREBASE_AUTH_DOMAIN=&quot;your_project.firebaseapp.com&quot;</div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Add these to your <code className="font-mono">.env</code> file. Firestore security rules are pre-configured in <code className="font-mono">firestore.rules</code>.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Signed in as {user.email}
              </span>
              <p className="text-slate-400">UID: {user.uid}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await logoutFirebase();
                  switchToDemoUser();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Display & Appearance */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Moon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Appearance & Calendar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Theme */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${
                  settings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-semibold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-semibold text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Week Start */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Calendar Week Starts On
            </label>
            <select
              value={settings.weekStartsOn}
              onChange={(e) => updateSettings({ weekStartsOn: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="monday">Monday (Standard)</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Pomodoro Focus Timer Settings */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Clock className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Pomodoro Focus Intervals & Goals
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Focus Duration
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="10"
                max="90"
                value={settings.pomodoroWorkMinutes}
                onChange={(e) => updateSettings({ pomodoroWorkMinutes: parseInt(e.target.value, 10) || 25 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">mins</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Short Break
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="2"
                max="30"
                value={settings.pomodoroShortBreakMinutes}
                onChange={(e) => updateSettings({ pomodoroShortBreakMinutes: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">mins</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Long Break
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="60"
                value={settings.pomodoroLongBreakMinutes}
                onChange={(e) => updateSettings({ pomodoroLongBreakMinutes: parseInt(e.target.value, 10) || 15 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">mins</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Daily Target Tasks
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="25"
                value={settings.dailyGoalTasks}
                onChange={(e) => updateSettings({ dailyGoalTasks: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Notifications & Reminders */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Browser Notifications & Task Alerts
            </h3>
          </div>

          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              notifPermission === 'granted'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Permission: {notifPermission}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Desktop Notifications for Deadlines & Pomodoro
            </p>
            <p className="text-slate-500 max-w-lg mt-0.5 leading-relaxed">
              When granted, TaskFlow alerts you when tasks are due or when focus sessions finish. Note: Browser notifications operate while the app is active in a tab.
            </p>
          </div>

          <button
            onClick={handleRequestNotifications}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shrink-0 self-start sm:self-auto"
          >
            {notifPermission === 'granted' ? 'Send Test Alert' : 'Request Permission'}
          </button>
        </div>
      </div>

      {/* Section 5: Data Backup, Export & Reset */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Data Portability & Backup
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tasks (CSV)</span>
          </button>

          <button
            onClick={exportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('Reset to initial sample tasks and projects? Custom tasks will be replaced.')) {
                resetDemoData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
