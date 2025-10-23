"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskBoard from "@/components/TaskBoard";
import TaskSidebar from "@/components/ui/TaskSidebar";
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card } from "@/components/ui/card";
import { router } from "@inertiajs/react";

// ============================================================================
// TYPES
// ============================================================================

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  progress_status?: "on_track" | "at_risk" | "off_track";
  priority: string;
  client_key_id?: string;
  file?: string | null;
  voice_message?: string | null;
  due_date?: string | null;
}

// ============================================================================
// MAIN INDEX COMPONENT
// ============================================================================

export default function Index({ 
  tasks: initialTasks, 
  clients = [], 
  client_key_id, 
  auth 
}: {
  tasks: Task[];
  clients?: { id: string; key: string }[];
  client_key_id?: string;
  auth: {
    user: {
      id: number;
      role: string;
    }
  };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit" | "create">("view");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(initialTasks);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    on_track: true,
    at_risk: true,
    off_track: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<'on_track' | 'at_risk' | 'off_track' | null>(null);

  const routePrefix = auth.user.role === 'admin' ? '/admin' : '/client';

  React.useEffect(() => {
    setOptimisticTasks(initialTasks);
  }, [initialTasks]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleView = (taskId: number) => {
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setSidebarMode("view");
      setSidebarOpen(true);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setSidebarMode("edit");
    setSidebarOpen(true);
  };

  const handleAddTaskFromProgress = (status: 'on_track' | 'at_risk' | 'off_track') => {
    setProgressStatus(status);
    setSelectedTask(null);
    setSidebarMode("create");
    setSidebarOpen(true);
  };

  const handleDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  // delete confirmation
  const confirmDelete = () => {
    if (taskToDelete !== null) {
      setIsProcessing(true);
      
      setOptimisticTasks(prev => prev.filter(task => task.id !== taskToDelete));
      
      router.delete(`${routePrefix}/tasks/${taskToDelete}`, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
          setIsProcessing(false);
          setSidebarOpen(false);
        },
        onError: (errors) => {
          console.error('Failed to delete task:', errors);

          setOptimisticTasks(initialTasks);
          setIsProcessing(false);
        }
      });
    }
  };
  const handleSave = (formData: FormData) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSidebarOpen(false);
      setSelectedTask(null);
      setProgressStatus(null);
    }, 500);
  };

const handleUpdateStatus = (taskId: number, status: Task["status"]) => {
  // Optimistically update the UI immediately
  setOptimisticTasks(prev => 
    prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    )
  );

  // Save to the database 
    const formData = new FormData();
    formData.append("status", status);
    formData.append("_method", "PATCH");

    router.post(`${routePrefix}/tasks/${taskId}`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Status updated successfully');
      },
      onError: (errors) => {
        console.error('Failed to update status:', errors);
        // Revert the optimistic update
        setOptimisticTasks(initialTasks);
      }
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedTask(null);
    setProgressStatus(null);
  };

  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <SidebarInset 
        className="overflow-x-hidden transition-[margin-right] duration-300 ease-linear"
        style={{
          marginRight: sidebarOpen ? '24rem' : '0'
        }}
      >
        <AppSidebarHeader breadcrumbs={[]} />
        
        <TaskBoard
          tasks={optimisticTasks}
          searchQuery={searchQuery}
          expandedSections={expandedSections}
          routePrefix={routePrefix}
          onToggleSection={toggleSection}
          onAddTask={handleAddTaskFromProgress}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-96 transform transition-transform duration-300 ease-linear z-[100] ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <TaskSidebar
            isOpen={sidebarOpen}
            task={selectedTask}
            mode={sidebarMode}
            isLoading={isProcessing}
            onClose={closeSidebar}
            onSave={handleSave}
            onDelete={handleDelete}
            clients={clients}
            userRole={auth.user.role}
            isAdmin={auth.user.role === "admin"}
            clientKey={client_key_id}
            currentUserId={auth.user.id}
            routePrefix={routePrefix}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteDialogOpen(false)} />
            <Card className=" border rounded-lg p-6 max-w-sm relative z-10 space-y-4">
              <h3 className="text-lg font-semibold text-white">Delete Task?</h3>
              <p className="text-gray-400 text-sm">This action cannot be undone. The task will be permanently deleted.</p>
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </SidebarInset>
    </AppShell>
  );
}