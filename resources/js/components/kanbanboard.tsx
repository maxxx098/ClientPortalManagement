"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Circle, CircleDot, CheckCircle2 } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
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

interface KanbanProps {
  tasks: Task[];
  onStatusChange: (id: number, status: Task["status"]) => void;
}

export default function KanbanBoard({ tasks, onStatusChange }: KanbanProps) {
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <h2 className="font-semibold text-lg">{config.title}</h2>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {columnTasks.length}
                </Badge>
              </div>

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
                                <div className="flex items-start gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium leading-relaxed">
                                      {task.title}
                                    </p>
                                    {task.client_key_id && (
                                      <Badge
                                        variant="outline"
                                        className="mt-2 text-xs"
                                      >
                                        Client: {task.client_key_id}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

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