"use client";

import React from "react";
import {
  Plus,
  Calendar,
  Flag,
  ChevronDown,
  Eye,
  Clock,
  TrendingUp,
  CheckCheck,
  CircuitBoard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
  in_progress: { label: "In Progress", color: "text-blue-400" },
  done: { label: "Done", color: "text-emerald-400" },
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

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen text-gray-200">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-light italic text-white">
              Task Overview
            </h1>
            <p className="text-xs text-gray-500 mt-1">{currentDate}</p>
          </div>
        </div>

        {/* Stats Cards - Same as Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Tasks */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-yellow-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Total Tasks</p>
                <h2 className="text-3xl font-bold text-white">{tasks.length}</h2>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { value: 1 },
                    { value: 10 },
                    { value: 1 },
                    { value: 1 },
                    { value: 1 },
                    { value: 1 },
                    { value: 7 }
                  ]}>
                    <Line 
                      type="natural" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs font-medium text-purple-400">
                <span className="mr-1">12%</span>
                <ArrowUpRight size={14} />
              </div>
              <div className="flex items-center text-[10px] text-gray-500 uppercase">
                <span>This month</span>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-yellow-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">In Progress</p>
                <h2 className="text-3xl font-bold text-white">{inProgressTasks}</h2>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { value: 7 },
                    { value: 6 },
                    { value: 1 },
                    { value: 4 },
                    { value: 1 },
                    { value: 8 },
                    { value: 7 }
                  ]}>
                    <Line 
                      type="natural" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs font-medium text-blue-400">
                <span className="mr-1">8%</span>
                <ArrowUpRight size={14} />
              </div>
              <div className="flex items-center text-[10px] text-gray-500 uppercase">
                <span>Active now</span>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-yellow-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">Completed</p>
                <h2 className="text-3xl font-bold text-white">{completedTasks}</h2>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { value: 4 },
                    { value: 7 },
                    { value: 3 },
                    { value: 10 },
                    { value: 3},
                    { value: 1 },
                    { value: 1 }
                  ]}>
                    <Line 
                      type="natural" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs font-medium text-green-400">
                <span className="mr-1">15%</span>
                <ArrowUpRight size={14} />
              </div>
              <div className="flex items-center text-[10px] text-gray-500 uppercase">
                <span>This week</span>
              </div>
            </div>
          </div>

          {/* To Do */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-yellow-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">To Do</p>
                <h2 className="text-3xl font-bold text-white">{todoTasks}</h2>
              </div>
              <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { value: 5 },
                    { value: 4 },
                    { value: 6 },
                    { value: 3 },
                    { value: 5 },
                    { value: 4 },
                    { value: 5 }
                  ]}>
                    <Line 
                      type="natural" 
                      dataKey="value" 
                      stroke="#6b7280" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs font-medium text-gray-400">
                <span className="mr-1">5%</span>
                <ArrowUpRight size={14} />
              </div>
              <div className="flex items-center text-[10px] text-gray-500 uppercase">
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Columns */}
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onToggleSection(key as keyof typeof expandedSections)
                }
                className="hover:bg-white/5 p-2 rounded-lg transition"
              >
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedSections[key as keyof typeof expandedSections]
                      ? ""
                      : "-rotate-90"
                  }`}
                />
              </button>
              <h2 className="text-lg font-bold text-white">{column.title}</h2>
              <span className="text-sm text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
              <div className="ml-auto">
                <button
                  onClick={() =>
                    onAddTask(key as "on_track" | "at_risk" | "off_track")
                  }
                  className="p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {expandedSections[key as keyof typeof expandedSections] && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-400 border-b border-white/5 bg-white/[0.03] uppercase tracking-wider font-semibold">
                      <div className="col-span-4">Task</div>
                      <div className="col-span-2">Assignee</div>
                      <div className="col-span-2">Due</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Task rows */}
                    <div className="divide-y divide-white/5">
                      {column.tasks.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500">
                          <CircuitBoard className="w-12 h-12 opacity-20 mx-auto mb-3" />
                          <p className="text-sm">No tasks in this section</p>
                        </div>
                      ) : (
                        column.tasks.map((task) => {
                          const statusInfo = statusConfig[task.status];
                          const priority = task.priority || "low";

                          const priorityColors = {
                            high: "bg-red-500/20 text-red-400 border border-red-500/30",
                            medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                            low: "bg-green-500/20 text-green-400 border border-green-500/30",
                          } as const;

                          return (
                            <div
                              key={task.id}
                              className="grid grid-cols-12 gap-4 px-6 py-4 text-sm hover:bg-white/[0.02] transition group"
                            >
                              {/* Task Title & Priority */}
                              <div className="col-span-4 flex items-center gap-3">
                                <span className="font-medium text-white line-clamp-1">{task.title}</span>
                                <span
                                  className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-full capitalize whitespace-nowrap flex-shrink-0 font-medium ${priorityColors[priority as keyof typeof priorityColors]}`}
                                >
                                  <Flag size={10}/>{priority}
                                </span>
                              </div>

                              {/* Assignee */}
                              <div className="col-span-2 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white shadow-lg">
                                  {task.client_key_id?.substring(0, 2).toUpperCase() || "NA"}
                                </div>
                              </div>

                              {/* Due Date */}
                              <div className="col-span-2 flex items-center text-gray-400">
                                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap text-sm">
                                  {task.due_date
                                    ? new Date(task.due_date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "No date"}
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
                                  <SelectTrigger className="h-9 px-3 text-xs font-medium border border-white/10 w-full bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <span className={statusInfo.color}>{statusInfo.label}</span>
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#0a0a0a] border-white/10">
                                    <SelectItem value="todo" className="text-white">To Do</SelectItem>
                                    <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                                    <SelectItem value="done" className="text-white">Done</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Actions */}
                              <div className="col-span-2 flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => onView(task.id)} 
                                  className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                                </button>
                                <button 
                                  onClick={() => onEdit(task)} 
                                  className="h-9 w-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
                                >
                                  <svg
                                    className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors"
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
                                <button 
                                  onClick={() => onDelete(task.id)} 
                                  className="h-9 w-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center transition-colors"
                                >
                                  <svg
                                    className="h-4 w-4 text-red-400"
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
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Add Task Row */}
                      <div
                        onClick={() =>
                          onAddTask(key as "on_track" | "at_risk" | "off_track")
                        }
                        className="px-6 py-4 text-sm text-gray-400 hover:bg-white/[0.02] cursor-pointer flex items-center gap-2 transition font-medium"
                      >
                        <Plus className="h-5 w-5" />
                        Add New Task
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