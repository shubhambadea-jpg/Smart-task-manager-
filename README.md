# TaskFlow – Smart Task Manager

TaskFlow is a modern, full-stack productivity dashboard and smart task manager designed for students and professionals to organize daily tasks, manage strict deadlines, cultivate habits, and track momentum.

Inspired by the clean simplicity of Notion and the focused speed of Todoist, TaskFlow pairs an intuitive interface with server-side Google Gemini intelligence and Pomodoro deep-work sprints.

---

## 🌟 Key Features

### 1. Unified Productivity Dashboard
- **6 Real-Time Metrics**: Total tasks, completed today, pending backlog, overdue items, tasks due today, and daily goal completion percentage.
- **Weekly Productivity Velocity Chart**: Visual bar chart showing daily completed vs. pending tasks.
- **Upcoming Deadlines Widget**: Quick peek at assignments due over the next 7 days.
- **Dynamic Motivational Quotes**: Thoughtful daily reflections from renowned authors and thinkers.
- **Streak Tracker**: Calculates consecutive active completion days with flame badges.

### 2. Complete Task Management
- **Full CRUD Support**: Create, edit, complete, duplicate, restore, and delete tasks.
- **Zero-Pill Typographic Hierarchy**: Clean metadata presentation with priority flags, project links, estimated time, and due dates.
- **Subtasks with Progress Tracking**: Add interactive checklists to any task with real-time subtask completion meters.
- **Recurrence Settings**: Daily, weekly, or monthly repetition.
- **Undo Accidental Deletions**: Instant toast snackbar allowing one-click undo.
- **Multi-Factor Filtering & Sorting**: Filter by status (To Do, In Progress, Completed), priority (Low, Medium, High, Urgent), category, or search query. Sort by deadline, priority, title, or creation date.
- **Dual View Modes**: Switch between responsive List View and Kanban Board View.

### 3. Dedicated Time Views
- **Today**: Focused view of today's tasks ranked by urgency and deadline, plus overdue alert banners.
- **Upcoming**: Chronologically grouped tasks for the next 7 days and beyond.
- **Interactive Calendar**: Monthly and weekly grid views with date-click task viewing and direct task scheduling.

### 4. Projects & Milestones
- Group related coursework or work deliverables into dedicated projects with custom color accents and target deadlines.
- Real-time progress bars showing percentage of project tasks completed.
- Direct task assignment and filtering per project.

### 5. Pomodoro Focus Timer
- 25-minute deep work intervals, 5-minute short breaks, and 15-minute long breaks (durations customizable in Settings).
- Real-time SVG circular countdown ring.
- Link timer directly to an active task.
- Synthesized Web Audio chimes on completion (no external audio files required).
- Logs completed focus minutes into personal productivity analytics.

### 6. Smart AI Assistant (Google Gemini 3.8 Flash)
- **Goal to Task Breakdown**: Converts high-level goals (e.g., *"Prepare for my engineering exam in 7 days"*) into actionable, multi-day tasks with time estimates, priorities, and subtasks.
- **Task Preview & Selective Import**: Users preview all generated tasks before saving and can select/deselect specific items with 1 click.
- **Daily Schedule Planner**: Synthesizes today's pending tasks into a realistic, time-blocked hourly study or work plan.
- **Prioritization Advisor**: Analyzes deadlines and backlog complexity to recommend which task to tackle next.
- **Workload Summary**: Synthesizes total estimated focus hours and potential deadline bottlenecks.

### 7. Productivity Analytics (Recharts)
- 14-day completion trend area chart.
- Priority distribution comparison (Total vs. Completed).
- Category workload distribution pie chart.
- Peak productive day calculation and focus session history.

### 8. Reminders & Browser Notifications
- Periodic deadline checks alerting users of tasks due within 30 minutes.
- Browser notification support with permission toggle and duplicate alert suppression.

### 9. Data Portability & Settings
- Export tasks to CSV.
- Full backup export and restore via JSON.
- Reset to initial demo data with 1 click.
- Light and dark theme toggle with persistent configuration.
- Week start preference (Monday vs. Sunday).

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion.
- **Charts**: Recharts.
- **Confetti**: Canvas-confetti for task completion celebration.
- **Audio**: Web Audio API oscillator synthesis for chimes.
- **Backend**: Express on Node.js (`server.ts`) with Vite middleware.
- **AI Integration**: Google Gemini API via official `@google/genai` TypeScript SDK (model `gemini-3.8-flash`).
- **Cloud Database & Auth**: Firebase Authentication & Cloud Firestore (with complete local Demo Mode fallback).

---

## 🚀 Installation & Running

### Development
```bash
# Start full-stack server (port 3000)
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 🔐 Configuration & Environment Variables

Copy `.env.example` to `.env`:

```env
# Google Gemini API key (automatically injected in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Optional: Firebase Authentication & Cloud Firestore
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

### Demo Mode vs. Cloud Sync
- **When Firebase variables are NOT set**: TaskFlow runs automatically in **Demo Mode**. All data (tasks, projects, categories, focus logs, and preferences) is saved to the browser's persistent `localStorage`.
- **When Firebase variables ARE set**: TaskFlow connects to Firebase Authentication and Cloud Firestore using the secure `firestore.rules` provided in the repository.

---

## 🔒 Cloud Firestore Security Rules

See `firestore.rules` for full rules. Summary:
- Each authenticated user can read, create, update, and delete only documents where `resource.data.userId == request.auth.uid`.
- Unauthenticated access is strictly rejected.

---

## ⌨️ Desktop Keyboard Shortcuts

- `N`: Quick-add new task modal
- `A`: Open Smart AI Assistant
- `P`: Open Pomodoro Focus Timer
- `T`: Navigate to Today view
- `D`: Navigate to Dashboard view
- `Esc`: Close any active modal
