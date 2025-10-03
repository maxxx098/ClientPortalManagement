import { Head, usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import CreateProjectModal from "@/pages/admin/projects/modal"
import AppLayout from '@/layouts/app-layout';

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  due_date: string
}

export default function Index() {
  const { projects } = usePage().props as unknown as { projects: Project[] }
  const [open, setOpen] = useState(false)

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

  return (
    <AppLayout>
      <Head title="Projects" />

      {/* Header */}
      <div className="flex justify-between px-4 m-10 items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setOpen(true)}>+ Create Project</Button>
      </div>

      {/* Project Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-10">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition rounded-2xl border"
          >
            <CardContent className="p-6 space-y-3">
              {/* Title + Priority */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <Badge className={priorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description || "No description provided."}
              </p>

              {/* Dates */}
              <div className="flex justify-between text-xs text-gray-500">
                <p>Start: {project.start_date || "N/A"}</p>
                <p>Due: {project.due_date || "N/A"}</p>
              </div>

              {/* Status */}
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="px-2 py-1 text-xs font-medium"
                >
                  {project.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <CreateProjectModal open={open} setOpen={setOpen} />
    </AppLayout>
  )
}
