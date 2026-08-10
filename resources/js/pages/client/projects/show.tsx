"use client"

import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AppLayout from "@/layouts/app-layout"
import TaskSidebar from "@/components/ui/TaskSidebar"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Info,
  Tag,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Image,
  ListTodo,
  PenBox
} from "lucide-react"
import { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppShell } from "@/components/app-shell"
import { AppSidebar } from "@/components/app-sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface Task {
  id: number
  title: string
  description?: string
  status: "todo" | "in_progress" | "done"
  progress_status?: "on_track" | "at_risk" | "off_track"
  client_key_id?: string
  file?: string | null
  voice_message?: string | null
  due_date?: string | null
  created_at: string
}

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  file: string | null
  due_date: string
  client_key_id: string
  created_at: string
  updated_at: string
  progress?: number
  tasks_count?: number
}

interface Props {
  project: Project
  tasks?: Task[]
}

export default function ProjectShow({ project, tasks = [] }: Props) {
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit" | "create">("view")
  const [showDueDateAlert, setShowDueDateAlert] = useState(false)

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    const s = status.toLowerCase()
    if (s === "completed" || s === "done") return "secondary"
    if (s === "on_hold") return "default"
    return "outline"
  }

  const getPriorityVariant = (priority: string): "default" | "outline" | "secondary" => {
    const p = priority.toLowerCase()
    if (p === "high") return "default"
    if (p === "low") return "secondary"
    return "outline"
  }

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  const getDaysUntilDue = () => {
    if (!project.due_date) return null
    const today = new Date()
    const dueDate = new Date(project.due_date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setSidebarMode("view")
    setTaskSidebarOpen(true)
  }

  const closeSidebar = () => {
    setTaskSidebarOpen(false)
    setSelectedTask(null)
  }

  const handleTaskDelete = (taskId: number) => {
    setIsProcessing(true)
    router.delete(`/client/tasks/${taskId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setTaskSidebarOpen(false)
        setSelectedTask(null)
        setIsProcessing(false)
      },
      onError: () => {
        setIsProcessing(false)
      }
    })
  }

  const handleSave = (formData: FormData) => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setTaskSidebarOpen(false)
      setSelectedTask(null)
    }, 500)
  }

  const todoTasks = tasks.filter(t => t.status === "todo")
  const inProgressTasks = tasks.filter(t => t.status === "in_progress")
  const doneTasks = tasks.filter(t => t.status === "done")

  const handleEditTask = (task?: Task | null) => {
    setSelectedTask(task || null);
    setSidebarMode("edit");
    setTaskSidebarOpen(true);
  };

  const taskGroups: { label: string; items: Task[] }[] = [
    { label: "To Do", items: todoTasks },
    { label: "In Progress", items: inProgressTasks },
    { label: "Done", items: doneTasks },
  ]

  return (
    <AppShell variant="sidebar">
      <Head title={project.name} />
      <AppSidebar />
      <SidebarInset
        className="overflow-x-hidden transition-[margin-right] duration-300 ease-linear"
        style={{
          marginRight: taskSidebarOpen ? '24rem' : '0'
        }}
      >
        <div className="relative min-h-screen bg-background pb-16">
          <main className="mx-auto w-full max-w-[1500px] px-8 py-8">

            {/* Masthead */}
            <div className="mb-8 border-b border-border pb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.visit("/client/projects")}
                className="mb-5 w-fit gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                    <Badge variant={getStatusVariant(project.status)} className="rounded-none font-mono text-[10px] uppercase">
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Project #{project.id}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Created {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>

                <Badge variant={getPriorityVariant(project.priority)} className="rounded-none font-mono text-[10px] uppercase">
                  {project.priority} Priority
                </Badge>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="border border-border p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Progress</p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-mono text-3xl font-semibold tabular-nums text-foreground">{project.progress || 0}%</h3>
                <div className="h-1.5 w-full bg-muted">
                  <div className="h-full bg-foreground transition-all" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </div>

              <div className="border border-border p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Total Tasks</p>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{project.tasks_count || 0}</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tasks in this project
                </p>
              </div>

              <div className="border border-border p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Days Remaining</p>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {daysUntilDue !== null ? (daysUntilDue >= 0 ? daysUntilDue : 'Overdue') : 'N/A'}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {daysUntilDue !== null && daysUntilDue >= 0 ? 'Until deadline' : 'No deadline set'}
                </p>
              </div>

              <div className="border border-border p-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Team Members</p>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div
                      className="flex h-7 w-7 items-center justify-center border border-foreground bg-foreground font-mono text-[10px] font-bold text-background"
                      title="Admin"
                    >
                      A
                    </div>
                    <div
                      className="flex h-7 w-7 items-center justify-center border border-border bg-background font-mono text-[10px] font-bold text-foreground"
                      title="Client"
                    >
                      C
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">2 members</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">

                {/* Description */}
                <div className="border border-border p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Project Description</h2>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Overview and objectives of this project
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {project.description || "No description provided for this project."}
                  </p>
                </div>

                {/* Tasks */}
                <div className="border border-border p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Project Tasks</h2>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Tasks related to this project
                  </p>

                  {tasks.length === 0 ? (
                    <div className="py-12 text-center">
                      <ListTodo className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No tasks yet</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {taskGroups.map(group => group.items.length > 0 && (
                        <div key={group.label} className="space-y-2">
                          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {group.label} ({group.items.length})
                          </h4>
                          <div className="space-y-2">
                            {group.items.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => handleViewTask(task)}
                                className="flex cursor-pointer items-center justify-between gap-3 border border-border p-3 transition-colors hover:bg-accent"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-foreground">{task.title}</p>
                                  {task.due_date && (
                                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                      Due {formatDate(task.due_date)}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={getStatusVariant(task.status)} className="rounded-none font-mono text-[9px] uppercase">
                                  {group.label}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task);
                                  }}
                                  className="gap-2 rounded-none border-border font-mono text-[10px] uppercase"
                                >
                                  <PenBox size={14} />
                                  Edit
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="border border-border p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Project Timeline</h2>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Start and end dates for this project
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="border border-border p-4">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Start Date</p>
                      <p className="text-lg font-semibold text-foreground">{formatDate(project.start_date)}</p>
                    </div>
                    <div className="border border-border p-4">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Due Date</p>
                      <p className="text-lg font-semibold text-foreground">{formatDate(project.due_date)}</p>
                      {daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue >= 0 && (
                        <Badge variant="default" className="mt-2 gap-1 rounded-none font-mono text-[9px] uppercase">
                          <AlertCircle className="h-3 w-3" />
                          Due soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div className="border border-border p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Project Files</h2>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Attached documents and resources
                  </p>

                  {project.file ? (
                    project.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="group relative border border-border">
                        <img
                          src={`/storage/${project.file}`}
                          alt="Project File"
                          className="max-h-96 w-full bg-muted object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/70 opacity-0 transition-opacity group-hover:opacity-100">
                          <a
                            href={`/storage/${project.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-background bg-background px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:bg-background/90"
                          >
                            <Image className="h-4 w-4" />
                            View full image
                          </a>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={`/storage/${project.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 border border-border p-4 transition-colors hover:bg-accent"
                      >
                        <Download className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">Download file</p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {project.file.split('/').pop()}
                          </p>
                        </div>
                      </a>
                    )
                  ) : (
                    <div className="py-12 text-center">
                      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No file uploaded</p>
                    </div>
                  )}
                </div>

                {/* Activity */}
                <div className="border border-border p-8">
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">Activity History</h2>
                  </div>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Key timestamps for this project
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border border-border p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Project Created</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Initial project setup</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">{formatDate(project.created_at)}</p>
                    </div>
                    <div className="flex items-center justify-between border border-border p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Last Updated</p>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Most recent modification</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">{formatDate(project.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-3">
                <div className="border border-border p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">Project Status</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current Status</p>
                      <Badge variant={getStatusVariant(project.status)} className="w-full justify-center rounded-none py-1.5 font-mono text-xs uppercase">
                        {formatStatus(project.status)}
                      </Badge>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Priority Level</p>
                      <Badge variant={getPriorityVariant(project.priority)} className="w-full justify-center rounded-none py-1.5 font-mono text-xs uppercase">
                        {project.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border border-border p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">Quick Info</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border border-border p-2.5 font-mono text-xs">
                      <span className="uppercase tracking-wider text-muted-foreground">Project ID</span>
                      <span className="font-semibold text-foreground">#{project.id}</span>
                    </div>
                    <div className="flex items-center justify-between border border-border p-2.5 font-mono text-xs">
                      <span className="uppercase tracking-wider text-muted-foreground">Client Key</span>
                      <span className="text-foreground">{project.client_key_id || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between border border-border p-2.5 font-mono text-xs">
                      <span className="uppercase tracking-wider text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{project.progress || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-border bg-foreground p-6 text-center text-background">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center border border-background/30">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <p className="mb-1 text-sm font-semibold">Need Assistance?</p>
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-background/60">
                    Contact your project administrator for updates or support
                  </p>
                  <Button variant="outline" size="sm" className="w-full rounded-none border-background/30 bg-transparent font-mono text-xs uppercase tracking-wider text-background hover:bg-background/10 hover:text-background">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </main>

          {/* Task Sidebar - Fixed position, slides in from right */}
          <div
            className={`fixed right-0 top-0 z-[100] h-full w-96 transform transition-transform duration-300 ease-linear ${
              taskSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <TaskSidebar
              isOpen={taskSidebarOpen}
              task={selectedTask}
              mode={sidebarMode}
              isLoading={false}
              onClose={closeSidebar}
              onSave={() => {}}
              userRole="client"
              isAdmin={true}
              clientKey={project.client_key_id}
              routePrefix="/client"
              projectDueDate={project.due_date}
              onDueDateError={() => setShowDueDateAlert(true)}
              onDelete={handleTaskDelete}
            />
          </div>
        </div>
      </SidebarInset>

      {/* Backdrop Overlay */}
      {showDueDateAlert && (
        <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" />
      )}

      {/* Alert Dialog */}
      <AlertDialog open={showDueDateAlert} onOpenChange={setShowDueDateAlert}>
        <AlertDialogContent className="z-[200] rounded-none border-border">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border border-border">
                <AlertTriangle className="h-4 w-4 text-foreground" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold">
                Invalid Due Date
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              The task due date cannot be later than the project due date ({formatDate(project.due_date)}). Please select a valid due date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDueDateAlert(false)} className="rounded-none">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}