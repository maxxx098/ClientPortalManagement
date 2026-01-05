"use client";

import React from "react";
import {
  Plus,
  Calendar,
  Flag,
  ChevronDown,
  Eye,
  CircuitBoard,
  Share2,
  Zap,
  Edit2,
  List,
  LayoutGrid,
  CalendarDays,
  File,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    clients?: { id: string; key: string }[];
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
  todo: { label: "To Do", color: "text-gray-600", bg: "bg-gray-200" },
  in_progress: { label: "In Progress", color: "text-yellow-700", bg: "bg-yellow-100" },
  done: { label: "Done", color: "text-green-700", bg: "bg-green-100" },
};

const progressConfig = {
  on_track: { label: "On Track", color: "bg-green-100 text-green-700" },
  at_risk: { label: "At Risk", color: "bg-yellow-100 text-yellow-700" },
  off_track: { label: "Off Track", color: "bg-red-100 text-red-700" },
};

export default function TaskBoard({
  tasks,
  clients= [],
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

   const getClientId = (clientKeyId?: string) => {
    if (!clientKeyId) return null;
    const client = clients.find(c => c.key === clientKeyId);
    return client?.id;
  };


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

  const teamMembers = Array.from(new Set(tasks.filter(t => t.client_key_id).map(t => t.client_key_id))).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Top Header */}
      <header>
        {/* Main Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-white-600" />
            <h1 className="text-lg font-semibold text-gray-800">Design Project</h1>
            <button className="text-gray-400 hover:text-gray-600 transition">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* User Avatar Group */}
            <div className="flex -space-x-2">
              {teamMembers.length > 0 ? (
                <>
                  {teamMembers.slice(0, 2).map((member, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-red-500 to-black-500 flex items-center justify-center text-xs font-semibold text-white shadow"
                    >
                      {member?.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {teamMembers.length > 2 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      +{teamMembers.length - 2}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-white-500 to-red-500 flex items-center justify-center text-xs font-semibold text-white shadow">
                  TM
                </div>
              )}
            </div>

            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition">
              Share
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition">
              Automation
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <CircuitBoard className="w-4 h-4" />
              Overview
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white-600 bg-white-50 rounded-lg">
              <List className="w-4 h-4" />
              List
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition">
              <File className="w-4 h-4" />
              Files
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Due Date:</span>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                March 17 - 20
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Assignee:</span>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                All
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Priority:</span>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                All
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advance Filters
            </button>
          </div>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-white-600 rounded-lg hover:bg-white-700 transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Task Columns */}
        {Object.entries(columns).map(([key, column]) => (
          <Card key={key}>
            {/* Group Header */}
            <CardHeader
              className="cursor-pointer select-none transition py-3"
              onClick={() => onToggleSection(key as keyof typeof expandedSections)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className={`text-gray-400 transition-transform ${expandedSections[key as keyof typeof expandedSections]
                        ? "rotate-0"
                        : "-rotate-90"
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${progressConfig[key as keyof typeof progressConfig].color
                      }`}
                  >
                    {column.title}
                  </span>
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
              </div>
            </CardHeader>

            {/* Task List */}
            {expandedSections[key as keyof typeof expandedSections] && (
              <CardContent className="pt-0">
                {/* Header Row Labels */}
                <div className="grid grid-cols-5 gap-4 py-2 px-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <div className="col-span-2">Name</div>
                  <div>Assignee</div>
                  <div>Due Date</div>
                  <div>Priority</div>
                </div>

                <div className="flex flex-col">
                  {column.tasks.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <CircuitBoard className="w-12 h-12 opacity-20 mx-auto mb-3" />
                      <p className="text-sm">No tasks in this section</p>
                    </div>
                  ) : (
                    column.tasks.map((task) => {
                      const statusInfo = statusConfig[task.status];
                      const priority = task.priority || "low";

                      const priorityColors = {
                        high: "text-red-500",
                        medium: "text-white-500",
                        low: "text-gray-400",
                      } as const;

                      return (
                        <div
                          key={task.id}
                          className="group grid grid-cols-5 gap-4 py-3 px-2 border-b border-white/5 last:border-b-0 transition-colors items-center"
                        >
                          {/* Name Column */}
                          <div className="col-span-2 flex items-center gap-3">
                            <button
                              onClick={() => {
                                const nextStatus =
                                  task.status === "todo"
                                    ? "in_progress"
                                    : task.status === "in_progress"
                                      ? "done"
                                      : "todo";
                                onUpdateStatus(task.id, nextStatus);
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === "done"
                                  ? "border-green-500 bg-green-500 text-white"
                                  : task.status === "in_progress"
                                    ? "border-yellow-400 text-yellow-500"
                                    : "border-gray-300 text-transparent"
                                }`}
                            >
                              {task.status === "done" && (
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              )}
                              {task.status === "in_progress" && (
                                <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </button>

                            <span
                              className={`text-sm font-medium ${task.status === "done"
                                  ? "line-through text-gray-400"
                                  : "text-gray-700"
                                }`}
                            >
                              {task.title}
                            </span>
                          </div>
                      <div className="flex items-center">
                          {task.client_key_id ? (
                            (() => {
                              const clientId = getClientId(task.client_key_id);
                              return clientId ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-black-500 flex items-center justify-center text-xs font-semibold text-white">
                                  C{clientId}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-xs font-semibold text-white">
                                  ?
                                </div>
                              );
                            })()
                          ) : (
                            <button className="flex items-center gap-2 text-gray-400 text-xs hover:text-gray-600">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>Assign</span>
                            </button>
                          )}
                        </div>

                          {/* Due Date Column */}
                          <div className="text-sm text-gray-600">
                            {task.due_date ? (
                              <span>
                                {new Date(task.due_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400 text-xs cursor-pointer hover:text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Add date</span>
                              </div>
                            )}
                          </div>

                          {/* Priority Column */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Flag className={`w-4 h-4 ${priorityColors[priority as keyof typeof priorityColors]}`} />
                              <span className={`text-sm ${priority === 'none' ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                                {priority === 'none' ? '' : priority}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onDelete(task.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                              <button
                                onClick={() => onEdit(task)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Add Task Button */}
                  <div className="px-2 py-3 mt-1">
                    <button
                      onClick={() =>
                        onAddTask(key as "on_track" | "at_risk" | "off_track")
                      }
                      className="flex items-center gap-2 text-white-600 hover:text-white-700 text-sm font-medium transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}