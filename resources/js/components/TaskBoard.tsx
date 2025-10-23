"use client";

import React from "react";
import {
  Plus,
  Calendar,
  Flag,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Clock,
  TrendingUp,
  CheckCheck,
  ArrowLeft,
  Tag,
  CircuitBoard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  priority: string;
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

type ProgressSections = {
  on_track: boolean;
  at_risk: boolean;
  off_track: boolean;
};

interface TaskBoardProps {
  tasks: Task[];
  searchQuery: string;
  expandedSections: ProgressSections;
  routePrefix: string;
  onToggleSection: (section: keyof ProgressSections) => void;
  onAddTask: (status: "on_track" | "at_risk" | "off_track") => void;
  onView: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onUpdateStatus: (taskId: number, status: Task["status"]) => void;
}

const statusConfig = {
  todo: { label: "To Do", color: "text-gray-400" },
  in_progress: { label: "In Progress", color: "text-blue-500" },
  done: { label: "Done", color: "text-emerald-500" },
};

export default function TaskBoard({
  tasks,
  searchQuery,
  expandedSections,
  routePrefix,
  onToggleSection,
  onAddTask,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: TaskBoardProps) {
  const categorizeTask = (task: Task) => task.progress_status || "on_track";

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = {
    on_track: {
      title: "On Track",
      tasks: filteredTasks.filter(
        (task) => categorizeTask(task) === "on_track"
      ),
    },
    at_risk: {
      title: "At Risk",
      tasks: filteredTasks.filter((task) => categorizeTask(task) === "at_risk"),
    },
    off_track: {
      title: "Off Track",
      tasks: filteredTasks.filter(
        (task) => categorizeTask(task) === "off_track"
      ),
    },
  };

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Task Overview
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Overview of all tasks and progress.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Total Tasks
                </span>
                <CircuitBoard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-semibold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  In Progress
                </span>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-semibold text-blue-500">
                {inProgressTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Completed
                </span>
                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-semibold text-emerald-500">
                {completedTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">To Do</span>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-semibold text-gray-400">
                {todoTasks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columns */}
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onToggleSection(key as keyof typeof expandedSections)
                }
                className="hover:bg-muted p-1 rounded transition"
              >
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    expandedSections[key as keyof typeof expandedSections]
                      ? ""
                      : "-rotate-90"
                  }`}
                />
              </button>
              <h2 className="text-sm font-medium">{column.title}</h2>
              <span className="text-xs text-muted-foreground">
                {column.tasks.length}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onAddTask(key as "on_track" | "at_risk" | "off_track")
                  }
                  className="h-7 w-7"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {expandedSections[key as keyof typeof expandedSections] && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Horizontal scroll container */}
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border">
                      <div className="col-span-4">Task</div>
                      <div className="col-span-2">Assignee</div>
                      <div className="col-span-2">Due</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Task rows */}
                    <div className="divide-y divide-border">
                      {column.tasks.map((task) => {
                        const statusInfo = statusConfig[task.status];
                        const priority = task.priority || "low";

                        const priorityColors = {
                          high: "bg-red-500/10 text-red-500 border border-red-500/30",
                          medium: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
                          low: "bg-green-500/10 text-green-500 border border-green-500/30",
                        } as const;

                        return (
                          <div
                            key={task.id}
                            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-muted/30 transition"
                          >
                            {/* Task Title & Priority Badge */}
                            <div className="col-span-4 flex items-center gap-2">
                              <span className="font-medium truncate">{task.title}</span>
                              <span
                                className={`text-[10px] flex justify-center items-center gap-1 px-2 py-0.5 rounded-full capitalize whitespace-nowrap flex-shrink-0 ${priorityColors[priority as keyof typeof priorityColors]}`}
                              >
                                <Flag size={10}/>{priority}
                              </span>
                            </div>

                            {/* Assignee */}
                            <div className="col-span-2 flex items-center">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {task.client_key_id?.substring(0, 2).toUpperCase() || "NA"}
                              </div>
                            </div>

                            {/* Due Date */}
                            <div className="col-span-2 flex items-center text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">
                                {task.due_date
                                  ? new Date(task.due_date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </div>

                            {/* Status Selector */}
                            <div className="col-span-2">
                              <Select
                                value={task.status}
                                onValueChange={(value) =>
                                  onUpdateStatus(task.id, value as Task["status"])
                                }
                              >
                                <SelectTrigger className="h-8 px-3 text-xs font-medium border border-border w-full">
                                  <span className={statusInfo.color}>{statusInfo.label}</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="todo">To Do</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => onView(task.id)} className="h-8 w-8 flex-shrink-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-8 w-8 flex-shrink-0">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-8 w-8 flex-shrink-0">
                                <svg
                                  className="h-4 w-4 text-destructive"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Task Row */}
                      <div
                        onClick={() =>
                          onAddTask(key as "on_track" | "at_risk" | "off_track")
                        }
                        className="px-4 py-3 text-xs text-muted-foreground hover:bg-muted/30 cursor-pointer flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}