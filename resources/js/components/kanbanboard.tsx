"use client";

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  Circle,
  Loader2,
  CheckCircle2,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
  file?: string | null;
  due_date?: string | null;
}

interface KanbanProps {
  tasks: Task[];
  onStatusChange: (id: number, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onView: (taskId: number) => void;
}

const columns = { 
  todo: {
    title: "To Do",
    icon: Circle,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
  },
  in_progress: {
    title: "In Progress",
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  done: {
    title: "Done",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
};

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onView,
}: KanbanProps) {
  const [viewFileDialog, setViewFileDialog] = useState<{
    isOpen: boolean;
    file: string | null;
    fileName: string;
  }>({
    isOpen: false,
    file: null,
    fileName: "",
  });

  const [removeFileDialog, setRemoveFileDialog] = useState<{
    isOpen: boolean;
    taskId: number | null;
    fileName: string;
  }>({
    isOpen: false,
    taskId: null,
    fileName: "",
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task["status"];
    onStatusChange(Number(draggableId), newStatus);
  };

  const isImageFile = (filename: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const handleViewFile = (e: React.MouseEvent, file: string) => {
    e.stopPropagation();
    setViewFileDialog({
      isOpen: true,
      file,
      fileName: file.split('/').pop() || '',
    });
  };

  const handleRemoveFileClick = (e: React.MouseEvent, taskId: number, fileName: string) => {
    e.stopPropagation();
    setRemoveFileDialog({
      isOpen: true,
      taskId,
      fileName: fileName.split('/').pop() || '',
    });
  };

  const confirmRemoveFile = () => {
    if (!removeFileDialog.taskId) return;

    router.delete(`/admin/tasks/${removeFileDialog.taskId}/remove-file`, {
      preserveScroll: true,
      onSuccess: () => {
        console.log("File removed successfully");
        setRemoveFileDialog({ isOpen: false, taskId: null, fileName: "" });
      },
      onError: (error) => {
        console.error("Error removing file:", error);
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(columns).map(([col, config]) => {
          const Icon = config.icon;
          const columnTasks = tasks.filter((task) => task.status === col);

          return (
            <div key={col} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">{config.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {columnTasks.length}{" "}
                        {columnTasks.length === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${config.bgColor} ${config.color} border ${config.borderColor} font-semibold`}
                  >
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    className={`flex-1 rounded-xl border-2 p-4 transition-all duration-200 min-h-[600px] ${
                      snapshot.isDraggingOver
                        ? `${config.borderColor} ${config.bgColor} border-dashed`
                        : "border-transparent bg-muted/30"
                    }`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <div className="space-y-3">
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`group cursor-grab active:cursor-grabbing transition-all duration-200 border-border/50 hover:border-border ${
                                snapshot.isDragging
                                  ? "shadow-xl ring-2 ring-primary/50 scale-105 rotate-2"
                                  : "hover:shadow-md"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-1 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0 cursor-grab"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-semibold leading-relaxed break-words mb-2">
                                        {task.title}
                                      </h3>
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-2 mb-3">
                                          {task.description}
                                        </p>
                                      )}
                                      
                                      {task.due_date && (
                                        <Badge
                                          variant="outline"
                                          className="px-2 py-1 text-xs font-medium"
                                        >
                                          Due Date: {
                                            task.due_date
                                              ? new Date(task.due_date).toLocaleDateString()
                                              : "No Due Date"
                                          }
                                        </Badge>
                                      )}
                                      {/* File/Document Indicator */}
                                      {task.file && (
                                        <div className="flex items-center justify-between gap-2 mt-3 p-2 rounded-md bg-muted/50 border border-border/50">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                              {isImageFile(task.file) ? (
                                                <ImageIcon className="h-4 w-4 text-blue-500" />
                                              ) : (
                                                <FileText className="h-4 w-4 text-blue-500" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs text-muted-foreground truncate">
                                                {task.file.split('/').pop()}
                                              </p>
                                            </div>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-xs flex-shrink-0"
                                            onClick={(e) => handleViewFile(e, task.file!)}
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </Button>

                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-xs flex-shrink-0 text-red-500 hover:text-red-600"
                                            onClick={(e) => handleRemoveFileClick(e, task.id, task.file!)}
                                          >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Remove
                                          </Button>
                                        </div>
                                      )}
                                      
                                    </div>

                                    {/* Actions Menu */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => onEdit(task)}
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onDelete(task.id)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onView(task.id)}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {/* Empty State */}
                    {columnTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                        <Icon
                          className={`h-12 w-12 ${config.color} opacity-20 mb-3`}
                        />
                        <p className="text-sm font-medium text-muted-foreground">
                          No tasks in {config.title.toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag tasks here or create a new one
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>

      {/* View File Dialog */}
      <Dialog open={viewFileDialog.isOpen} onOpenChange={(isOpen) => setViewFileDialog({ isOpen, file: null, fileName: "" })}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewFileDialog.file && isImageFile(viewFileDialog.file) ? (
                <ImageIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-blue-500" />
              )}
              {viewFileDialog.fileName}
            </DialogTitle>
            <DialogDescription>
              Preview of the attached file
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[60vh] bg-muted/30 rounded-lg overflow-hidden">
            {viewFileDialog.file && isImageFile(viewFileDialog.file) ? (
              <img
                src={`/storage/${viewFileDialog.file}`}
                alt={viewFileDialog.fileName}
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={`/storage/${viewFileDialog.file}`}
                className="w-full h-full border-0"
                title={viewFileDialog.fileName}
              />
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (viewFileDialog.file) {
                  window.open(`/storage/${viewFileDialog.file}`, '_blank');
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              variant="default"
              onClick={() => setViewFileDialog({ isOpen: false, file: null, fileName: "" })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove File Alert Dialog */}
      <AlertDialog open={removeFileDialog.isOpen} onOpenChange={(isOpen) => setRemoveFileDialog({ isOpen, taskId: null, fileName: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove File
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">"{removeFileDialog.fileName}"</span>? This action cannot be undone and the file will be permanently deleted from this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFile}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
}