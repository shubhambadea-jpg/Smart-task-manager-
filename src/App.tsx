import React, { useState, useEffect } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { MyTasksView } from './components/views/MyTasksView';
import { TodayView } from './components/views/TodayView';
import { UpcomingView } from './components/views/UpcomingView';
import { CalendarView } from './components/views/CalendarView';
import { ProjectsView } from './components/views/ProjectsView';
import { CompletedView } from './components/views/CompletedView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { PomodoroModal } from './components/pomodoro/PomodoroModal';
import { ToastContainer } from './components/common/ToastContainer';

function AppContent() {
  const {
    activeView,
    setActiveView,
    openTaskModal,
    closeTaskModal,
    isTaskModalOpen,
    isAIModalOpen,
    setIsAIModalOpen,
    isPomodoroModalOpen,
    setIsPomodoroModalOpen,
  } = useTasks();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes open modals or blurs active inputs
      if (e.key === 'Escape') {
        if (isTaskModalOpen) closeTaskModal();
        if (isAIModalOpen) setIsAIModalOpen(false);
        if (isPomodoroModalOpen) setIsPomodoroModalOpen(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      // Check for search shortcut '/' or Cmd/Ctrl + K
      if (
        (e.key === '/' && !['input', 'textarea', 'select'].includes(document.activeElement?.tagName.toLowerCase() || '')) ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Ignore other shortcuts if typing inside input, textarea, or select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openTaskModal();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setIsAIModalOpen(true);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPomodoroModalOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setActiveView('today');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveView('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    openTaskModal,
    closeTaskModal,
    isTaskModalOpen,
    isAIModalOpen,
    setIsAIModalOpen,
    isPomodoroModalOpen,
    setIsPomodoroModalOpen,
    setActiveView,
  ]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <MyTasksView />;
      case 'today':
        return <TodayView />;
      case 'upcoming':
        return <UpcomingView />;
      case 'calendar':
        return <CalendarView />;
      case 'projects':
        return <ProjectsView />;
      case 'completed':
        return <CompletedView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* View Viewport */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <TaskModal />
      <AIAssistantModal />
      <PomodoroModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
