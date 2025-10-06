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
  CircleDot,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";


interface Task {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
}

interface KanbanProps {
  tasks: Task[];
  onStatusChange: (id: number, status: "todo" | "in_progress" | "done") => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

const columns = {
  todo: {
    title: "To Do",
    icon: Circle,
    color: "text-slate-500",
  },
  in_progress: {
    title: "In Progress",
    icon: CircleDot,
    color: "text-blue-500",
  },
  done: {
    title: "Done",
    icon: CheckCircle2,
    color: "text-green-500",
  },
};


export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: KanbanProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task["status"];
    onStatusChange(Number(draggableId), newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([col, config]) => {
          const Icon = config.icon;
          const columnTasks = tasks.filter((task) => task.status === col);

          return (
            <div key={col} className="flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <h2 className="font-semibold text-lg">{config.title}</h2>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {columnTasks.length}
                </Badge>
              </div>

              {/* Droppable area */}
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    className={`flex-1 rounded-lg border-2 border-dashed p-3 transition-colors min-h-[500px] ${
                      snapshot.isDraggingOver
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-muted/50"
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
                              className={`group cursor-grab active:cursor-grabbing transition-shadow ${
                                snapshot.isDragging
                                  ? "shadow-lg ring-2 ring-primary"
                                  : "hover:shadow-md"
                              }`}
                            >
                             <CardContent className="p-4">
                                <div className="flex flex-col gap-3">
                                  {/* Top Row: Drag + Title */}
                                  <div className="flex items-start gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    >
                                      <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-relaxed break-words">
                                        {task.title}
                                      </p>
                                    </div>
                                      <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-relaxed break-words">
                                        {task.description || "No description"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Bottom Row: Badge + Actions */}
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    
                                    {/* Actions */}
                                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => onEdit(task)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => onDelete(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {/* Empty state */}
                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No tasks yet
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
