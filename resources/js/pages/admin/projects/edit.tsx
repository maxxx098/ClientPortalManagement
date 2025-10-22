import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "@inertiajs/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AppLayout from '@/layouts/app-layout'
import projects from "@/routes/admin/projects"
import { ArrowLeft, Save, X } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

interface Project {
  id: number
  name: string
  description: string
  status: string
  priority: string
  start_date: string
  due_date: string
  client_key_id: string
  file: string | null
}

interface Props {
  project: Project
}

export default function Edit({ project }: Props) {
  const [keys, setKeys] = useState<{id: number, key: string}[]>([])

  const { data, setData, post, processing, errors } = useForm({
    name: project.name || "",
    description: project.description || "",
    status: project.status || "planned",
    start_date: project.start_date || "",
    due_date: project.due_date || "",
    priority: project.priority || "medium",
    client_key_id: project.client_key_id || "",
    file: null as File | null,
    _method: "PUT",
  })

  useEffect(() => {
    axios.get("/admin/client-keys/list").then(res => {
      setKeys(res.data)
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(projects.update.url({ project: project.id }), {
      onSuccess: () => {
        router.visit(projects.show.url({ project: project.id }))
      },
    })
  }

  const handleCancel = () => {
    router.visit(projects.show.url({ project: project.id }))
  }

  return (
    <AppLayout>
      <Head title={`Edit ${project.name}`} />

      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit(projects.show.url({ project: project.id }))}
              className="w-fit gap-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>

            <div className="flex items-start justify-between gap-4 flex-wrap pb-6 border-b border-border/50">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
                <p className="text-muted-foreground text-sm">
                  Update project information and settings
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update the core details of your project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Client Key */}
                    <div>
                      <Label htmlFor="client_key_id">Client Key</Label>
                      <Select
                        value={data.client_key_id}
                        onValueChange={(value) => setData("client_key_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client key" />
                        </SelectTrigger>
                        <SelectContent>
                          {keys.map((key) => (
                            <SelectItem key={key.id} value={key.key}>
                              {key.key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client_key_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.client_key_id}</p>
                      )}
                    </div>

                    {/* Project Name */}
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Enter project name"
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Describe your project..."
                        rows={6}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>
                      Set the start and end dates for this project
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={data.start_date}
                          onChange={(e) => setData("start_date", e.target.value)}
                        />
                        {errors.start_date && (
                          <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={data.due_date}
                          onChange={(e) => setData("due_date", e.target.value)}
                        />
                        {errors.due_date && (
                          <p className="text-sm text-red-500 mt-1">{errors.due_date}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project File</CardTitle>
                    <CardDescription>
                      Upload or update the project file
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.file && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current file:</p>
                        <p className="text-sm font-medium break-all">{project.file.split('/').pop()}</p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="file">Upload New File (optional)</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setData("file", file)
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max file size: 10MB. Leave empty to keep current file.
                      </p>
                      {errors.file && (
                        <p className="text-sm text-red-500 mt-1">{errors.file}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status & Priority</CardTitle>
                    <CardDescription>
                      Configure project status and priority level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={data.status}
                        onValueChange={(value) => setData("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={data.priority}
                        onValueChange={(value) => setData("priority", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button 
                        type="submit" 
                        disabled={processing} 
                        className="w-full gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {processing ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full gap-2"
                        disabled={processing}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}