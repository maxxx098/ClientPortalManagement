import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import AppLayout from '@/layouts/app-layout'
import projects from "@/routes/admin/projects"
import TaskSidebar from "@/components/ui/TaskSidebar"
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  FileText,
  Download,
  Users,
  TrendingUp,
  Tag,
  CheckCircle2,
  Image,
  Plus,
  ListTodo,
  PenBox,
} from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppShell } from "@/components/app-shell"

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
  tasks: Task[]
  isAdmin?: boolean
}

// ---------- shared ledger-style primitives ----------

const Mark = ({ label, redInk }: { label: string; redInk?: boolean }) => (
  <span
    className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
      redInk ? "text-destructive" : "text-muted-foreground"
    }`}
  >
    <span className={`h-1.5 w-1.5 ${redInk ? "bg-destructive" : "border border-current bg-transparent"}`} />
    {label}
  </span>
)

const Section = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="border border-border p-6">
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
)

const TickBar = ({ progress }: { progress: number }) => {
  const ticks = 32
  const filled = Math.round((progress / 100) * ticks)
  return (
    <div className="flex h-4 items-end gap-[2px]">
      {Array.from({ length: ticks }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 ${i % 4 === 0 ? "h-full" : "h-2/3"} ${i < filled ? "bg-foreground" : "bg-border"}`}
        />
      ))}
    </div>
  )
}

export default function Show({ project, tasks = [], isAdmin = false }: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit" | "create">("create")
  const [isProcessing, setIsProcessing] = useState(false)

  // Red ink reserved for on_hold / high priority / off-track states — everything else is plain ink.
  const isRedInk = (value: string) => ["high", "on_hold"].includes((value || "").toLowerCase())

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const formatStatus = (status: string) =>
    status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  const handleDelete = () => {
    router.delete(projects.destroy.url({ project: project.id }), {
      onSuccess: () => router.visit(projects.index.url()),
    })
  }

  const getDaysUntilDue = () => {
    if (!project.due_date) return null
    const diffTime = new Date(project.due_date).getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  const daysUntilDue = getDaysUntilDue()

  const handleCreateTask = () => {
    setSelectedTask(null)
    setSidebarMode("create")
    setTaskSidebarOpen(true)
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setSidebarMode("view")
    setTaskSidebarOpen(true)
  }

  const handleTaskDelete = (taskId: number) => {
    setIsProcessing(true)
    router.delete(`/admin/tasks/${taskId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setTaskSidebarOpen(false)
        setSelectedTask(null)
        setIsProcessing(false)
      },
      onError: () => setIsProcessing(false),
    })
  }

  const handleSave = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setTaskSidebarOpen(false)
      setSelectedTask(null)
    }, 500)
  }

  const closeSidebar = () => {
    setTaskSidebarOpen(false)
    setSelectedTask(null)
  }

  const handleEdit = (task?: Task | null) => {
    setSelectedTask(task || null)
    setSidebarMode("edit")
    setTaskSidebarOpen(true)
  }

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const doneTasks = tasks.filter((t) => t.status === "done")

  // Flat task row shared by all three groups
  const TaskRow = ({ task, index, done }: { task: Task; index: number; done?: boolean }) => (
    <div
      key={task.id}
      onClick={() => handleViewTask(task)}
      className="flex items-center gap-3 border-b border-border py-3 last:border-b-0 cursor-pointer hover:bg-muted/30"
    >
      <span className="font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium text-foreground ${done ? "line-through opacity-60" : ""}`}>{task.title}</p>
        {task.due_date && (
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">Due {formatDate(task.due_date)}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleEdit(task)
        }}
        className="gap-1.5 rounded-none text-xs text-muted-foreground hover:text-foreground"
      >
        <PenBox size={13} />
        Edit
      </Button>
    </div>
  )

  return (
    <AppShell variant="sidebar">
      <Head title={project.name} />
      <AppSidebar />
      <SidebarInset
        className="overflow-x-hidden transition-[margin-right] duration-300 ease-linear"
        style={{ marginRight: taskSidebarOpen ? '24rem' : '0' }}
      >
        <AppSidebarHeader
          breadcrumbs={[{ label: 'Projects', href: projects.index.url() }, { label: project.name }] as any}
        />

        <div className="relative min-h-screen bg-background">
          <div className="mx-auto max-w-[1400px] p-6 lg:p-8 space-y-3">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.visit(projects.index.url())}
                className="w-fit gap-2 rounded-none hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{project.name}</h1>
                    <Mark label={formatStatus(project.status)} redInk={isRedInk(project.status)} />
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Project #{project.id}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Created {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      isRedInk(project.priority) ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {project.priority} priority
                  </span>
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(projects.edit.url({ project: project.id }))}
                        className="gap-2 rounded-none"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="gap-2 rounded-none"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stat ledger */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="border border-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Progress</span>
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {project.progress || 0}%
                </span>
                <div className="mt-4">
                  <TickBar progress={project.progress || 0} />
                </div>
              </div>

              <div className="border border-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Total Tasks</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {String(project.tasks_count || 0).padStart(2, "0")}
                </span>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">Tasks in this project</p>
              </div>

              <div className="border border-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Days Remaining</span>
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <span
                  className={`font-mono text-3xl font-semibold tabular-nums ${
                    daysUntilDue !== null && daysUntilDue < 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {daysUntilDue !== null ? (daysUntilDue >= 0 ? String(daysUntilDue).padStart(2, "0") : "Overdue") : "N/A"}
                </span>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {daysUntilDue !== null && daysUntilDue >= 0 ? "Until deadline" : "No deadline set"}
                </p>
              </div>

              <div className="border border-border p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Team</span>
                  <Users className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center border border-border bg-foreground text-[10px] font-semibold text-background"
                      title="Admin"
                    >
                      A
                    </div>
                    <div
                      className="flex h-7 w-7 items-center justify-center border-2 border-background bg-muted-foreground text-[10px] font-semibold text-background"
                      title="Client"
                    >
                      C
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">2 members</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <Section icon={FileText} title="Project Description" description="Overview and objectives of this project">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {project.description || "No description provided for this project."}
                  </p>
                </Section>

                {/* Tasks */}
                <Section
                  icon={ListTodo}
                  title="Project Tasks"
                  description="Tasks related to this project via client key"
                  action={
                    isAdmin && (
                      <Button size="sm" onClick={handleCreateTask} className="gap-2 rounded-none">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    )
                  }
                >
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <ListTodo className="mb-3 h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">No tasks yet</p>
                      {isAdmin && (
                        <Button variant="outline" size="sm" onClick={handleCreateTask} className="mt-4 gap-2 rounded-none">
                          <Plus className="h-4 w-4" />
                          Create First Task
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {todoTasks.length > 0 && (
                        <div>
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            To Do &middot; {String(todoTasks.length).padStart(2, "0")}
                          </p>
                          {todoTasks.map((t, i) => (
                            <TaskRow key={t.id} task={t} index={i} />
                          ))}
                        </div>
                      )}
                      {inProgressTasks.length > 0 && (
                        <div>
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            In Progress &middot; {String(inProgressTasks.length).padStart(2, "0")}
                          </p>
                          {inProgressTasks.map((t, i) => (
                            <TaskRow key={t.id} task={t} index={i} />
                          ))}
                        </div>
                      )}
                      {doneTasks.length > 0 && (
                        <div>
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Done &middot; {String(doneTasks.length).padStart(2, "0")}
                          </p>
                          {doneTasks.map((t, i) => (
                            <TaskRow key={t.id} task={t} index={i} done />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Section>

                <Section icon={Calendar} title="Project Timeline" description="Start and end dates for this project">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-border p-4">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span className="h-1.5 w-1.5 border border-current" />
                        Start Date
                      </div>
                      <p className="mt-2 text-lg font-semibold text-foreground">{formatDate(project.start_date)}</p>
                    </div>
                    <div className="border border-border p-4">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span className="h-1.5 w-1.5 bg-destructive" />
                        Due Date
                      </div>
                      <p className="mt-2 text-lg font-semibold text-foreground">{formatDate(project.due_date)}</p>
                      {daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue >= 0 && (
                        <span className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          Due soon
                        </span>
                      )}
                    </div>
                  </div>
                </Section>

                <Section icon={FileText} title="Project Files" description="Attached documents and resources">
                  {project.file ? (
                    project.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="group relative">
                        <img
                          src={project.file}
                          alt="Project File"
                          className="max-h-96 w-full border border-border bg-muted/30 object-contain"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <a
                            href={project.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-background bg-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-background hover:bg-foreground/90"
                          >
                            <Image className="h-4 w-4" />
                            View full image
                          </a>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={project.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 border border-border p-4 hover:bg-muted/30"
                      >
                        <Download className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:underline">Download file</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{project.file.split('/').pop()}</p>
                        </div>
                      </a>
                    )
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <FileText className="mb-3 h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">No file uploaded</p>
                    </div>
                  )}
                </Section>

                <Section icon={Clock} title="Activity History" description="Key timestamps for this project">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Project Created</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Initial project setup</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">{formatDate(project.created_at)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Last Updated</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Most recent modification</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">{formatDate(project.updated_at)}</p>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="space-y-3">
                <div className="border border-border bg-muted/30 p-6">
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Project Status</p>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current Status</p>
                      <Mark label={formatStatus(project.status)} redInk={isRedInk(project.status)} />
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Priority Level</p>
                      <span
                        className={`font-mono text-[11px] uppercase tracking-widest ${
                          isRedInk(project.priority) ? "text-destructive" : "text-foreground"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-border bg-muted/30 p-6">
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Quick Info</p>
                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground">Project ID</span>
                      <span className="font-semibold text-foreground">#{project.id}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-2 pt-1">
                      <span className="text-muted-foreground">Client Key</span>
                      <span className="text-foreground">{project.client_key_id || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{project.progress || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="border border-border p-6 text-center">
                  <TrendingUp className="mx-auto mb-3 h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-foreground">Need Assistance?</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Contact your project administrator for updates or support
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 w-full rounded-none">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Task Sidebar */}
          <div
            className={`fixed right-0 top-0 z-[100] h-full w-96 transform transition-transform duration-300 ease-linear ${
              taskSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <TaskSidebar
              isOpen={taskSidebarOpen}
              task={selectedTask}
              mode={sidebarMode}
              isLoading={isProcessing}
              onClose={closeSidebar}
              onSave={handleSave}
              onDelete={handleTaskDelete}
              userRole="admin"
              isAdmin={isAdmin}
              clientKey={project.client_key_id}
              routePrefix="/admin"
            />
          </div>
        </div>
      </SidebarInset>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project "{project.name}" and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}