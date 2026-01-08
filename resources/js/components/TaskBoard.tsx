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
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const progressConfig = {
  on_track: { label: "Pending", color: "bg-red-500/20 text-red-400 border border-red-500/30" },
  at_risk: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  off_track: { label: "Completed", color: "bg-green-500/20 text-green-400 border border-green-500/30" },
};

export default function TaskBoard({
  tasks,
  clients = [],
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
  const [dueDateFilter, setDueDateFilter] = React.useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");

  const categorizeTask = (task: Task) => {
    if (task.status === "done") return "off_track";
    if (task.status === "in_progress") return "at_risk";
    return "on_track";
  };

  const getClientId = (clientKeyId?: string) => {
    if (!clientKeyId) return null;
    const client = clients.find((c) => c.key === clientKeyId);
    return client?.id;
  };

  const isWithinDateRange = (task: Task) => {
    if (dueDateFilter === "all" || !task.due_date) return true;
    
    const taskDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dueDateFilter) {
      case "today":
        return taskDate.toDateString() === today.toDateString();
      case "this_week":
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return taskDate >= today && taskDate <= weekEnd;
      case "this_month":
        return taskDate.getMonth() === today.getMonth() && 
               taskDate.getFullYear() === today.getFullYear();
      case "overdue":
        return taskDate < today;
      default:
        return true;
    }
  };

  const matchesAssignee = (task: Task) => {
    if (assigneeFilter === "all") return true;
    if (assigneeFilter === "unassigned") return !task.client_key_id;
    return task.client_key_id === assigneeFilter;
  };

  const matchesPriority = (task: Task) => {
    if (priorityFilter === "all") return true;
    return (task.priority || "low") === priorityFilter;
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      isWithinDateRange(task) &&
      matchesAssignee(task) &&
      matchesPriority(task)
  );

  const columns = {
    on_track: {
      title: "Pending",
      tasks: filteredTasks.filter((task) => categorizeTask(task) === "on_track"),
    },
    at_risk: {
      title: "In Progress",
      tasks: filteredTasks.filter((task) => categorizeTask(task) === "at_risk"),
    },
    off_track: {
      title: "Completed",
      tasks: filteredTasks.filter((task) => categorizeTask(task) === "off_track"),
    },
  };

  const teamMembers = Array.from(
    new Set(tasks.filter((t) => t.client_key_id).map((t) => t.client_key_id))
  ).slice(0, 3);

  const uniqueAssignees = Array.from(
    new Set(tasks.filter((t) => t.client_key_id).map((t) => t.client_key_id))
  ).filter((assignee): assignee is string => assignee !== undefined);

  return (
    <div className="min-h-screen">
      {/* Top Header */}
      <header className="">
        {/* Main Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-white">Design Project</h1>
            <button className="text-gray-500 hover:text-gray-300 transition">
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
                      className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-semibold text-white shadow"
                    >
                      {member?.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {teamMembers.length > 2 && (
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-300">
                      +{teamMembers.length - 2}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-semibold text-white shadow">
                  TM
                </div>
              )}
            </div>

            <button className="px-3 py-1.5 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-900 transition">
              Share
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-900 transition">
              Automation
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-800">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition">
              <CircuitBoard className="w-4 h-4" />
              Overview
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg">
              <List className="w-4 h-4" />
              List
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition">
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition">
              <CalendarDays className="w-4 h-4" />
              Calendar
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition">
              <File className="w-4 h-4" />
              Files
            </button>
          </div>
          <button className="text-gray-500 hover:text-gray-300">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        
          {/* Filters Bar */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3 relative">
              <div className="border card-bg rounded-lg pr-2 bg-white/10 border-white">
                <Select 
                 value={dueDateFilter}
                 onValueChange={setDueDateFilter}
                 >
                  <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 text-sm font-medium gap-2 ">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-gray-400">Due Date:</span>
                      <SelectValue className="text-white" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border card-bg rounded-lg">
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 text-sm font-medium gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-gray-400">Assignee:</span>
                      <SelectValue className="text-white" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {uniqueAssignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border card-bg rounded-lg">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-auto h-auto border-0 bg-transparent p-0 text-sm font-medium gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-gray-400">Priority:</span>
                      <SelectValue className="text-white" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button className="px-3 py-1.5 text-sm font-medium text-gray-300 border rounded-lg hover:bg-gray-900 transition flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advance Filters
              </button>
            </div>
            
            <button className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Task Columns */}
        {Object.entries(columns).map(([key, column]) => (
          <Card key={key} className="">
            {/* Group Header */}
            <CardHeader
              className="cursor-pointer select-none transition hover:bg-gray-800/50"
              onClick={() => onToggleSection(key as keyof typeof expandedSections)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className={`text-gray-500 transition-transform ${
                      expandedSections[key as keyof typeof expandedSections]
                        ? "rotate-0"
                        : "-rotate-90"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                      progressConfig[key as keyof typeof progressConfig].color
                    }`}
                  >
                    {column.title}
                  </span>
                  <span className="text-sm text-gray-500">({column.tasks.length})</span>
                </div>

                <button className="text-gray-500 hover:text-gray-300">
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
                <div className="grid grid-cols-6 py-2 gap-4 border-b border-white/5 px-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div className="col-span-2">Name</div>
                  <div>Assignee</div>
                  <div>Due Date</div>
                  <div>Priority</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="flex flex-col">
                  {column.tasks.length === 0 ? (
                    <div className="py-12 text-center text-gray-600">
                      <CircuitBoard className="w-12 h-12 opacity-20 mx-auto mb-3" />
                      <p className="text-sm">No tasks in this section</p>
                    </div>
                  ) : (
                    column.tasks.map((task) => {
                      const priority = task.priority || "low";

                      const priorityColors = {
                        high: "text-red-500",
                        medium: "text-yellow-500",
                        low: "text-gray-500",
                      } as const;

                      return (
                        <div
                          key={task.id}
                          className="group grid grid-cols-6 gap-4 py-3 px-2 border-b border-white/5 last:border-b-0 hover:bg-gray-800/30 transition-colors items-center"
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
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                task.status === "done"
                                  ? "border-green-500 bg-green-500 text-white"
                                  : task.status === "in_progress"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-gray-600 text-transparent hover:border-gray-500"
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
                              className={`text-sm font-medium ${
                                task.status === "done"
                                  ? "line-through text-gray-600"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {/* Assignee Column */}
                          <div className="flex items-center">
                            {task.client_key_id ? (
                              (() => {
                                const clientId = getClientId(task.client_key_id);
                                return clientId ? (
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-semibold text-white">
                                    C{clientId}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-400">
                                    ?
                                  </div>
                                );
                              })()
                            ) : (
                              <button className="flex items-center gap-2 text-gray-500 text-xs hover:text-gray-300">
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
                          <div className="text-sm text-gray-400">
                            {task.due_date ? (
                              <span>
                                {new Date(task.due_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500 text-xs cursor-pointer hover:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                <span>Add date</span>
                              </div>
                            )}
                          </div>

                          {/* Priority Column */}
                          <div className="flex items-center gap-2">
                            <Flag className={`w-4 h-4 ${priorityColors[priority as keyof typeof priorityColors]}`} />
                            <span className={`text-sm ${priority === 'none' ? 'text-gray-600' : 'text-gray-400'} capitalize`}>
                              {priority === 'none' ? '' : priority}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onView(task.id)}
                              className="text-gray-500 hover:text-white p-1"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="text-gray-500 hover:text-red-500 p-1"
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
                              className="text-gray-500 hover:text-white p-1"
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
                            <button className="text-gray-500 hover:text-white p-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
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
                      className="flex items-center gap-2 text-green-500 hover:text-green-400 text-sm font-medium transition"
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