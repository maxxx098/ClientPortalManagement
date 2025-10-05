import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AppLayout from '@/layouts/app-layout'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  AlertCircle
} from "lucide-react"

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  due_date: string
  client_key_id: string
  created_at: string
  updated_at: string
}

interface Props {
  project: Project
}

export default function Show({ project }: Props) {
  const priorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "planned":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <AppLayout>
      <Head title={project.name} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.visit('/client/projects')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Projects
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex gap-3 items-center flex-wrap">
              <Badge className={priorityColor(project.priority)}>
                {project.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge className={statusColor(project.status)}>
                {formatStatus(project.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Description Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {project.description || "No description provided for this project."}
              </p>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Start Date
                </p>
                <p className="text-base font-semibold">
                  {formatDate(project.start_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Due Date
                </p>
                <p className="text-base font-semibold">
                  {formatDate(project.due_date)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Project ID
                </p>
                <p className="text-base font-semibold">
                  #{project.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Current Status
                </p>
                <Badge className={statusColor(project.status)}>
                  {formatStatus(project.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Priority Level
                </p>
                <Badge className={priorityColor(project.priority)}>
                  {project.priority.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <p className="text-sm text-muted-foreground">Project Created</p>
                <p className="text-sm font-medium">
                  {formatDate(project.created_at)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDate(project.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <Card className="mt-6 ">
          <CardContent className="p-4">
            <p className="text-sm text-900">
              <strong>Need help?</strong> If you have questions about this project or need updates, 
              please contact your project administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}