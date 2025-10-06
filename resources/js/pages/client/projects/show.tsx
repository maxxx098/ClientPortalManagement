"use client"

import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AppLayout from "@/layouts/app-layout"
import { ArrowLeft, Calendar, Clock, Info } from "lucide-react"

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

export default function ProjectShow({ project }: Props) {
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
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300"
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300"
      case "planned":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/40 dark:text-gray-300"
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

  return (
    <AppLayout>
      <Head title={project.name} />

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit("/client/projects")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge className={priorityColor(project.priority)}>
              {project.priority.toUpperCase()} PRIORITY
            </Badge>
            <Badge className={statusColor(project.status)}>
              {formatStatus(project.status)}
            </Badge>
          </div>
        </div>

        {/* Project Summary */}
        <Card className="border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="grid gap-6 md:grid-cols-3 py-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project ID</p>
              <p className="font-semibold">#{project.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <p className="font-semibold">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <p className="font-semibold">{formatDate(project.due_date)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description || "No description provided for this project."}
            </p>
          </CardContent>
        </Card>

        {/* Two-column Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Timeline */}
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Start</p>
                <p className="font-semibold">{formatDate(project.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Due</p>
                <p className="font-semibold">{formatDate(project.due_date)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-green-500" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={statusColor(project.status)}>
                  {formatStatus(project.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <Badge className={priorityColor(project.priority)}>
                  {project.priority.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <Card className="border border-border/50 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Activity History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <p className="text-sm text-muted-foreground">Project Created</p>
              <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">{formatDate(project.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your <span className="text-green-500 font-medium">project administrator</span> for updates or support.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
