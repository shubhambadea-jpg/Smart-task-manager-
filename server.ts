import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini SDK if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString(),
  });
});

// Helper for smart fallback generation when API key is missing or model is unavailable
function generateFallbackBreakdown(goal: string, days = 7) {
  const goalLower = goal.toLowerCase();
  const isExam = goalLower.includes('exam') || goalLower.includes('study') || goalLower.includes('test') || goalLower.includes('course');
  const isProject = goalLower.includes('project') || goalLower.includes('build') || goalLower.includes('app') || goalLower.includes('develop');

  const today = new Date();
  const formatDateOffset = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  if (isExam) {
    return [
      {
        title: 'Review syllabus and gather reference material',
        description: `Organize notes, past questions, and lecture slides for "${goal}".`,
        priority: 'high',
        category: 'Study',
        estimatedMinutes: 60,
        dueDate: formatDateOffset(1),
        subtasks: ['Review lecture syllabus', 'Assemble formula sheets & key definitions'],
      },
      {
        title: 'Deep dive into Core Foundations & Theory',
        description: 'Focus on high-weightage chapters and theoretical principles.',
        priority: 'high',
        category: 'Study',
        estimatedMinutes: 90,
        dueDate: formatDateOffset(2),
        subtasks: ['Read chapters 1-3 summary', 'Solve foundational exercises'],
      },
      {
        title: 'Solve practice problems and sample questions',
        description: 'Complete timed problem sets to solidify core concepts.',
        priority: 'medium',
        category: 'Study',
        estimatedMinutes: 120,
        dueDate: formatDateOffset(3),
        subtasks: ['Practice set A (15 questions)', 'Verify solutions against answer key'],
      },
      {
        title: 'Target weak areas and difficult concepts',
        description: 'Revisit missed problems and clarify lingering doubts.',
        priority: 'urgent',
        category: 'Study',
        estimatedMinutes: 90,
        dueDate: formatDateOffset(4),
        subtasks: ['Review error log', 'Create 1-page cheat sheet for formulas'],
      },
      {
        title: 'Full-length mock exam under timed conditions',
        description: 'Simulate realistic test conditions without distractions.',
        priority: 'urgent',
        category: 'Study',
        estimatedMinutes: 150,
        dueDate: formatDateOffset(5),
        subtasks: ['Sit for 2-hour uninterrupted mock', 'Score and document mistakes'],
      },
      {
        title: 'Final rapid review and flashcards session',
        description: 'Active recall of key definitions, formulas, and diagrams.',
        priority: 'medium',
        category: 'Study',
        estimatedMinutes: 60,
        dueDate: formatDateOffset(6),
        subtasks: ['Active recall with flashcards', 'Pack exam stationery & set alarms'],
      },
    ];
  }

  if (isProject) {
    return [
      {
        title: 'Define scope, requirements & user stories',
        description: `Outline core specifications and success criteria for "${goal}".`,
        priority: 'high',
        category: 'Projects',
        estimatedMinutes: 60,
        dueDate: formatDateOffset(1),
        subtasks: ['List MVP features', 'Sketch user journey and interfaces'],
      },
      {
        title: 'Setup architecture, repo & initial scaffold',
        description: 'Initialize project structure, dependencies, and environment configuration.',
        priority: 'medium',
        category: 'Projects',
        estimatedMinutes: 90,
        dueDate: formatDateOffset(2),
        subtasks: ['Create Git repository', 'Configure linters and build tools'],
      },
      {
        title: 'Implement core functionality & backend logic',
        description: 'Build essential data models, business rules, and state management.',
        priority: 'urgent',
        category: 'Projects',
        estimatedMinutes: 180,
        dueDate: formatDateOffset(3),
        subtasks: ['Create primary data structures', 'Implement key business actions'],
      },
      {
        title: 'Build user interface & interactions',
        description: 'Design responsive views, interactive components, and feedback states.',
        priority: 'high',
        category: 'Projects',
        estimatedMinutes: 120,
        dueDate: formatDateOffset(4),
        subtasks: ['Connect UI components to state', 'Add loading & error states'],
      },
      {
        title: 'End-to-end testing, bug fixing & polish',
        description: 'Perform rigorous walkthroughs, edge-case testing, and styling tweaks.',
        priority: 'medium',
        category: 'Projects',
        estimatedMinutes: 90,
        dueDate: formatDateOffset(5),
        subtasks: ['Test on mobile & desktop', 'Fix visual bugs and responsiveness'],
      },
      {
        title: 'Deploy to production and write documentation',
        description: 'Ship to hosting provider, verify live URL, and write setup notes.',
        priority: 'high',
        category: 'Projects',
        estimatedMinutes: 60,
        dueDate: formatDateOffset(6),
        subtasks: ['Trigger release build', 'Write clear README with instructions'],
      },
    ];
  }

  // Generic goal breakdown
  return [
    {
      title: `Plan & break down: ${goal}`,
      description: 'Define milestones, gather prerequisites, and allocate daily slots.',
      priority: 'high',
      category: 'Work',
      estimatedMinutes: 45,
      dueDate: formatDateOffset(1),
      subtasks: ['Clarify requirements', 'Block focus time on calendar'],
    },
    {
      title: 'Execute Phase 1: Core deliverables',
      description: 'Make concrete progress on the highest-impact elements.',
      priority: 'urgent',
      category: 'Work',
      estimatedMinutes: 90,
      dueDate: formatDateOffset(2),
      subtasks: ['Draft first milestone', 'Review with checklist'],
    },
    {
      title: 'Execute Phase 2: Refinements & iterations',
      description: 'Continue steady work and address dependencies.',
      priority: 'medium',
      category: 'Work',
      estimatedMinutes: 75,
      dueDate: formatDateOffset(3),
      subtasks: ['Implement refinements', 'Eliminate blockers'],
    },
    {
      title: 'Review results and prepare final submission',
      description: 'Perform quality inspection and wrap up pending details.',
      priority: 'medium',
      category: 'Work',
      estimatedMinutes: 60,
      dueDate: formatDateOffset(4),
      subtasks: ['Review against original goals', 'Archive notes & celebrate milestone'],
    },
  ];
}

// 1. Goal Breakdown Endpoint
app.post('/api/ai/breakdown', async (req: Request, res: Response) => {
  const { goal, timeframeDays = 7, category = 'Study' } = req.body;

  if (!goal || typeof goal !== 'string') {
    return res.status(400).json({ error: 'Goal is required' });
  }

  // If Gemini is available, use real gemini-3.8-flash model
  if (aiClient) {
    try {
      const prompt = `You are an expert productivity coach and academic advisor.
Break down this user goal into a realistic, actionable multi-day action plan:
Goal: "${goal}"
Timeframe: ${timeframeDays} days
Preferred Category: ${category}
Current Date: ${new Date().toISOString().split('T')[0]}

Return a valid JSON array of tasks. Each task must have:
- "title": concise, action-oriented string (e.g. "Review Chapter 3 Calculus Problems")
- "description": 1-2 sentence explanation of what to do
- "priority": one of ["low", "medium", "high", "urgent"]
- "category": string matching the context (e.g. "${category}" or "Study", "Work", "Projects", "Personal")
- "estimatedMinutes": number (e.g. 45, 60, 90)
- "dayOffset": number between 1 and ${timeframeDays} (which day from today it should be scheduled)
- "subtasks": array of 2-4 specific checklist strings

Return ONLY raw JSON array, without markdown backticks or formatting outside the JSON array.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text || '[]';
      let parsed = JSON.parse(text);
      if (!Array.isArray(parsed) && parsed.tasks) {
        parsed = parsed.tasks;
      }

      const today = new Date();
      const formattedTasks = parsed.map((item: any, idx: number) => {
        const offset = typeof item.dayOffset === 'number' ? item.dayOffset : idx + 1;
        const d = new Date(today);
        d.setDate(d.getDate() + offset);
        return {
          title: item.title || `Task ${idx + 1}`,
          description: item.description || '',
          priority: ['low', 'medium', 'high', 'urgent'].includes(item.priority) ? item.priority : 'medium',
          category: item.category || category,
          estimatedMinutes: item.estimatedMinutes || 45,
          dueDate: d.toISOString().split('T')[0],
          subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
        };
      });

      return res.json({ tasks: formattedTasks, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini breakdown failed, falling back to heuristic planner:', err?.message);
    }
  }

  // Heuristic intelligent fallback
  const fallback = generateFallbackBreakdown(goal, timeframeDays);
  res.json({ tasks: fallback, source: 'fallback' });
});

// 2. Daily Schedule Planner
app.post('/api/ai/daily-plan', async (req: Request, res: Response) => {
  const { tasks, availableHours = 6, focusArea } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are an elite productivity mentor. The user has ${availableHours} hours available today.
Tasks currently on their list:
${JSON.stringify(tasks?.slice(0, 15) || [])}
Focus Area/Goal: ${focusArea || 'Maximize high-impact completion'}

Provide an actionable, structured hourly schedule for today.
Output valid JSON in this structure:
{
  "summary": "Brief encouraging overview of the day's strategy",
  "recommendedTaskIds": ["ids of tasks to focus on"],
  "schedule": [
    {
      "timeSlot": "09:00 - 10:30",
      "activity": "Deep Work on High Priority Task",
      "tips": "Turn off phone notifications"
    }
  ],
  "motivationalAdvice": "One strong tip for staying focused today"
}
Return ONLY valid JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ plan: parsed, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini daily plan failed, falling back:', err?.message);
    }
  }

  // Fallback daily plan
  const sampleSchedule = [
    { timeSlot: '09:00 - 10:30', activity: 'Deep Work: High-priority task tackle', tips: 'Do this before checking emails or social media.' },
    { timeSlot: '10:30 - 10:45', activity: 'Quick stretch & hydration break', tips: 'Step away from screen.' },
    { timeSlot: '10:45 - 12:15', activity: 'Focused Problem Solving & Progress Block', tips: 'Use 25-minute Pomodoro sprints.' },
    { timeSlot: '12:15 - 13:15', activity: 'Lunch & mental recharge', tips: 'Get some fresh air if possible.' },
    { timeSlot: '13:15 - 14:45', activity: 'Secondary tasks & project follow-ups', tips: 'Batch similar tasks together.' },
    { timeSlot: '14:45 - 15:00', activity: 'Daily review & planning tomorrow', tips: 'Check off completed items and celebrate wins!' },
  ];

  res.json({
    plan: {
      summary: `Targeted ${availableHours}-hour focus plan optimized for highest-priority momentum.`,
      recommendedTaskIds: tasks?.slice(0, 3).map((t: any) => t.id) || [],
      schedule: sampleSchedule,
      motivationalAdvice: 'Start with your most challenging task while your willpower and cognitive stamina are highest.',
    },
    source: 'fallback',
  });
});

// 3. Prioritize Backlog and Recommend Next Task
app.post('/api/ai/prioritize', async (req: Request, res: Response) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Tasks array cannot be empty' });
  }

  if (aiClient) {
    try {
      const prompt = `Review these user tasks:
${JSON.stringify(tasks.slice(0, 20))}

Analyze them by urgency, deadline proximity, and estimated value.
Return JSON:
{
  "recommendedNextTaskId": "task_id_here",
  "reasoning": "Why this task should be done right now",
  "prioritizedTaskIds": ["ordered list of task ids from highest to lowest priority"],
  "quickTips": ["tip 1", "tip 2"]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ result: parsed, source: 'gemini' });
    } catch (err: any) {
      console.warn('Gemini prioritize failed:', err?.message);
    }
  }

  // Heuristic prioritization: overdue first, then urgent, then high, then earliest deadline
  const sorted = [...tasks].sort((a: any, b: any) => {
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
    if (pDiff !== 0) return pDiff;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return 0;
  });

  const nextTask = sorted[0];

  res.json({
    result: {
      recommendedNextTaskId: nextTask?.id,
      reasoning: nextTask ? `"${nextTask.title}" has the highest priority (${nextTask.priority}) and immediate deadline relevance.` : 'No active tasks found.',
      prioritizedTaskIds: sorted.map((t: any) => t.id),
      quickTips: [
        'Complete the hardest 20% of work first to unlock 80% of your progress.',
        'Break tasks exceeding 90 minutes into bite-sized 25-minute Pomodoro sessions.',
      ],
    },
    source: 'fallback',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
