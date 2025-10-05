import { Head, Link } from "@inertiajs/react"
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EyeIcon } from "lucide-react"

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
  const priorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return { 
          gradient: "from-red-900 to-red-950 dark:from-red-800 dark:to-red-900",
          border: "border-red-900/50 dark:border-red-800/50",
          text: "text-red-900 dark:text-red-400"
        }
      case "medium":
        return { 
          gradient: "from-orange-900 to-orange-950 dark:from-orange-800 dark:to-orange-900",
          border: "border-orange-900/50 dark:border-orange-800/50",
          text: "text-orange-900 dark:text-orange-400"
        }
      case "low":
        return { 
          gradient: "from-teal-900 to-teal-950 dark:from-teal-800 dark:to-teal-900",
          border: "border-teal-900/50 dark:border-teal-800/50",
          text: "text-teal-900 dark:text-teal-400"
        }
      default:
        return { 
          gradient: "from-slate-800 to-slate-950 dark:from-slate-700 dark:to-slate-800",
          border: "border-slate-800/50 dark:border-slate-700/50",
          text: "text-slate-800 dark:text-slate-400"
        }
    }
  }

  const statusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { 
          bg: "bg-emerald-950/30 dark:bg-emerald-900/20", 
          text: "text-emerald-800 dark:text-emerald-400",
          border: "border-emerald-900/30 dark:border-emerald-800/30"
        }
      case "in_progress":
        return { 
          bg: "bg-blue-950/30 dark:bg-blue-900/20", 
          text: "text-blue-800 dark:text-blue-400",
          border: "border-blue-900/30 dark:border-blue-800/30"
        }
      case "on_hold":
        return { 
          bg: "bg-amber-950/30 dark:bg-amber-900/20", 
          text: "text-amber-800 dark:text-amber-400",
          border: "border-amber-900/30 dark:border-amber-800/30"
        }
      case "planned":
        return { 
          bg: "bg-purple-950/30 dark:bg-purple-900/20", 
          text: "text-purple-800 dark:text-purple-400",
          border: "border-purple-900/30 dark:border-purple-800/30"
        }
      default:
        return { 
          bg: "bg-gray-950/30 dark:bg-gray-900/20", 
          text: "text-gray-800 dark:text-gray-400",
          border: "border-gray-900/30 dark:border-gray-800/30"
        }
    }
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

  // Calculate dashboard stats
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status.toLowerCase() === 'in_progress').length
  const completedProjects = projects.filter(p => p.status.toLowerCase() === 'completed').length
  const highPriorityProjects = projects.filter(p => p.priority.toLowerCase() === 'high').length

  return (
    <AppLayout>
      <Head title="My Projects" />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
              Projects
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your active workspace
            </p>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  All projects assigned to you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Currently in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  High Priority
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highPriorityProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <div className="text-4xl">✦</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Projects Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Contact your administrator to get started with your first project
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const priority = priorityStyles(project.priority)
                const status = statusStyles(project.status)
                const progress = getProgress(project.start_date, project.due_date)

                return (
                  <Link
                    key={project.id}
                    href={`/client/projects/${project.id}`}
                    className="group block"
                  >
                    <div className="relative h-full rounded-xl border">
                      <div className="p-6 space-y-5">
                        {/* Title */}
                        <div className="space-y-3">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors line-clamp-2 leading-tight min-h-[3.5rem]">
                            {project.name}
                          </h2>
                          
                          {/* Status & Priority Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
                              {formatStatus(project.status)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${priority.text}`}>
                              {project.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed min-h-[4rem]">
                          {project.description || "No description provided."}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-500 font-medium">Progress</span>
                            <span className="text-gray-700 dark:text-gray-300 font-bold">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${priority.gradient} transition-all duration-500 rounded-full`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                              Start
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(project.start_date)}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                              Due
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(project.due_date)}
                            </div>
                          </div>
                        </div>

                        {/* View Button */}
                        <div className="pt-2">
                          <div className={`w-full bg-gradient-to-r ${priority.gradient} flex items-center justify-center gap-2 text-white rounded-lg px-4 py-2.5 text-center font-semibold text-sm group-hover:opacity-90 transition-all duration-300`}>
                            View Details <EyeIcon size={16}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}