"use client";

import React, { useState } from "react";
import { Plus, User, Mic, FileText, Search, Filter, Calendar, Flag, ChevronDown, MoreHorizontal, Eye } from "lucide-react";
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
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  progress_status?: "on_track" | "at_risk" | "off_track"; 
  client_key_id?: string;
  file?: string | null;
  voice_message?: string | null;
  due_date?: string | null;
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [progressStatus, setProgressStatus] = useState<'on_track' | 'at_risk' | 'off_track' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    on_track: true,
    at_risk: true,
    off_track: true
  });

  const routePrefix = auth.user.role === 'admin' ? '/admin' : '/client';
  
  React.useEffect(() => {
    setOptimisticTasks(initialTasks);
  }, [initialTasks]);

  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    title: "",
    description: "",
    client_key_id: "",
    due_date: "",
    status: "todo",
    file: null as File | null,
    voice_message: "",
    progress_status: null as 'on_track' | 'at_risk' | 'off_track' | null,
  });

  // Categorize tasks by progress status based on due date and current status
const categorizeTask = (task: Task) => {
  // Use stored progress_status from database instead of calculating
  return task.progress_status || 'on_track';
};

  const filteredTasks = optimisticTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = {
    on_track: {
      title: 'On Track',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      tasks: filteredTasks.filter(task => categorizeTask(task) === 'on_track')
    },
    at_risk: {
      title: 'At Risk',
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      tasks: filteredTasks.filter(task => categorizeTask(task) === 'at_risk')
    },
    off_track: {
      title: 'Off Track',
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      tasks: filteredTasks.filter(task => categorizeTask(task) === 'off_track')
    }
  };

  const getPriorityLevel = (task: Task) => {
    if (!task.due_date) return 'normal';
    const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0 || daysUntilDue <= 2) return 'urgent';
    if (daysUntilDue <= 7) return 'high';
    return 'normal';
  };

  const priorityConfig = {
    urgent: { label: 'Urgent', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: '🚩' },
    high: { label: 'High', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🏴' },
    normal: { label: 'Normal', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: '🏳️' }
  };

const statusConfig = {
  todo: { 
    label: 'TO DO', 
    color: 'bg-slate-700/50 text-slate-300 border-slate-600',
    icon: (
      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
      </div>
    )
  },
  in_progress: { 
    label: 'IN PROGRESS', 
    color: 'bg-purple-600 text-white border-purple-600',
    icon: (
      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="30"/>
        </svg>
      </div>
    )
  },
  done: { 
    label: 'DONE', 
    color: 'bg-emerald-600 text-white border-emerald-600',
    icon: (
      <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
};

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleView = (taskId: number) => {
    const task = optimisticTasks.find((t) => t.id === taskId);
    if (task) {
      setViewTask(task);
      setViewDialogOpen(true);
    }
  };

  const handleAddTaskFromProgress = (status: 'on_track' | 'at_risk' | 'off_track') => {
    setProgressStatus(status);
    setOpen(true);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.");
        return;
      }

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
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.voice_message;
            return newErrors;
          });
        };
        reader.readAsDataURL(blob);
        
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.title || data.title.trim() === "") {
      newErrors.title = "Task title is required";
    }

    if (auth.user.role === "admin" && !data.client_key_id && !client_key_id) {
      newErrors.client_key_id = "Please select a client";
    }

    if (inputMode === "voice" && !data.voice_message && !editingTask?.voice_message) {
      newErrors.voice_message = "Please record a voice message or switch to text input";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("client_key_id", data.client_key_id || client_key_id || "");
    formData.append("status", data.status || "todo");

    if (progressStatus && !editingTask) {
      formData.append("progress_status", progressStatus);
    }

    if (progressStatus && !editingTask && !data.due_date) {
      const today = new Date();
      let calculatedDueDate = new Date();
      
      if (progressStatus === 'on_track') {
        calculatedDueDate.setDate(today.getDate() + 14);
      } else if (progressStatus === 'at_risk') {
        calculatedDueDate.setDate(today.getDate() + 5);
      } else if (progressStatus === 'off_track') {
        calculatedDueDate.setDate(today.getDate() + 2);
      }
      
      formData.append("due_date", calculatedDueDate.toISOString().split('T')[0]);
    } else {
      formData.append("due_date", data.due_date || "");
    }

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
          setValidationErrors({});
          setProgressStatus(null);
          clearErrors();
        },
        onError: (errors) => {
          console.error("Validation errors:", errors);
        }
      });
      return;
    }

    router.post(`${routePrefix}/tasks`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOpen(false);
        setInputMode("text");
        setValidationErrors({});
        setProgressStatus(null);
        clearErrors();
      },
      onError: (errors) => {
        console.error("Validation errors:", errors);
      }
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    const taskInputMode = task.voice_message ? "voice" : "text";
    setInputMode(taskInputMode);
    
    setData({
      title: task.title,
      description: task.description || "",
      client_key_id: task.client_key_id || "",
      due_date: task.due_date || "",
      status: task.status,
      file: null,
      voice_message: task.voice_message || "",
      progress_status: null,
    });
    setValidationErrors({});
    setProgressStatus(null);
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
      setValidationErrors({});
      setProgressStatus(null);
      reset();
      clearErrors();
    }
  };

const updateTaskStatus = (id: number, status: Task["status"]) => {
    setOptimisticTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );

    router.post(
      `${routePrefix}/tasks/${id}`,
      { 
        _method: 'PATCH',
        status 
      },
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
      <div className="min-h-screen bg-black text-white">
        {/* Main Content */}
        <div className="p-6">
          {Object.entries(columns).map(([key, column]) => (
            <div key={key} className="mb-6">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => toggleSection(key as keyof typeof expandedSections)}
                  className="p-0.5 hover:bg-gray-800 rounded transition-colors"
                >
                  <ChevronDown 
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      expandedSections[key as keyof typeof expandedSections] ? '' : '-rotate-90'
                    }`}
                  />
                </button>
                <div className={`px-3 py-1 ${column.color} text-white text-sm font-semibold rounded-md`}>
                  {column.title}
                </div>
                <span className="text-gray-500 text-sm">{column.tasks.length}</span>
                <button className="ml-auto p-1 hover:bg-gray-800 rounded transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
                <button 
                  onClick={() => handleAddTaskFromProgress(key as 'on_track' | 'at_risk' | 'off_track')}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <Plus className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Table */}
              {expandedSections[key as keyof typeof expandedSections] && (
                <div className="bg-muted/30 rounded-lg border">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b  text-xs text-gray-500 font-medium">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Assignee</div>
                    <div className="col-span-2">Due date</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Progress</div>
                  </div>

                  {/* Table Rows */}
                  {column.tasks.map((task) => {
                    const priority = getPriorityLevel(task);
                    const priorityInfo = priorityConfig[priority];
                    const statusInfo = statusConfig[task.status];

                    return (
                      <div
                        key={task.id}
                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors group"
                      >
                        <div className="col-span-3 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-purple-500 flex items-center justify-center">
                            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                          </div>
                          <span className="font-medium text-sm truncate">{task.title}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={() => handleView(task.id)}
                              className="p-1 hover:bg-gray-800 rounded transition-colors"
                              title="View details and comments"
                            >
                              <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-200" />
                            </button>
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-1 hover:bg-gray-800 rounded transition-colors"
                              title="Edit task"
                            >
                              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1 hover:bg-gray-800 rounded transition-colors"
                              title="Delete task"
                            >
                              <svg className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-semibold border-2 border-gray-800">
                            {task.client_key_id?.substring(0, 2).toUpperCase() || 'NA'}
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </div>

                        <div className="col-span-2 flex items-center">
                          <Card className={`border p-0 ${priorityInfo.color}`}>
                            <CardContent className="p-1 px-3">
                              <div className="flex items-center gap-2 text-xs font-medium">
                                <Flag className="h-3.5 w-3.5" />
                                <span>{priorityInfo.label}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                            {/* Update the Status column in the table row */}
                            <div className="col-span-1 flex items-center">
                              <Select
                                value={task.status}
                                onValueChange={(value) => updateTaskStatus(task.id, value as Task["status"])}
                              >
                                <SelectTrigger className={`h-8 px-2.5 rounded-md text-xs font-semibold border ${statusInfo.color} w-auto min-w-[100px] [&>svg]:hidden`}>
                                  <div className="flex items-center gap-2">
                                    {statusInfo.icon}
                                    <span>{statusInfo.label}</span>
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-gray-800">
                                  {/* Not started section */}
                                  <div className="px-2 py-1.5 text-xs text-gray-500 font-medium">
                                    Not started
                                  </div>
                                  <SelectItem 
                                    value="todo"
                                    className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                      </div>
                                      <span className="font-semibold">TO DO</span>
                                    </div>
                                  </SelectItem>

                                  {/* Active section */}
                                  <div className="px-2 py-1.5 text-xs text-gray-500 font-medium mt-2">
                                    Active
                                  </div>
                                  <SelectItem 
                                    value="in_progress"
                                    className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="30"/>
                                        </svg>
                                      </div>
                                      <span className="font-semibold">IN PROGRESS</span>
                                    </div>
                                  </SelectItem>

                                  <SelectItem 
                                    value="done"
                                    className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                      <span className="font-semibold">COMPLETE</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                        <div className="col-span-2 flex items-center justify-end">
                          <span className={`px-3 py-1 ${column.color} text-white text-xs font-semibold rounded-md`}>
                            {column.title}
                          </span>
                        </div>
                      </div>
  
                    );
                  })}

                  {/* Add Task Row */}
                  <div 
                    onClick={() => handleAddTaskFromProgress(key as 'on_track' | 'at_risk' | 'off_track')}
                    className="px-6 py-3 text-gray-500 hover:bg-gray-900/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Plus className="h-4 w-4" />
                      <span>Add Task</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : progressStatus ? `Create Task - ${progressStatus.replace('_', ' ').toUpperCase()}` : "Create New Task"}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? "Update the task details below."
                : progressStatus
                ? `Add a new task in the ${progressStatus.replace('_', ' ')} category.`
                : "Add a new task to your board. Fill in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {!editingTask && !progressStatus && (
              <div className="space-y-3">
                <Label>Input Method</Label>
                <RadioGroup
                  value={inputMode}
                  onValueChange={(value: "text" | "voice") => {
                    setInputMode(value);
                    setValidationErrors({});
                  }}
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

            {progressStatus && (
              <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-md">
                <p className="text-sm text-purple-300">
                  Creating task for: <span className="font-semibold">{progressStatus.replace('_', ' ').toUpperCase()}</span>
                </p>
              </div>
            )}

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
              <Label htmlFor="title">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => {
                  setData("title", e.target.value);
                  if (validationErrors.title) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.title;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter task title"
                className={errors.title || validationErrors.title ? "border-red-500" : ""}
              />
              {(errors.title || validationErrors.title) && (
                <p className="text-sm text-red-500">{errors.title || validationErrors.title}</p>
              )}
            </div>

            {inputMode === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => {
                    setData("description", e.target.value);
                    if (validationErrors.description) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.description;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Describe the task in detail (optional)"
                  rows={4}
                  className={errors.description || validationErrors.description ? "border-red-500" : ""}
                />
                {(errors.description || validationErrors.description) && (
                  <p className="text-sm text-red-500">{errors.description || validationErrors.description}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  Voice Message {!editingTask && <span className="text-red-500">*</span>}
                </Label>
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
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <span className="text-lg">✓</span> Voice message recorded
                    </span>
                  )}
                </div>
                {isRecording && (
                  <p className="text-sm text-muted-foreground animate-pulse">Recording in progress...</p>
                )}
                {(errors.voice_message || validationErrors.voice_message) && (
                  <p className="text-sm text-red-500">{errors.voice_message || validationErrors.voice_message}</p>
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
              {progressStatus && !data.due_date && (
                <p className="text-sm text-purple-400">
                  A suggested due date will be set based on the progress status
                </p>
              )}
              {!progressStatus && (
                <p className="text-sm text-gray-500">Optional - select a due date if applicable</p>
              )}
            </div>

            <div className="space-y-2">
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
              <p className="text-sm text-gray-500">Optional - Max 10MB. Allowed: PDF, DOC, DOCX, JPG, PNG</p>
            </div>

            {auth.user.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="client">
                  Assign to Client <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={data.client_key_id}
                  onValueChange={(value) => {
                    setData("client_key_id", value);
                    if (validationErrors.client_key_id) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.client_key_id;
                        return newErrors;
                      });
                    }
                  }}
                >
                  <SelectTrigger 
                    id="client"
                    className={errors.client_key_id || validationErrors.client_key_id ? "border-red-500" : ""}
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
                {(errors.client_key_id || validationErrors.client_key_id) && (
                  <p className="text-sm text-red-500">{errors.client_key_id || validationErrors.client_key_id}</p>
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
              <Button type="button" onClick={handleSubmit} disabled={processing}>
                {processing
                  ? editingTask
                    ? "Updating..."
                    : "Creating..."
                  : editingTask
                  ? "Update Task"
                  : "Create Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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