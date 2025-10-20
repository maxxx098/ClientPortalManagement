"use client";

import React from "react";
import { Plus, Calendar, Flag, ChevronDown, MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
  onAddTask: (status: 'on_track' | 'at_risk' | 'off_track') => void;
  onView: (taskId: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onUpdateStatus: (id: number, status: Task["status"]) => void;
}

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

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: '🚩' },
  high: { label: 'High', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🏴' },
  normal: { label: 'Normal', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: '🏳️' }
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
  onUpdateStatus
}: TaskBoardProps) {
  
  const categorizeTask = (task: Task) => {
    return task.progress_status || 'on_track';
  };

  const filteredTasks = tasks.filter(task =>
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        {Object.entries(columns).map(([key, column]) => (
          <div key={key} className="mb-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => onToggleSection(key as keyof typeof expandedSections)}
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
                onClick={() => onAddTask(key as 'on_track' | 'at_risk' | 'off_track')}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Table */}
            {expandedSections[key as keyof typeof expandedSections] && (
              <div className="bg-muted/30 rounded-lg border">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs text-gray-500 font-medium">
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
                            onClick={() => onView(task.id)}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                            title="View details and comments"
                          >
                            <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-gray-200" />
                          </button>
                          <button
                            onClick={() => onEdit(task)}
                            className="p-1 hover:bg-gray-800 rounded transition-colors"
                            title="Edit task"
                          >
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(task.id)}
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

                      <div className="col-span-1 flex items-center">
                        <Select
                          value={task.status}
                          onValueChange={(value) => onUpdateStatus(task.id, value as Task["status"])}
                        >
                          <SelectTrigger className={`h-8 px-2.5 rounded-md text-xs font-semibold border ${statusInfo.color} w-auto min-w-[100px] [&>svg]:hidden`}>
                            <div className="flex items-center gap-2">
                              {statusInfo.icon}
                              <span>{statusInfo.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-gray-800">
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
                  onClick={() => onAddTask(key as 'on_track' | 'at_risk' | 'off_track')}
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
  );
}