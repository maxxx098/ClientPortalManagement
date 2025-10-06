"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
}

interface KanbanProps {
  tasks: Task[];
  onStatusChange: (id: number, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onView: (taskId: number) => void; // ✅ Keep this consistent with parent
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
  onView, // ✅ use the prop directly
}: KanbanProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task["status"];
    onStatusChange(Number(draggableId), newStatus);
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
                                        <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-3">
                                          {task.description}
                                        </p>
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
                                          onClick={() => onView(task.id)} // ✅ Correct usage
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Task
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {/* Client Info */}
                                  {task.client_key_id && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-mono"
                                      >
                                        {task.client_key_id.substring(0, 8)}...
                                      </Badge>
                                    </div>
                                  )}
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
    </DragDropContext>
  );
}
