"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskBoard from "@/components/TaskBoard";
import TaskSidebar from "@/components/ui/TaskSidebar";
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { router } from "@inertiajs/react";
import { FolderKanban, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  auth,
  project,
  hasClientKeys = true,
  hasProjects = true
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
  project?: { due_date: string };
  hasClientKeys?: boolean;
  hasProjects?: boolean;
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
  const [showDueDateAlert, setShowDueDateAlert] = useState(false);

  React.useEffect(() => {
    setOptimisticTasks(initialTasks);
  }, [initialTasks]);

    // If no projects exist, show warning message
  if (!hasProjects) {
    return (
      <AppShell variant="sidebar">
        <AppSidebar />
        <SidebarInset>
          <AppSidebarHeader breadcrumbs={[]} />
          <div className="flex h-[70vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 border border-border p-6">
              <FolderKanban className="h-14 w-14 text-foreground" />
            </div>
            <h1 className="mb-3 text-2xl font-semibold text-foreground">No Projects Found</h1>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              You need to create at least one project before creating or managing tasks.
            </p>
            <Button
              onClick={() => router.visit('/admin/projects')}
              className="gap-2 rounded-none bg-foreground text-background hover:bg-foreground/90"
            >
              <FolderKanban className="h-4 w-4" />
              Go to Project Management
            </Button>
          </div>
        </SidebarInset>
      </AppShell>
    );
  }

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

    const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

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
          clients={clients}
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
          className={`fixed right-0 top-0 z-[100] h-full w-96 transform transition-transform duration-300 ease-linear ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
         <TaskSidebar
          isOpen={sidebarOpen}
          task={selectedTask}
          mode={sidebarMode}
          isLoading={isProcessing}
          onClose={closeSidebar}
          onDelete={handleDelete}
          clients={clients}
          userRole={auth.user.role}
          isAdmin={auth.user.role === "admin"}
          clientKey={client_key_id}
          currentUserId={auth.user.id}
          routePrefix={routePrefix}
          projectDueDate={project?.due_date}
          onDueDateError={() => setShowDueDateAlert(true)}
        />
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteDialogOpen(false)} />
            <div className="relative z-10 max-w-sm space-y-4 border border-border bg-background p-6">
              <h3 className="text-lg font-semibold text-foreground">Delete Task?</h3>
              <p className="text-sm text-muted-foreground">This action cannot be undone. The task will be permanently deleted.</p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isProcessing}
                  className="rounded-none border-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isProcessing}
                  className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                >
                  {isProcessing ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarInset>

      {/* Backdrop Overlay */}
      {showDueDateAlert && (
        <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" />
      )}

      {/* Alert Dialog */}
      <AlertDialog open={showDueDateAlert} onOpenChange={setShowDueDateAlert}>
        <AlertDialogContent className="z-[200] rounded-none border-border">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border border-border">
                <AlertTriangle className="h-5 w-5 text-foreground" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Invalid Due Date
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
          The task due date cannot be later than the project due date ({project?.due_date ? formatDate(project.due_date) : 'N/A'}). Please select a valid due date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowDueDateAlert(false)}
              className="rounded-none bg-foreground text-background hover:bg-foreground/90"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}