"use client";

import React, { useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import TaskComments from "@/components/task-comment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import KanbanBoard from "@/components/kanbanboard";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
}

interface Props {
  tasks: Task[];
  clients: { id: string; key: string }[];
  auth: { user: {
    id: number;
    client_key_id: string | undefined; role: string 
} };

}

export default function Index({ tasks: initialTasks, clients, auth }: Props) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(initialTasks);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

// Function to handle viewing a task
const handleView = (taskId: number) => {
  const task = optimisticTasks.find((t) => t.id === taskId);
  if (task) {
    setViewTask(task);
    setViewDialogOpen(true);
  }
};


  // Determine route prefix based on user role
  const routePrefix = auth.user.role === 'admin' ? '/admin' : '/client';
  
  // Update optimistic tasks when initialTasks changes
  React.useEffect(() => {
    setOptimisticTasks(initialTasks);
  }, [initialTasks]);

  // Use Inertia's useForm hook for proper form handling
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    description: "",
    client_key_id: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      router.patch(`${routePrefix}/tasks/${editingTask.id}`, data, {
        onSuccess: () => {
          reset();
          setOpen(false);
          setEditingTask(null);
        },
      });
    } else {
      // Create new task
      post(`${routePrefix}/tasks`, {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setData({
      title: task.title,
      description: task.description || "",
      client_key_id: task.client_key_id || "",
    });
    setOpen(true);
  };

  const handleDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete !== null) {
      router.delete(`${routePrefix}/tasks/${taskToDelete}`, {
        preserveScroll: true,
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        },
      });
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingTask(null);
      reset();
    }
  };

  const updateTaskStatus = (id: number, status: Task["status"]) => {
    // Optimistically update the UI immediately
    setOptimisticTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );

    // Use Inertia router to update task status in the background
    router.patch(
      `${routePrefix}/tasks/${id}`,
      { status },
      {
        preserveScroll: true,
        only: ['tasks'],
        onError: () => {
          // Revert optimistic update on error
          setOptimisticTasks(initialTasks);
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground mt-1">
                Manage and organize your tasks efficiently
              </p>
            </div>

            <Dialog open={open} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTask
                      ? "Update the task details below."
                      : "Add a new task to your kanban board. Fill in the details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData("title", e.target.value)}
                      placeholder="Enter task title"
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      placeholder="Describe the task in detail"
                      rows={4}
                      className={errors.description ? "border-red-500" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  {auth.user.role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="client">Assign to Client</Label>
                      <Select
                        value={data.client_key_id}
                        onValueChange={(value) => setData("client_key_id", value)}
                      >
                        <SelectTrigger 
                          id="client"
                          className={errors.client_key_id ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.key}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {client.key.substring(0, 8)}...
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client_key_id && (
                        <p className="text-sm text-red-500">{errors.client_key_id}</p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing
                        ? editingTask
                          ? "Updating..."
                          : "Creating..."
                        : editingTask
                        ? "Update Task"
                        : "Create Task"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Kanban Board */}
          <div className="pt-4">
            <KanbanBoard
              tasks={optimisticTasks}
              onStatusChange={updateTaskStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>View the full details of this task.</DialogDescription>
        </DialogHeader>

        {viewTask ? (
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold">{viewTask.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Status:{" "}
              <span className="capitalize font-medium">{viewTask.status}</span>
            </p>
          </div>

          {viewTask.description && (
            <p className="text-sm leading-relaxed">{viewTask.description}</p>
          )}

          {/* Add live comments here */}
        <TaskComments
          taskId={viewTask.id}
          isAdmin={auth.user.role === "admin"}
          clientKey={auth.user.client_key_id}
          currentUserId={auth.user.id} 
        />

        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-4">No task selected.</p>
      )}

      </DialogContent>
    </Dialog>
    </AppLayout>
  );
}