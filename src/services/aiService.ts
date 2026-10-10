import { Task } from '../types';

export interface AIBreakdownTask {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedMinutes: number;
  dueDate: string;
  subtasks: string[];
}

export interface AIDailyPlan {
  summary: string;
  recommendedTaskIds: string[];
  schedule: Array<{
    timeSlot: string;
    activity: string;
    tips: string;
  }>;
  motivationalAdvice: string;
}

export interface AIPrioritization {
  recommendedNextTaskId: string;
  reasoning: string;
  prioritizedTaskIds: string[];
  quickTips: string[];
}

class AIService {
  async checkStatus(): Promise<{ status: string; hasGeminiKey: boolean }> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('Status failed');
      return await res.json();
    } catch {
      return { status: 'error', hasGeminiKey: false };
    }
  }

  async breakdownGoal(
    goal: string,
    timeframeDays = 7,
    category = 'Study'
  ): Promise<{ tasks: AIBreakdownTask[]; source: 'gemini' | 'fallback' }> {
    const res = await fetch('/api/ai/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, timeframeDays, category }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate goal breakdown');
    }

    return await res.json();
  }

  async generateDailyPlan(
    tasks: Task[],
    availableHours = 6,
    focusArea?: string
  ): Promise<{ plan: AIDailyPlan; source: 'gemini' | 'fallback' }> {
    const res = await fetch('/api/ai/daily-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          estimatedMinutes: t.estimatedMinutes,
        })),
        availableHours,
        focusArea,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate daily plan');
    }

    return await res.json();
  }

  async prioritizeTasks(tasks: Task[]): Promise<{ result: AIPrioritization; source: 'gemini' | 'fallback' }> {
    const res = await fetch('/api/ai/prioritize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          estimatedMinutes: t.estimatedMinutes,
          category: t.category,
        })),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to prioritize tasks');
    }

    return await res.json();
  }
}

export const aiService = new AIService();
