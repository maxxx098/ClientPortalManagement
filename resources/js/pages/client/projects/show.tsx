"use client"

import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AppLayout from "@/layouts/app-layout"
import { ArrowLeft, Calendar, Clock, FileText, Info, Tag, TrendingUp } from "lucide-react"

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
        return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400"
      case "low":
        return "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
    }
  }

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400"
      case "in_progress":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
      case "on_hold":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400"
      case "planned":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400"
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

      <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.visit("/client/projects")}
            className="w-fit gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
              </div>
              <p className="text-sm text-muted-foreground">Project ID: #{project.id}</p>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <Badge variant="outline" className={statusColor(project.status)}>
                {formatStatus(project.status)}
              </Badge>
              <Badge variant="outline" className={priorityColor(project.priority)}>
                {project.priority.toUpperCase()} Priority
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <CardTitle>Project Description</CardTitle>
                </div>
                <CardDescription>Overview and objectives of this project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {project.description || "No description provided for this project."}
                </p>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <CardTitle>Project Timeline</CardTitle>
                </div>
                <CardDescription>Start and end dates for this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Start Date
                    </div>
                    <p className="text-lg font-semibold">{formatDate(project.start_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      Due Date
                    </div>
                    <p className="text-lg font-semibold">{formatDate(project.due_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity History Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <CardTitle>Activity History</CardTitle>
                </div>
                <CardDescription>Key timestamps for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Project Created</p>
                    <p className="text-xs text-muted-foreground">Initial project setup</p>
                  </div>
                  <p className="text-sm font-semibold">{formatDate(project.created_at)}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">Most recent modification</p>
                  </div>
                  <p className="text-sm font-semibold">{formatDate(project.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Project Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Project Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Status</p>
                  <Badge variant="outline" className={`${statusColor(project.status)} text-sm py-1 px-3`}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority Level</p>
                  <Badge variant="outline" className={`${priorityColor(project.priority)} text-sm py-1 px-3`}>
                    {project.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Project ID</span>
                  <span className="font-mono font-semibold">#{project.id}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Client Key</span>
                  <span className="font-mono text-xs">{project.client_key_id || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Need Assistance?</p>
                    <p className="text-xs text-muted-foreground">
                      Contact your project administrator for updates or support
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}