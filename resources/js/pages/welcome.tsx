import React, { useState } from 'react';
import { Task, Project, TaskStatus } from '@/types';
import { initialTasks, initialProjects } from '@/data/mockData';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { SolutionsSection } from '@/components/SolutionsSection';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { PricingSection } from '@/components/PricingSection';
import { TestimonialsFAQ } from '@/components/TestimonialsFAQ';
import { Footer } from '@/components/Footer';
import { AddTaskModal } from '@/components/AddTaskModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { AuthModal } from '@/components/AuthModal';
import { FullDashboardView } from '@/components/FullDashboardView';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects] = useState<Project[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<Project>(initialProjects[1]); // Product Backlog
  const [activeSection, setActiveSection] = useState('home');

  // Modal States
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'signup'
  });
  const [isFullDemoOpen, setIsFullDemoOpen] = useState(false);

  // Handlers
  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `t_${Date.now()}`
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => (t.id === taskId ? { ...t, status: newStatus } : t)));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans text-[var(--ink)] selection:bg-[var(--ink)] selection:text-[var(--bg)]">
      {/* Fixed Navigation Bar */}
      <Navbar
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onOpenFullDemo={() => setIsFullDemoOpen(true)}
        activeSection={activeSection}
      />

      {/* Hero Showcase with Embedded Interactive Dashboard Card */}
      <HeroSection
        tasks={tasks}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onOpenTaskDetail={(task) => setSelectedTask(task)}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onOpenFullDemo={() => setIsFullDemoOpen(true)}
      />

      {/* Feature Highlights Section */}
      <FeaturesSection />

      {/* Tailored Solutions Section */}
      <SolutionsSection onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })} />

      {/* Real-time Analytics Section */}
      <AnalyticsSection />

      {/* Pricing Tiers Section */}
      <PricingSection onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })} />

      {/* Social Proof & FAQ */}
      <TestimonialsFAQ />

      {/* Footer */}
      <Footer
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onOpenFullDemo={() => setIsFullDemoOpen(true)}
      />

      {/* Modals & Overlays */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTask={handleDeleteTask}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={() => setIsFullDemoOpen(true)}
      />

      {/* Full Workspace Interactive App Demo View */}
      {isFullDemoOpen && (
        <FullDashboardView
          tasks={tasks}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={setActiveProject}
          onClose={() => setIsFullDemoOpen(false)}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenTaskDetail={(task) => setSelectedTask(task)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
