import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { aiService, AIBreakdownTask, AIDailyPlan, AIPrioritization } from '../../services/aiService';
import {
  X,
  Sparkles,
  Target,
  Calendar,
  Compass,
  FileText,
  Check,
  Clock,
  Flag,
  Loader2,
  ArrowRight,
  ListPlus,
  AlertCircle,
  Lightbulb,
  Timer,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIModalOpen,
    setIsAIModalOpen,
    tasks,
    createTask,
    categories,
    showToast,
    startPomodoroForTask,
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'breakdown' | 'planner' | 'prioritize' | 'summary'>('breakdown');

  // Breakdown state
  const [goal, setGoal] = useState('');
  const [timeframeDays, setTimeframeDays] = useState(7);
  const [goalCategory, setGoalCategory] = useState('Study');
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<AIBreakdownTask[]>([]);
  const [selectedTaskIndices, setSelectedTaskIndices] = useState<number[]>([]);
  const [breakdownSource, setBreakdownSource] = useState<'gemini' | 'fallback' | null>(null);

  // Daily plan state
  const [availableHours, setAvailableHours] = useState(6);
  const [dailyPlan, setDailyPlan] = useState<AIDailyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Prioritize state
  const [prioritization, setPrioritization] = useState<AIPrioritization | null>(null);
  const [isGeneratingPrioritize, setIsGeneratingPrioritize] = useState(false);

  // Workload summary state
  const [summaryText, setSummaryText] = useState<string | null>(null);

  if (!isAIModalOpen) return null;

  // Handle Goal Breakdown
  const handleGenerateBreakdown = async (customGoal?: string) => {
    const targetGoal = customGoal || goal;
    if (!targetGoal.trim()) return;

    setIsGeneratingBreakdown(true);
    setGeneratedTasks([]);
    setSelectedTaskIndices([]);

    try {
      const res = await aiService.breakdownGoal(targetGoal, timeframeDays, goalCategory);
      setGeneratedTasks(res.tasks);
      setSelectedTaskIndices(res.tasks.map((_, i) => i)); // Select all by default
      setBreakdownSource(res.source);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'AI Generation Failed',
        message: err?.message || 'Could not connect to AI service.',
      });
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  // Import Selected AI Tasks into TaskFlow
  const handleImportSelectedTasks = async () => {
    const tasksToImport = generatedTasks.filter((_, idx) => selectedTaskIndices.includes(idx));
    if (tasksToImport.length === 0) return;

    for (const t of tasksToImport) {
      await createTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        category: t.category || goalCategory,
        estimatedMinutes: t.estimatedMinutes,
        dueDate: t.dueDate,
        subtasks: (t.subtasks || []).map((subTitle, i) => ({
          id: `sub-${Date.now()}-${i}`,
          title: subTitle,
          completed: false,
        })),
        recurrence: 'none',
      });
    }

    showToast({
      type: 'success',
      title: 'Tasks Imported! 🚀',
      message: `Successfully added ${tasksToImport.length} tasks to your schedule.`,
    });

    setIsAIModalOpen(false);
  };

  // Handle Daily Plan
  const handleGenerateDailyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const pendingTasks = tasks.filter((t) => t.status !== 'completed');
      const res = await aiService.generateDailyPlan(pendingTasks, availableHours);
      setDailyPlan(res.plan);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Plan generation failed',
        message: err?.message,
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Handle Prioritization
  const handlePrioritize = async () => {
    setIsGeneratingPrioritize(true);
    try {
      const pendingTasks = tasks.filter((t) => t.status !== 'completed');
      if (pendingTasks.length === 0) {
        showToast({
          type: 'info',
          title: 'No pending tasks',
          message: 'All tasks are completed! Add new tasks to prioritize.',
        });
        return;
      }
      const res = await aiService.prioritizeTasks(pendingTasks);
      setPrioritization(res.result);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Prioritization failed',
        message: err?.message,
      });
    } finally {
      setIsGeneratingPrioritize(false);
    }
  };

  // Generate Workload Summary
  const handleGenerateSummary = () => {
    const pending = tasks.filter((t) => t.status !== 'completed');
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = pending.filter((t) => t.dueDate < todayStr);
    const todayDue = pending.filter((t) => t.dueDate === todayStr);
    const urgent = pending.filter((t) => t.priority === 'urgent' || t.priority === 'high');

    const totalEstimatedMins = pending.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
    const hours = (totalEstimatedMins / 60).toFixed(1);

    const summary = `You currently have ${pending.length} pending tasks totaling approximately ${hours} hours of estimated focus work.

${overdue.length > 0 ? `⚠️ ATTENTION: ${overdue.length} tasks are overdue and require immediate focus.` : '✅ All tasks are currently on or ahead of schedule.'}

📅 Today: ${todayDue.length} tasks scheduled for today.
🔥 High Urgency: ${urgent.length} tasks marked urgent or high priority.
💡 Recommendation: Dedicate a 90-minute morning Pomodoro block to tackle overdue & urgent items first before beginning new assignments.`;

    setSummaryText(summary);
  };

  const sampleGoals = [
    'Prepare for my engineering exam in 7 days',
    'Build and launch my personal portfolio website',
    'Write literature review paper for research thesis',
    '30-day healthy habit & morning running challenge',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>TaskFlow Smart AI Assistant</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Google Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAIModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'breakdown'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Goal Breakdown</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('planner');
              if (!dailyPlan) handleGenerateDailyPlan();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'planner'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Schedule</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('prioritize');
              if (!prioritization) handlePrioritize();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'prioritize'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Prioritization Advisor</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('summary');
              if (!summaryText) handleGenerateSummary();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Workload Summary</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GOAL BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  What is your high-level goal or exam target?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Prepare for my engineering exam in 7 days"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateBreakdown();
                    }}
                  />
                  <button
                    onClick={() => handleGenerateBreakdown()}
                    disabled={!goal.trim() || isGeneratingBreakdown}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all shrink-0"
                  >
                    {isGeneratingBreakdown ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Planning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Break Down</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggestions chips */}
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Quick examples:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {sampleGoals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGoal(g);
                        handleGenerateBreakdown(g);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors text-left"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options: Days & Category */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Timeline Duration:
                  </span>
                  <select
                    value={timeframeDays}
                    onChange={(e) => setTimeframeDays(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value={3}>3 Days (Sprint)</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">
                    Target Category:
                  </span>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generated Tasks Preview List */}
              {generatedTasks.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Task Preview ({selectedTaskIndices.length} of {generatedTasks.length} selected)
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Review and customize tasks before saving them to your task manager.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedTaskIndices.length === generatedTasks.length) {
                          setSelectedTaskIndices([]);
                        } else {
                          setSelectedTaskIndices(generatedTasks.map((_, i) => i));
                        }
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {selectedTaskIndices.length === generatedTasks.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {generatedTasks.map((t, idx) => {
                      const isSelected = selectedTaskIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                              : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedTaskIndices(selectedTaskIndices.filter((i) => i !== idx));
                                } else {
                                  setSelectedTaskIndices([...selectedTaskIndices, idx]);
                                }
                              }}
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {t.title}
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                  Due {t.dueDate}
                                </span>
                              </div>

                              {t.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {t.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-500">
                                <span className="capitalize font-medium text-amber-600 dark:text-amber-400">
                                  {t.priority} Priority
                                </span>
                                <span>·</span>
                                <span>{t.estimatedMinutes} mins</span>
                                {t.subtasks && t.subtasks.length > 0 && (
                                  <>
                                    <span>·</span>
                                    <span>{t.subtasks.length} subtasks</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add selected button */}
                  <div className="pt-2">
                    <button
                      onClick={handleImportSelectedTasks}
                      disabled={selectedTaskIndices.length === 0}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span>
                        Add Selected ({selectedTaskIndices.length}) Tasks to My Tasks
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DAILY SCHEDULE PLANNER */}
          {activeTab === 'planner' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                    Available focus hours today:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    AI will balance deep focus blocks, breaks, and buffer times.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={availableHours}
                    onChange={(e) => setAvailableHours(parseInt(e.target.value, 10))}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value={4}>4 Hours</option>
                    <option value={6}>6 Hours (Standard)</option>
                    <option value={8}>8 Hours (Full Day)</option>
                    <option value={10}>10 Hours (Intensive)</option>
                  </select>
                  <button
                    onClick={handleGenerateDailyPlan}
                    disabled={isGeneratingPlan}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isGeneratingPlan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Refresh Plan</span>
                  </button>
                </div>
              </div>

              {dailyPlan && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
                    <p className="font-medium leading-relaxed">{dailyPlan.summary}</p>
                    {dailyPlan.motivationalAdvice && (
                      <div className="flex items-center gap-1.5 mt-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                        <span>Tip: {dailyPlan.motivationalAdvice}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline slots */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Suggested Time-Blocked Schedule
                    </h4>
                    {dailyPlan.schedule.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs"
                      >
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-1 rounded-md shrink-0">
                          {slot.timeSlot}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                            {slot.activity}
                          </span>
                          {slot.tips && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                              {slot.tips}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRIORITIZATION ADVISOR */}
          {activeTab === 'prioritize' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Backlog Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Evaluates deadline closeness, effort, and importance.
                  </p>
                </div>
                <button
                  onClick={handlePrioritize}
                  disabled={isGeneratingPrioritize}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {isGeneratingPrioritize ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Re-Evaluate</span>
                </button>
              </div>

              {prioritization && (
                <div className="space-y-4">
                  {/* Recommended Next Task Card */}
                  {prioritization.recommendedNextTaskId && (
                    <div className="p-4 rounded-xl bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-pink-950/30 border border-indigo-200/70 dark:border-indigo-800/60 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                        Recommended Next Action
                      </span>
                      {(() => {
                        const recTask = tasks.find((t) => t.id === prioritization.recommendedNextTaskId);
                        return recTask ? (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {recTask.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                              {prioritization.reasoning}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAIModalOpen(false);
                                startPomodoroForTask(recTask.id);
                              }}
                              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <Timer className="w-3.5 h-3.5" />
                              <span>Start Focus on This Task</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {prioritization.reasoning}
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  {/* Quick Tips */}
                  {prioritization.quickTips && prioritization.quickTips.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-xs space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                        Productivity Takeaways:
                      </span>
                      {prioritization.quickTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WORKLOAD SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Workload Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time synthesis of pending tasks and estimated effort.
                  </p>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  Refresh
                </button>
              </div>

              {summaryText && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono">
                  {summaryText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
