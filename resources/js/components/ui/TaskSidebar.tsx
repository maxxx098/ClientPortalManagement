import React from "react";
import { X, Save, Trash2, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";
import { useForm, router } from "@inertiajs/react";
import TaskComments from "@/components/task-comment";

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

interface TaskSidebarProps {
  isOpen: boolean;
  task: Task | null;
  mode: "view" | "edit" | "create";
  isLoading?: boolean;
  onClose: () => void;
  clients?: { id: string; key: string }[];
  userRole?: string;
  isAdmin?: boolean;
  clientKey?: string;
  currentUserId?: number;
  routePrefix?: string;
  onSave?: (taskData: any) => void;
  onDelete?: (taskId: number) => void;
  projectDueDate?: string | null;
  onDueDateError?: () => void;
}

export default function TaskSidebar({
  isOpen,
  task,
  mode,
  isLoading = false,
  onClose,
  clients = [],
  userRole = "client",
  isAdmin = false,
  clientKey = "",
  currentUserId = 0,
  routePrefix = "/admin",
  projectDueDate = null,

  onDueDateError,
  onDelete
}: TaskSidebarProps) {
  const [inputMode, setInputMode] = React.useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [voiceRecorded, setVoiceRecorded] = React.useState(false);

  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    title: "",
    description: "",
    client_key_id: "",
    due_date: "",
    started_at: "",
    status: "todo" as "todo" | "in_progress" | "done",
    file: null as File | null,
    voice_message: "",
  });

  React.useEffect(() => {
    if (task && mode !== "create") {
      setData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        due_date: task.due_date || "",
        client_key_id: task.client_key_id || "",
        file: null,
        voice_message: task.voice_message || "",
      });
      setInputMode(task.voice_message ? "voice" : "text");
      setVoiceRecorded(!!task.voice_message);
    } else if (mode === "create") {
      reset();
      setInputMode("text");
      setVoiceRecorded(false);
    }
  }, [task, mode, isOpen]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser doesn't support audio recording. Please use Chrome, Firefox, or Edge.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setData("voice_message", base64data);
          setVoiceRecorded(true);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
  e.preventDefault();

  if (!data.title?.trim()) {
    return;
  }

  if (userRole === "admin" && !data.client_key_id && !clientKey) {
    return;
  }

  // Check if task due date exceeds project due date
  if (data.due_date && projectDueDate) {
    const taskDate = new Date(data.due_date);
    const taskStartDate = new Date(data.started_at || "");
    const projDate = new Date(projectDueDate);
    
    if (taskDate > projDate) {
      onDueDateError?.();
      return;
    }
  }

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description || "");
  formData.append("status", data.status || "todo");
  formData.append("due_date", data.due_date || "");
  formData.append("started_at", data.started_at || "");
  
  if (data.client_key_id || clientKey) {
    formData.append("client_key_id", data.client_key_id || clientKey);
  }
  
  if (data.file) {
    formData.append("file", data.file);
  }
  
  if (inputMode === "voice" && data.voice_message) {
    formData.append("voice_message", data.voice_message);
  }

  if (mode === "edit" && task) {
    formData.append("_method", "PATCH");
    router.post(`${routePrefix}/tasks/${task.id}`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
        setInputMode("text");
        setVoiceRecorded(false);
        clearErrors();
      },
    });
  } else {
    router.post(`${routePrefix}/tasks`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose();
        setInputMode("text");
        setVoiceRecorded(false);
        clearErrors();
      },
    });
  }
};

  const isViewMode = mode === "view";

const handleDelete = () => {
  if (task && onDelete) {
    onDelete(task.id);
  }
};


  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0">
        <h2 className="text-lg font-semibold text-white">
          {mode === "view" ? "Task Details" : mode === "edit" ? "Edit Task" : "Create Task"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded text-sm">
            {(errors as any).form ? (
              (errors as any).form
            ) : (
              <ul className="list-disc pl-5">
                {Object.entries(errors as any).map(([key, val]) => (
                  <li key={key}>{Array.isArray(val) ? val[0] : String(val)}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-300">
            Task Title {!isViewMode && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="title"
            value={data.title || ""}
            onChange={(e) => setData("title", e.target.value)}
            placeholder="Enter task title"
            disabled={isViewMode}
            className={`text-white placeholder:text-slate-500 ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Input Mode (Create only) */}
        {mode === "create" && (
          <div className="space-y-3">
            <Label className="text-gray-300">Input Method</Label>
            <RadioGroup value={inputMode} onValueChange={(val: any) => setInputMode(val)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <FileText className="h-4 w-4" />
                  Text
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="voice" id="voice" />
                <Label htmlFor="voice" className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <Mic className="h-4 w-4" />
                  Voice
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Description or Voice Message */}
        {inputMode === "text" || isViewMode ? (
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={data.description || ""}
              onChange={(e) => setData("description", e.target.value)}
              placeholder="Describe the task in detail (optional)"
              disabled={isViewMode}
              rows={5}
              className="text-white placeholder:text-slate-500 resize-none"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-gray-300">Voice Message</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                {isRecording ? "Stop" : "Record"}
              </Button>
              {voiceRecorded && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <span className="text-lg">✓</span> Recorded
                </span>
              )}
            </div>
            {isRecording && <p className="text-sm text-slate-400 animate-pulse">Recording...</p>}
          </div>
        )}

        {/* View mode: Show voice message player */}
        {isViewMode && task?.voice_message && (
          <div className="space-y-2">
            <Label className="text-gray-300">Voice Message</Label>
            <div 
              className="w-full"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <audio 
                controls 
                className="w-full rounded"
                preload="metadata"
              >
                <source 
                  src={`/storage/${task.voice_message}`}
                  type="audio/webm" 
                />
                <source 
                  src={`/storage/${task.voice_message}`}
                  type="audio/mpeg" 
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="started_at" className="text-gray-300">Start Date</Label>
          <Input
            id="started_at"
            type="date"
            value={data.started_at || ""}
            onChange={(e) => setData("started_at", e.target.value)}
            disabled={isViewMode}
            className="text-white"
          />
        </div>
        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="due_date" className="text-gray-300">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={data.due_date || ""}
            onChange={(e) => setData("due_date", e.target.value)}
            disabled={isViewMode}
            className="text-white"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-gray-300">Status</Label>
          <Select value={data.status || "todo"} onValueChange={(val: any) => setData("status", val)} disabled={isViewMode}>
            <SelectTrigger id="status" className="text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client (Admin only) */}
        {userRole === "admin" && (
          <div className="space-y-2">
            <Label htmlFor="client_key_id" className="text-gray-300">Client {!isViewMode && <span className="text-red-500">*</span>}</Label>
            <Select
              value={data.client_key_id || clientKey}
              onValueChange={(val: any) => setData("client_key_id", val)}
              disabled={isViewMode || !!clientKey}
            >
              <SelectTrigger id="client_key_id" className="text-white">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* File Attachment */}
        {!isViewMode && (
          <div className="space-y-2">
            <Label htmlFor="file" className="text-gray-300">Attach File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setData("file", e.target.files?.[0] || null)}
              className="text-gray-400"
            />
            <p className="text-xs text-slate-500">Max 10MB. PDF, DOC, DOCX, JPG, PNG</p>
          </div>
        )}

        {/* View mode: Show attached file */}
        {isViewMode && task?.file && (
          <div className="space-y-2">
            <Label className="text-gray-300">Attached File</Label>
            <a href={`/storage/${task.file}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm break-all">
              {task.file.split("/").pop()}
            </a>
          </div>
        )}

        {/* Comments Section - Only in View Mode */}
        {isViewMode && task && (
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <TaskComments
              taskId={task.id}
              isAdmin={isAdmin}
              clientKey={clientKey}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className=" px-6 py-4 flex gap-3 sticky bottom-0">
        <Button variant="outline" onClick={onClose} disabled={processing} className="flex-1">
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button onClick={handleSave} disabled={processing} className="flex-1">
            {processing ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </Button>
        )}
        {isViewMode && task && (
          <Button variant="destructive" onClick={handleDelete} disabled={processing}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
