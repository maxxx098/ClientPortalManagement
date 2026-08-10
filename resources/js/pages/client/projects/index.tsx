import { Head, Link } from "@inertiajs/react"
import AppLayout from '@/layouts/app-layout'
import { Badge } from '@/components/ui/badge'
import { EyeIcon, Users, Activity, CheckCircle2, Flame } from "lucide-react"

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  due_date: string
  created_at: string
}

interface Props {
  projects: Project[]
}

export default function Index({ projects }: Props) {
  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    const s = status.toLowerCase()
    if (s === "completed") return "secondary"
    if (s === "on_hold") return "default"
    return "outline"
  }

  const getPriorityVariant = (priority: string): "default" | "outline" | "secondary" => {
    const p = priority.toLowerCase()
    if (p === "high") return "default"
    if (p === "low") return "secondary"
    return "outline"
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getProgress = (startDate: string, dueDate: string) => {
    if (!startDate || !dueDate) return 0
    const start = new Date(startDate).getTime()
    const due = new Date(dueDate).getTime()
    const now = new Date().getTime()
    const total = due - start
    const elapsed = now - start
    const progress = (elapsed / total) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status.toLowerCase() === 'in_progress').length
  const completedProjects = projects.filter(p => p.status.toLowerCase() === 'completed').length
  const highPriorityProjects = projects.filter(p => p.priority.toLowerCase() === 'high').length

  return (
    <AppLayout>
      <Head title="My Projects" />

      <div className="min-h-screen bg-background pb-16">
        <main className="mx-auto w-full max-w-[1500px] px-8 py-8">

          {/* Masthead */}
          <div className="mb-8 border-b border-border pb-6">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Projects</h1>
          </div>

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Total Projects</p>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{totalProjects}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Assigned to you
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Active</p>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{activeProjects}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                In progress
              </p>
            </div>

            <div className="border border-border bg-foreground p-6 text-background">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-background/60">Completed</p>
                <CheckCircle2 className="h-4 w-4 text-background/60" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums">{completedProjects}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-background/60">
                Successfully finished
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">High Priority</p>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{highPriorityProjects}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Needs attention
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-border py-24">
              <div className="mb-6 flex h-16 w-16 items-center justify-center border border-border">
                <div className="text-2xl text-muted-foreground">✦</div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                No Projects Yet
              </h3>
              <p className="max-w-md text-center text-sm text-muted-foreground">
                Contact your administrator to get started with your first project
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const progress = getProgress(project.start_date, project.due_date)

                return (
                  <Link
                    key={project.id}
                    href={`/client/projects/${project.id}`}
                    className="group block border border-border p-6 transition-colors hover:bg-accent"
                  >
                    <div className="space-y-5">
                      {/* Title */}
                      <div className="space-y-3">
                        <h2 className="min-h-[3.5rem] text-lg font-semibold leading-tight text-foreground line-clamp-2">
                          {project.name}
                        </h2>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant={getStatusVariant(project.status)} className="rounded-none font-mono text-[9px] uppercase">
                            {formatStatus(project.status)}
                          </Badge>
                          <Badge variant={getPriorityVariant(project.priority)} className="rounded-none font-mono text-[9px] uppercase">
                            {project.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="min-h-[4rem] text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {project.description || "No description provided."}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-bold text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted">
                          <div
                            className="h-full bg-foreground transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Start
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            {formatDate(project.start_date)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            Due
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            {formatDate(project.due_date)}
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <div className="flex items-center justify-center gap-2 bg-foreground px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background transition-opacity group-hover:opacity-90">
                        View Details <EyeIcon size={14} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  )
}