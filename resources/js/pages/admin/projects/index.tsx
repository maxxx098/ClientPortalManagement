import { Head, usePage, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import CreateProjectModal from "@/pages/admin/projects/modal"
import AppLayout from '@/layouts/app-layout'
import { SectionLabel, Eyebrow } from "@/components/manifest-ui"
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  FolderKanban,
  Users,
  MoreVertical,
  CheckCircle2,
  Circle,
  Key,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import projects from "@/routes/admin/projects"
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

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  due_date: string
  progress?: number
  tasks_count?: number
}

export default function Index() {
  const { projects: projectList, availableClientKeys, hasClientKeys } = usePage().props as unknown as {
    projects: Project[]
    availableClientKeys: { id: number; key: string }[]
    hasClientKeys: boolean
  }

  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  // ---------- No client keys state ----------
  if (!hasClientKeys) {
    return (
      <AppLayout>
        <Head title="Projects" />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex max-w-md flex-col items-center border border-border p-10 text-center">
            <Key className="mb-6 h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Prerequisite Missing
            </p>
            <h1 className="mb-3 text-xl font-semibold tracking-tight text-foreground">No Client Keys Found</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              You need at least one client key before creating or managing projects.
            </p>
            <Button
              onClick={() => router.visit('/admin/client-keys')}
              className="gap-2 rounded-none"
            >
              <Key className="h-4 w-4" />
              Go to Client Key Management
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ---------- Status / priority read as ledger marks, not colored pills ----------
  // Ink rule: black for normal states, red ("red ink") reserved for on_hold / high priority only.
  const isRedInk = (value: string) => ["high", "on_hold"].includes(value.toLowerCase())

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatStatus = (status: string) =>
    status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  const handleViewDetails = (projectId: number) => router.visit(`/admin/projects/${projectId}`)

  const handleStatusChange = (projectId: number, newStatus: string) => {
    router.put(
      projects.update.url({ project: projectId }),
      { status: newStatus, _method: "PUT" },
      { preserveScroll: true }
    )
  }

  const handleMarkAsCompleted = (projectId: number) => handleStatusChange(projectId, "completed")
  const handleMarkAsInProgress = (projectId: number) => handleStatusChange(projectId, "in_progress")
  const handleEdit = (projectId: number) => router.visit(projects.edit.url({ project: projectId }))

  const handleDelete = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete === null) return
    router.delete(projects.destroy.url({ project: projectToDelete.id }), {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
      },
    })
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  // ---------- Ledger stat row (matches dashboard) ----------
  const LedgerStat = ({
    index,
    label,
    value,
    icon: Icon,
    redInk,
  }: {
    index: string
    label: string
    value: number
    icon: React.ElementType
    redInk?: boolean
  }) => (
    <div className="border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
        </div>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <span className={`font-mono text-3xl font-semibold tabular-nums ${redInk ? "text-destructive" : "text-foreground"}`}>
        {String(value).padStart(2, "0")}
      </span>
    </div>
  )

  // ---------- Tick meter for per-project progress (replaces rounded Progress bar) ----------
  const TickBar = ({ progress }: { progress: number }) => {
    const ticks = 24
    const filled = Math.round((progress / 100) * ticks)
    return (
      <div className="flex h-3 items-end gap-[2px]">
        {Array.from({ length: ticks }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${i % 4 === 0 ? "h-full" : "h-2/3"} ${i < filled ? "bg-foreground" : "bg-border"}`}
          />
        ))}
      </div>
    )
  }

  const totalCount = projectList.length
  const activeCount = projectList.filter((p) => p.status === "in_progress").length
  const completedCount = projectList.filter((p) => p.status === "completed").length
  const plannedCount = projectList.filter((p) => p.status === "planned").length

  return (
    <AppLayout>
      <Head title="Projects" />

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8 space-y-3">
          {/* Masthead */}
          <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>daily manifest</Eyebrow>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Projects</h1>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Manage and track all engagements
              </p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2 rounded-none">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>

          {/* Stat ledger */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <LedgerStat index="01" label="Total Projects" value={totalCount} icon={FolderKanban} />
            <LedgerStat index="02" label="In Progress" value={activeCount} icon={ArrowUpRight} />
            <LedgerStat index="03" label="Completed" value={completedCount} icon={CheckCircle2} />
            <LedgerStat index="04" label="Planned" value={plannedCount} icon={ArrowDownRight} />
          </div>

          {/* Project register — a numbered list, since these rows are a real queue */}
          <div className="border border-border">
            {projectList.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <FolderKanban className="mb-4 h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
                <p className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  No projects yet
                </p>
                <Button onClick={() => setOpen(true)} variant="outline" className="gap-2 rounded-none">
                  <Plus className="h-4 w-4" />
                  Create your first project
                </Button>
              </div>
            ) : (
              projectList.map((project, i) => (
                <div
                  key={project.id}
                  className="grid grid-cols-1 gap-4 border-b border-border p-6 last:border-b-0 md:grid-cols-[2.5rem_1fr_auto] md:items-center"
                >
                  {/* Index */}
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>

                  {/* Main */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3
                        className="cursor-pointer text-base font-semibold tracking-tight text-foreground hover:underline"
                        onClick={() => handleViewDetails(project.id)}
                      >
                        {project.name}
                      </h3>
                      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span
                          className={`h-1.5 w-1.5 ${
                            project.status === "completed" ? "bg-foreground" : "border border-muted-foreground bg-transparent"
                          }`}
                        />
                        {formatStatus(project.status)}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest ${
                          isRedInk(project.priority) ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {project.priority} priority
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
                      {project.description || "No description provided."}
                    </p>

                    <div className="mt-3 grid max-w-md grid-cols-[1fr_auto] items-center gap-3">
                      <TickBar progress={project.progress ?? 0} />
                      <span className="font-mono text-[11px] tabular-nums text-foreground">
                        {project.progress ?? 0}%
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>{project.tasks_count || 0} tasks</span>
                      <span>Due {formatDate(project.due_date)}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />2 members
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-self-start md:justify-self-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(project.id)}
                      className="gap-1 rounded-none text-xs hover:text-foreground"
                    >
                      View
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-none">
                        <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(project.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {project.status !== "completed" ? (
                          <DropdownMenuItem onClick={() => handleMarkAsCompleted(project.id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleMarkAsInProgress(project.id)}>
                            <Circle className="mr-2 h-4 w-4" />
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(project)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal open={open} setOpen={setOpen} availableClientKeys={availableClientKeys} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm uppercase tracking-widest">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project "{projectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-none bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}