"use client";

import React, { useState } from "react";
import { Plus, User, Mic, FileText } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import KanbanBoard from "@/components/kanbanboard";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
  file?: string | null;
  voice_message?: string | null;
}

interface Props {
  tasks: Task[];
  clients?: { id: string; key: string }[];
  client_key_id?: string;
  auth: { 
    user: {
      id: number;
      role: string;
    } 
  };
  file?: string | null;
}

export default function Index({ tasks: initialTasks, clients = [], client_key_id, auth }: Props) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>(initialTasks);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleView = (taskId: number) => {
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (task) {
      setViewTask(task);
      setViewDialogOpen(true);
    }
  };

  const routePrefix = auth.user.role === 'admin' ? '/admin' : '/client';
  
  React.useEffect(() => {
    setOptimisticTasks(initialTasks);
  }, [initialTasks]);

  const { data, setData, post, processing, reset, errors } = useForm({
    title: "",
    description: "",
    client_key_id: "",
    due_date: "",
    status: "todo",
    file: null as File | null,
    voice_message: "",
    editingTaskId: editingTask ? editingTask.id : null,
  });

  const startRecording = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.");
        return;
      }

      // Check current permission state
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'denied') {
          alert(
            "Microphone access is blocked. Please:\n\n" +
            "1. Click the lock/info icon in the address bar\n" +
            "2. Allow microphone access\n" +
            "3. Reload the page and try again"
          );
          return;
        }
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setData("voice_message", base64data);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      
      let errorMessage = "Could not access microphone. ";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += "Please allow microphone access when prompted, or check your browser settings.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += "Your microphone is being used by another application. Please close other apps and try again.";
      } else if (error.name === 'SecurityError') {
        errorMessage += "This feature requires HTTPS. If you're on localhost, make sure you're using http://localhost (not an IP address).";
      } else {
        errorMessage += "Please check your browser settings and permissions.";
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("client_key_id", data.client_key_id || client_key_id || "");
    formData.append("due_date", data.due_date || "");
    formData.append("status", data.status || "todo");

    if (inputMode === "voice" && data.voice_message) {
      formData.append("voice_message", data.voice_message);
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    if (editingTask) {
      formData.append("_method", "PATCH");

      router.post(`${routePrefix}/tasks/${editingTask.id}`, formData, {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          setEditingTask(null);
          setOpen(false);
          setInputMode("text");
        },
      });
      return;
    }

    router.post(`${routePrefix}/tasks`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpen(false);
        setInputMode("text");
      },
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    // Set input mode based on how the task was originally created
    const taskInputMode = task.voice_message ? "voice" : "text";
    setInputMode(taskInputMode);
    
    setData({
      title: task.title,
      description: task.description || "",
      client_key_id: task.client_key_id || "",
      due_date: "",
      status: task.status,
      file: null,
      voice_message: task.voice_message || "",
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
      setInputMode("text");
      setData("voice_message", "");
      reset();
    }
  };

  const updateTaskStatus = (id: number, status: Task["status"]) => {
    setOptimisticTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );

    router.patch(
      `${routePrefix}/tasks/${id}`,
      { status },
      {
        preserveScroll: true,
        only: ['tasks'],
        onError: () => {
          setOptimisticTasks(initialTasks);
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
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
                  {/* Input Mode Selection - Only show when creating new task */}
                  {!editingTask && (
                    <div className="space-y-3">
                      <Label>Input Method</Label>
                      <RadioGroup
                        value={inputMode}
                        onValueChange={(value: "text" | "voice") => setInputMode(value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text" id="text" />
                          <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                            <FileText className="h-4 w-4" />
                            Text Input
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="voice" id="voice" />
                          <Label htmlFor="voice" className="flex items-center gap-2 cursor-pointer">
                            <Mic className="h-4 w-4" />
                            Voice Message
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Show input mode indicator when editing */}
                  {editingTask && (
                    <div className="bg-muted p-3 rounded-md flex items-center gap-2">
                      {inputMode === "voice" ? (
                        <>
                          <Mic className="h-4 w-4" />
                          <span className="text-sm">Editing voice message task</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Editing text task</span>
                        </>
                      )}
                    </div>
                  )}

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

                  {inputMode === "text" ? (
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
                  ) : (
                    <div className="space-y-2">
                      <Label>Voice Message</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          variant={isRecording ? "destructive" : "outline"}
                          className="gap-2"
                        >
                          <Mic className="h-4 w-4" />
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </Button>
                        {data.voice_message && (
                          <span className="text-sm text-green-600">✓ Voice message recorded</span>
                        )}
                      </div>
                      {isRecording && (
                        <p className="text-sm text-muted-foreground">Recording in progress...</p>
                      )}
                      {errors.voice_message && (
                        <p className="text-sm text-red-500">{errors.voice_message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={data.due_date}
                      onChange={(e) => setData("due_date", e.target.value)}
                      className={errors.due_date ? "border-red-500" : ""}
                    />
                    {errors.due_date && (
                      <p className="text-sm text-red-500">{errors.due_date}</p>
                    )}
                    <p className="text-sm text-gray-500">Please select a due date if applicable</p>
                  </div>

                  <div>
                    <Label htmlFor="file">Attach File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setData("file", file);
                      }}
                    />
                    {errors.file && (
                      <p className="text-sm text-red-500 mt-1">{errors.file}</p>
                    )}
                    <p className="text-sm text-gray-500">Max file size: 10MB. Allowed types: PDF, DOC, DOCX, JPG, PNG.</p>
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
                <div>
                  <h4 className="font-medium mb-2">Description:</h4>
                  <p className="text-sm leading-relaxed">{viewTask.description}</p>
                </div>
              )}

              {viewTask.voice_message && (
                <div>
                  <h4 className="font-medium mb-2">Voice Message:</h4>
                  <audio controls className="w-full">
                    <source src={viewTask.voice_message} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {viewTask.file && (
                <div>
                  <h4 className="font-medium mb-2">Attached File:</h4>
                  <a
                    href={`/storage/${viewTask.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {viewTask.file.split("/").pop()}
                  </a>
                </div>
              )}

              <TaskComments
                taskId={viewTask.id}
                isAdmin={auth.user.role === "admin"}
                clientKey={client_key_id}
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