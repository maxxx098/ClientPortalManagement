"use client";

import React from "react";
import { router } from "@inertiajs/react";
import {
  Plus,
  Calendar,
  Flag,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CircuitBoard,
  Edit2,
  List,
  LayoutGrid,
  CalendarDays,
  File,
  Filter,
  MoreVertical,
  Check,
  Trash2,
  Copy,
  UserPlus,
  Paperclip,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

type ViewMode = "overview" | "list" | "board" | "calendar" | "files";

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
  on_track: { label: "Pending", variant: "outline" as const },
  at_risk: { label: "In Progress", variant: "secondary" as const },
  off_track: { label: "Completed", variant: "default" as const },
};

const statusForColumn: Record<keyof ProgressSections, Task["status"]> = {
  on_track: "todo",
  at_risk: "in_progress",
  off_track: "done",
};

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };

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

  const [activeView, setActiveView] = React.useState<ViewMode>("list");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"none" | "due_asc" | "due_desc" | "priority" | "title">("none");

  const [openRowMenu, setOpenRowMenu] = React.useState<number | null>(null);
  const [openGroupMenu, setOpenGroupMenu] = React.useState<string | null>(null);
  const [assigningTask, setAssigningTask] = React.useState<number | null>(null);
  const [editingDateTask, setEditingDateTask] = React.useState<number | null>(null);
  const [savingTaskId, setSavingTaskId] = React.useState<number | null>(null);

  const [projectTitle, setProjectTitle] = React.useState("Design Project");
  const [editingTitle, setEditingTitle] = React.useState(false);

  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

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

  // ----- Backend actions -----
  // update() on the server only accepts two shapes of request: a status-only
  // patch (exactly {_method, status}), or a "full" update that requires
  // title + client_key_id. Quick actions below send the full shape so they
  // hit the same validation path as the edit form.
  const patchTask = (task: Task, changes: Partial<Task>) => {
    setSavingTaskId(task.id);
    const formData = new FormData();
    formData.append("_method", "PATCH");
    formData.append("title", changes.title ?? task.title);
    formData.append("client_key_id", String(changes.client_key_id ?? task.client_key_id ?? ""));
    if (task.description) formData.append("description", task.description);
    const dueDate = changes.due_date !== undefined ? changes.due_date : task.due_date;
    if (dueDate) formData.append("due_date", dueDate);
    formData.append("status", changes.status ?? task.status);
    formData.append("progress_status", changes.progress_status ?? task.progress_status ?? "on_track");
    formData.append("priority", changes.priority ?? task.priority ?? "low");

    router.post(`${routePrefix}/tasks/${task.id}`, formData, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setSavingTaskId(null),
    });
  };

  const duplicateTask = (task: Task) => {
    const formData = new FormData();
    formData.append("title", `${task.title} (Copy)`);
    if (task.description) formData.append("description", task.description);
    formData.append("client_key_id", task.client_key_id ?? "");
    formData.append("status", task.status);
    formData.append("progress_status", task.progress_status ?? "on_track");
    formData.append("priority", task.priority ?? "low");
    if (task.due_date) formData.append("due_date", task.due_date);

    router.post(`${routePrefix}/tasks`, formData, { preserveScroll: true });
    setOpenRowMenu(null);
  };

  // ----- Filtering / sorting -----
  const isWithinDateRange = (task: Task) => {
    if (dueDateFilter === "all" || !task.due_date) return true;

    const taskDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dueDateFilter) {
      case "today":
        return taskDate.toDateString() === today.toDateString();
      case "this_week": {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return taskDate >= today && taskDate <= weekEnd;
      }
      case "this_month":
        return (
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        );
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

  let filteredTasks = tasks.filter(
    (task) =>
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      isWithinDateRange(task) &&
      matchesAssignee(task) &&
      matchesPriority(task)
  );

  filteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "due_asc":
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case "due_desc":
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      case "priority":
        return (priorityOrder[a.priority || "none"] ?? 3) - (priorityOrder[b.priority || "none"] ?? 3);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const clearAdvancedFilters = () => {
    setDueDateFilter("all");
    setAssigneeFilter("all");
    setPriorityFilter("all");
    setSortBy("none");
  };

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < today && t.status !== "done"
  ).length;

  const tabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <CircuitBoard className="h-4 w-4" /> },
    { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
    { key: "board", label: "Board", icon: <LayoutGrid className="h-4 w-4" /> },
    { key: "calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" /> },
    { key: "files", label: "Files", icon: <File className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header>
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            {editingTitle ? (
              <input
                autoFocus
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="border-b border-foreground bg-transparent text-lg font-semibold text-foreground outline-none"
              />
            ) : (
              <h1 className="text-lg font-semibold text-foreground">{projectTitle}</h1>
            )}
            <button
              onClick={() => setEditingTitle((v) => !v)}
              className="text-muted-foreground transition hover:text-foreground"
              title="Rename"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Team avatars */}
            <div className="flex -space-x-2">
              {teamMembers.length > 0 ? (
                <>
                  {teamMembers.slice(0, 2).map((member, idx) => (
                    <div
                      key={idx}
                      className="flex h-8 w-8 items-center justify-center border-2 border-background bg-foreground text-xs font-semibold text-background"
                      title={member}
                    >
                      {member?.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {teamMembers.length > 2 && (
                    <div className="flex h-8 w-8 items-center justify-center border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                      +{teamMembers.length - 2}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center border-2 border-background bg-foreground text-xs font-semibold text-background">
                  TM
                </div>
              )}
            </div>

            <button
              disabled
              title="Sharing isn't set up yet — needs a permissions model on the backend"
              className="cursor-not-allowed rounded-none border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground/50"
            >
              Share
            </button>
            <button
              disabled
              title="Automation rules aren't set up yet — needs a rules engine on the backend"
              className="cursor-not-allowed rounded-none border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground/50"
            >
              Automation
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`flex items-center gap-2 px-3 py-3 font-mono text-xs font-medium uppercase tracking-wider transition ${
                  activeView === tab.key
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="relative flex items-center gap-2">
            <div className="border border-border">
              <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                <SelectTrigger className="h-auto w-auto gap-2 rounded-none border-0 bg-transparent p-0 font-mono text-xs">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="uppercase tracking-wider text-muted-foreground">Due:</span>
                    <SelectValue className="text-foreground" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border">
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-auto w-auto gap-2 rounded-none border-0 bg-transparent p-0 font-mono text-xs">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="uppercase tracking-wider text-muted-foreground">Assignee:</span>
                    <SelectValue className="text-foreground" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {clients.find((c) => c.key === assignee)?.key ?? assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-auto w-auto gap-2 rounded-none border-0 bg-transparent p-0 font-mono text-xs">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="uppercase tracking-wider text-muted-foreground">Priority:</span>
                    <SelectValue className="text-foreground" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <button
                onClick={() => setAdvancedOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-none border border-border px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider transition hover:text-foreground ${
                  advancedOpen ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </button>

              {advancedOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAdvancedOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 border border-border bg-background p-3 shadow-lg">
                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <ArrowUpDown className="h-3 w-3" />
                        Sort by
                      </div>
                      <div className="flex flex-col gap-1">
                        {[
                          { value: "none", label: "Default" },
                          { value: "due_asc", label: "Due date (earliest)" },
                          { value: "due_desc", label: "Due date (latest)" },
                          { value: "priority", label: "Priority" },
                          { value: "title", label: "Title (A–Z)" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value as typeof sortBy)}
                            className={`px-2 py-1.5 text-left font-mono text-xs uppercase tracking-wider transition hover:bg-accent ${
                              sortBy === opt.value ? "bg-accent text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        clearAdvancedFilters();
                        setAdvancedOpen(false);
                      }}
                      className="w-full border border-border px-2 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
                    >
                      Clear Filters
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => onAddTask("on_track")}
            className="flex items-center gap-2 rounded-none bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        </div>
      </header>

      {/* ================= OVERVIEW ================= */}
      {activeView === "overview" && (
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(columns).map(([key, column]) => (
            <div key={key} className="border border-border p-4">
              <Badge
                variant={progressConfig[key as keyof typeof progressConfig].variant}
                className="rounded-none font-mono text-[10px] uppercase tracking-wider"
              >
                {column.title}
              </Badge>
              <div className="mt-3 font-mono text-3xl font-semibold text-foreground">
                {String(column.tasks.length).padStart(2, "0")}
              </div>
            </div>
          ))}
          <div className="border border-border p-4">
            <Badge variant="destructive" className="rounded-none font-mono text-[10px] uppercase tracking-wider">
              Overdue
            </Badge>
            <div className="mt-3 font-mono text-3xl font-semibold text-foreground">
              {String(overdueCount).padStart(2, "0")}
            </div>
          </div>
        </div>
      )}

      {/* ================= LIST ================= */}
      {activeView === "list" && (
        <div className="space-y-3 p-6">
          {Object.entries(columns).map(([key, column]) => (
            <div key={key} className="border border-border">
              {/* Group Header */}
              <div
                className="cursor-pointer select-none border-b border-border px-4 py-3 transition hover:bg-accent"
                onClick={() => onToggleSection(key as keyof typeof expandedSections)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className={`text-muted-foreground transition-transform ${
                        expandedSections[key as keyof typeof expandedSections] ? "rotate-0" : "-rotate-90"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    <Badge
                      variant={progressConfig[key as keyof typeof progressConfig].variant}
                      className="rounded-none font-mono text-[10px] uppercase tracking-wider"
                    >
                      {column.title}
                    </Badge>
                    <span className="font-mono text-sm text-muted-foreground">
                      ({String(column.tasks.length).padStart(2, "0")})
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenGroupMenu(openGroupMenu === key ? null : key);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openGroupMenu === key && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenGroupMenu(null);
                          }}
                        />
                        <div className="absolute right-0 top-full z-50 mt-1 w-44 border border-border bg-background shadow-lg">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddTask(key as "on_track" | "at_risk" | "off_track");
                              setOpenGroupMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Task Here
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSection(key as keyof typeof expandedSections);
                              setOpenGroupMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                            {expandedSections[key as keyof typeof expandedSections] ? "Collapse" : "Expand"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Task List */}
              {expandedSections[key as keyof typeof expandedSections] && (
                <div className="pt-0">
                  <div className="grid grid-cols-7 gap-4 border-b border-border px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-2">Name</div>
                    <div>Assignee</div>
                    <div>Due Date</div>
                    <div>Priority</div>
                    <div className="text-right">Actions</div>
                  </div>

                  <div className="flex flex-col">
                    {column.tasks.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <CircuitBoard className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="text-sm">No tasks in this section</p>
                      </div>
                    ) : (
                      column.tasks.map((task, i) => {
                        const priority = task.priority || "low";
                        const priorityOpacity = {
                          high: "text-foreground",
                          medium: "text-foreground/60",
                          low: "text-muted-foreground",
                        } as const;
                        const isSaving = savingTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            className={`group grid grid-cols-7 items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent ${
                              isSaving ? "opacity-60" : ""
                            }`}
                          >
                            {/* Index + Name */}
                            <div className="col-span-2 flex items-center gap-3">
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {String(i + 1).padStart(2, "0")}
                              </span>
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
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-all ${
                                  task.status === "done"
                                    ? "border-foreground bg-foreground text-background"
                                    : task.status === "in_progress"
                                    ? "border-foreground text-foreground"
                                    : "border-border text-transparent hover:border-muted-foreground"
                                }`}
                              >
                                {task.status === "done" && <Check className="h-3 w-3" />}
                                {task.status === "in_progress" && (
                                  <div className="h-2.5 w-2.5 animate-spin border-2 border-foreground border-t-transparent" />
                                )}
                              </button>

                              <span
                                className={`text-sm font-medium ${
                                  task.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            {/* Assignee */}
                            <div className="relative flex items-center">
                              {task.client_key_id ? (
                                (() => {
                                  const clientId = getClientId(task.client_key_id);
                                  return clientId ? (
                                    <button
                                      onClick={() => setAssigningTask(task.id)}
                                      className="flex h-6 w-6 items-center justify-center border border-border bg-foreground text-[10px] font-semibold text-background"
                                      title="Reassign"
                                    >
                                      C{clientId}
                                    </button>
                                  ) : (
                                    <div className="flex h-6 w-6 items-center justify-center border border-border text-[10px] font-semibold text-muted-foreground">
                                      ?
                                    </div>
                                  );
                                })()
                              ) : (
                                <button
                                  onClick={() => setAssigningTask(task.id)}
                                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                                >
                                  <UserPlus className="h-3 w-3" />
                                  <span>Assign</span>
                                </button>
                              )}

                              {assigningTask === task.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setAssigningTask(null)} />
                                  <div className="absolute left-0 top-full z-50 mt-1 w-40 border border-border bg-background shadow-lg">
                                    {clients.length === 0 ? (
                                      <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                        No clients yet
                                      </div>
                                    ) : (
                                      clients.map((c) => (
                                        <button
                                          key={c.id}
                                          onClick={() => {
                                            patchTask(task, { client_key_id: c.key });
                                            setAssigningTask(null);
                                          }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                        >
                                          C{c.id} · {c.key}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Due Date */}
                            <div className="relative font-mono text-xs text-muted-foreground">
                              {editingDateTask === task.id ? (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setEditingDateTask(null)} />
                                  <input
                                    autoFocus
                                    type="date"
                                    defaultValue={task.due_date ?? ""}
                                    onChange={(e) => {
                                      patchTask(task, { due_date: e.target.value });
                                      setEditingDateTask(null);
                                    }}
                                    onBlur={() => setEditingDateTask(null)}
                                    className="relative z-50 border border-border bg-background px-1.5 py-1 text-xs text-foreground"
                                  />
                                </>
                              ) : task.due_date ? (
                                <button
                                  onClick={() => setEditingDateTask(task.id)}
                                  className="hover:text-foreground"
                                >
                                  {new Date(task.due_date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingDateTask(task.id)}
                                  className="flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Add date</span>
                                </button>
                              )}
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-2">
                              <Flag className={`h-4 w-4 ${priorityOpacity[priority as keyof typeof priorityOpacity]}`} />
                              <span className="font-mono text-[11px] uppercase text-muted-foreground">
                                {priority === "none" ? "" : priority}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button onClick={() => onView(task.id)} className="p-1 text-muted-foreground hover:text-foreground" title="View">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button onClick={() => onDelete(task.id)} className="p-1 text-muted-foreground hover:text-foreground" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => onEdit(task)} className="p-1 text-muted-foreground hover:text-foreground" title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setOpenRowMenu(openRowMenu === task.id ? null : task.id)}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {openRowMenu === task.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenRowMenu(null)} />
                                    <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-border bg-background shadow-lg">
                                      <button
                                        onClick={() => duplicateTask(task)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                        Duplicate
                                      </button>
                                      <div className="border-t border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                        Set Priority
                                      </div>
                                      {["high", "medium", "low"].map((p) => (
                                        <button
                                          key={p}
                                          onClick={() => {
                                            patchTask(task, { priority: p });
                                            setOpenRowMenu(null);
                                          }}
                                          className={`flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider transition hover:bg-accent hover:text-foreground ${
                                            priority === p ? "text-foreground" : "text-muted-foreground"
                                          }`}
                                        >
                                          <Flag className="h-3.5 w-3.5" />
                                          {p}
                                        </button>
                                      ))}
                                      <div className="border-t border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                        Move To
                                      </div>
                                      {(Object.keys(statusForColumn) as (keyof ProgressSections)[]).map((sectionKey) => (
                                        <button
                                          key={sectionKey}
                                          onClick={() => {
                                            onUpdateStatus(task.id, statusForColumn[sectionKey]);
                                            setOpenRowMenu(null);
                                          }}
                                          disabled={categorizeTask(task) === sectionKey}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                          {progressConfig[sectionKey].label}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div className="px-4 py-3">
                      <button
                        onClick={() => onAddTask(key as "on_track" | "at_risk" | "off_track")}
                        className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= BOARD (kanban, drag to change status) ================= */}
      {activeView === "board" && (
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          {Object.entries(columns).map(([key, column]) => (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = Number(e.dataTransfer.getData("text/task-id"));
                if (taskId) onUpdateStatus(taskId, statusForColumn[key as keyof ProgressSections]);
              }}
              className="flex min-h-[200px] flex-col border border-border"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={progressConfig[key as keyof typeof progressConfig].variant}
                    className="rounded-none font-mono text-[10px] uppercase tracking-wider"
                  >
                    {column.title}
                  </Badge>
                  <span className="font-mono text-sm text-muted-foreground">
                    ({String(column.tasks.length).padStart(2, "0")})
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(key as "on_track" | "at_risk" | "off_track")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {column.tasks.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-6 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </div>
                ) : (
                  column.tasks.map((task) => {
                    const priority = task.priority || "low";
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/task-id", String(task.id))}
                        onClick={() => onView(task.id)}
                        className="cursor-grab border border-border bg-background p-3 transition hover:bg-accent active:cursor-grabbing"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Flag
                            className={`h-3.5 w-3.5 ${
                              priority === "high"
                                ? "text-foreground"
                                : priority === "medium"
                                ? "text-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          />
                          {task.due_date && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {task.client_key_id && (
                          <div className="mt-2 flex h-5 w-5 items-center justify-center border border-border bg-foreground text-[9px] font-semibold text-background">
                            C{getClientId(task.client_key_id) ?? "?"}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CALENDAR ================= */}
      {activeView === "calendar" && (
        <CalendarView
          tasks={filteredTasks}
          month={calendarMonth}
          onPrevMonth={() =>
            setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
          }
          onNextMonth={() =>
            setCalendarMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
          }
          onTaskClick={onView}
        />
      )}

      {/* ================= FILES ================= */}
      {activeView === "files" && (
        <div className="p-6">
          {(() => {
            const withFiles = filteredTasks.filter((t) => t.file);
            if (withFiles.length === 0) {
              return (
                <div className="border border-border py-16 text-center text-muted-foreground">
                  <Paperclip className="mx-auto mb-3 h-10 w-10 opacity-20" />
                  <p className="text-sm">No files attached to any task yet</p>
                </div>
              );
            }
            return (
              <div className="border border-border">
                <div className="grid grid-cols-4 gap-4 border-b border-border px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2">Task</div>
                  <div>Assignee</div>
                  <div className="text-right">File</div>
                </div>
                {withFiles.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-4 items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-accent"
                  >
                    <button
                      onClick={() => onView(task.id)}
                      className="col-span-2 truncate text-left text-sm font-medium text-foreground hover:underline"
                    >
                      {task.title}
                    </button>
                    <div className="font-mono text-xs text-muted-foreground">
                      {task.client_key_id ? `C${getClientId(task.client_key_id) ?? "?"}` : "—"}
                    </div>
                    <a
                      href={`/storage/${task.file}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ----- Minimal month calendar -----
function CalendarView({
  tasks,
  month,
  onPrevMonth,
  onNextMonth,
  onTaskClick,
}: {
  tasks: Task[];
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTaskClick: (taskId: number) => void;
}) {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const tasksByDay = new Map<number, Task[]>();
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const d = new Date(t.due_date);
    if (d.getFullYear() === year && d.getMonth() === monthIdx) {
      const day = d.getDate();
      tasksByDay.set(day, [...(tasksByDay.get(day) ?? []), t]);
    }
  });

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={onPrevMonth} className="border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={onNextMonth} className="border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-l border-t border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="border-b border-r border-border bg-accent px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((day, idx) => (
          <div key={idx} className="min-h-[90px] border-b border-r border-border p-1.5">
            {day && (
              <>
                <span className="font-mono text-[10px] text-muted-foreground">{day}</span>
                <div className="mt-1 flex flex-col gap-1">
                  {(tasksByDay.get(day) ?? []).slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onTaskClick(t.id)}
                      className="truncate border border-border bg-background px-1 py-0.5 text-left text-[10px] text-foreground hover:bg-accent"
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  ))}
                  {(tasksByDay.get(day)?.length ?? 0) > 3 && (
                    <span className="font-mono text-[9px] text-muted-foreground">
                      +{(tasksByDay.get(day)?.length ?? 0) - 3} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}