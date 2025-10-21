import { Head, usePage, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import CreateProjectModal from "@/pages/admin/projects/modal"
import AppLayout from '@/layouts/app-layout'
import { 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight,
  FolderKanban,
  Users,
  TrendingUp,
  MoreVertical
} from "lucide-react"

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
  const { projects } = usePage().props as unknown as { projects: Project[] }
  const [open, setOpen] = useState(false)

  const priorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "in_progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "on_hold":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "planned":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  const handleViewDetails = (projectId: number) => {
    router.visit(`/admin/projects/${projectId}`)
  }

  return (
    <AppLayout>
      <Head title="Projects" />

      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and track all your projects
              </p>
            </div>
            <Button 
              onClick={() => setOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Total Projects</div>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Active</div>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {projects.filter(p => p.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Completed</div>
                <Calendar className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium">Planned</div>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'planned').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upcoming projects
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-16 text-muted-foreground">
                    <FolderKanban className="w-16 h-16 opacity-30 mx-auto mb-4" />
                    <p className="text-sm mb-4">No projects yet</p>
                    <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create your first project
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:bg-background/50 transition-all cursor-pointer group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${statusColor(project.status)} border text-[10px] px-2 py-0.5`}>
                            {formatStatus(project.status)}
                          </Badge>
                          <Badge variant="outline" className={`${priorityColor(project.priority)} border text-[10px] px-2 py-0.5`}>
                            {project.priority}
                          </Badge>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    {/* Progress Bar (if available) */}
                    {project.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground">{project.tasks_count || 0} Tasks</span>
                          <span className="text-foreground font-semibold">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              project.progress >= 75 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : project.progress >= 50 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(project.due_date)}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetails(project.id)}
                        className="gap-1 h-8 text-xs hover:text-primary group/btn"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex -space-x-2">
                        {/* Admin Avatar */}
                        <div 
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-white text-[10px] font-medium"
                          title="Admin"
                        >
                          A
                        </div>
                        {/* Client User Avatar */}
                        <div 
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-background flex items-center justify-center text-white text-[10px] font-medium"
                          title="Client"
                        >
                          C
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">2 members</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateProjectModal open={open} setOpen={setOpen} />
    </AppLayout>
  )
}