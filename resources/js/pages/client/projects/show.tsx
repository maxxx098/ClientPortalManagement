"use client"

import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import AppLayout from "@/layouts/app-layout"
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
  Image
} from "lucide-react"

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
}

export default function ProjectShow({ project }: Props) {
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

  return (
    <AppLayout>
      <Head title={project.name} />

      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit("/client/projects")}
              className="w-fit gap-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>

            <div className="flex items-start justify-between gap-4 flex-wrap pb-6 border-b border-border/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                  <Badge variant="outline" className={statusColor(project.status)}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Project #{project.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Created {formatDate(project.created_at)}
                  </span>
                </div>
              </div>

              <Badge variant="outline" className={priorityColor(project.priority)}>
                {project.priority.toUpperCase()} Priority
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.progress || 0}%</div>
                <Progress value={project.progress || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.tasks_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks in this project
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {daysUntilDue !== null ? (
                    daysUntilDue >= 0 ? daysUntilDue : 'Overdue'
                  ) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysUntilDue !== null && daysUntilDue >= 0 ? 'Until deadline' : 'No deadline set'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                      title="Admin"
                    >
                      A
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                      title="Client"
                    >
                      C
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">2 members</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Project Description</CardTitle>
                  </div>
                  <CardDescription>Overview and objectives of this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {project.description || "No description provided for this project."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Project Timeline</CardTitle>
                  </div>
                  <CardDescription>Start and end dates for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        Start Date
                      </div>
                      <p className="text-lg font-semibold">{formatDate(project.start_date)}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Due Date
                      </div>
                      <p className="text-lg font-semibold">{formatDate(project.due_date)}</p>
                      {daysUntilDue !== null && daysUntilDue < 7 && daysUntilDue >= 0 && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Project Files</CardTitle>
                  </div>
                  <CardDescription>Attached documents and resources</CardDescription>
                </CardHeader>
                <CardContent>
                  {project.file ? (
                    project.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div className="space-y-3">
                        <div className="relative group">
                          <img
                            src={`/storage/${project.file}`}
                            alt="Project File"
                            className="rounded-lg border border-border max-h-96 w-full object-contain bg-muted/30"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <a
                              href={`/storage/${project.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              <Image className="h-4 w-4" />
                              View full image
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={`/storage/${project.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            Download file
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.file.split('/').pop()}
                          </p>
                        </div>
                      </a>
                    )
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 opacity-30 mx-auto mb-3" />
                      <p className="text-sm">No file uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Activity History</CardTitle>
                  </div>
                  <CardDescription>Key timestamps for this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Project Created</p>
                      <p className="text-xs text-muted-foreground">Initial project setup</p>
                    </div>
                    <p className="text-sm font-semibold">{formatDate(project.created_at)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-muted-foreground">Most recent modification</p>
                    </div>
                    <p className="text-sm font-semibold">{formatDate(project.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Project Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</p>
                    <Badge variant="outline" className={`${statusColor(project.status)} text-sm py-1.5 px-3 w-full justify-center`}>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority Level</p>
                    <Badge variant="outline" className={`${priorityColor(project.priority)} text-sm py-1.5 px-3 w-full justify-center`}>
                      {project.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Quick Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground">Project ID</span>
                    <span className="font-mono font-semibold">#{project.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground">Client Key</span>
                    <span className="font-mono text-xs">{project.client_key_id || "N/A"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm p-2 bg-background/50 rounded">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{project.progress || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Need Assistance?</p>
                      <p className="text-xs text-muted-foreground">
                        Contact your project administrator for updates or support
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}