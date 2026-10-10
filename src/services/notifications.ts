// Browser notification helper and duplicate alert prevention

class NotificationService {
  private notifiedTaskKeys = new Set<string>();

  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  get permission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  notify(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false;
    }
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch {
      return false;
    }
  }

  // Sends reminder for a task if not already triggered in this session
  notifyTaskReminder(taskId: string, taskTitle: string, dueTimeStr?: string): boolean {
    const key = `${taskId}-${dueTimeStr || 'due'}`;
    if (this.notifiedTaskKeys.has(key)) return false;

    const sent = this.notify('TaskFlow Reminder', {
      body: `"${taskTitle}" is due ${dueTimeStr ? `at ${dueTimeStr}` : 'soon'}!`,
      tag: key,
    });

    if (sent) {
      this.notifiedTaskKeys.add(key);
    }
    return sent;
  }

  notifyPomodoroDone(mode: 'work' | 'short_break' | 'long_break') {
    const titles = {
      work: 'Focus session completed! 🎯',
      short_break: 'Break finished! Ready to refocus? ⚡',
      long_break: 'Long break finished! Ready for next session? 🚀',
    };
    this.notify('TaskFlow Pomodoro', {
      body: titles[mode] || 'Timer complete!',
    });
  }
}

export const notificationService = new NotificationService();
