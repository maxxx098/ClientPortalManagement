import { Head, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
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

// Shared mono field label
const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <Label
    htmlFor={htmlFor}
    className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
  >
    {children}
  </Label>
)

// Section block — replaces Card
const Section = ({
  index,
  title,
  description,
  children,
}: {
  index: string
  title: string
  description: string
  children: React.ReactNode
}) => (
  <div className="border border-border p-6">
    <div className="mb-6 flex items-baseline gap-3 border-b border-border pb-4">
      <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
)

export default function Edit({ project }: Props) {
  const [keys, setKeys] = useState<{ id: number; key: string }[]>([])

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
    axios.get("/admin/client-keys/list").then((res) => setKeys(res.data))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(projects.update.url({ project: project.id }), {
      onSuccess: () => router.visit(projects.show.url({ project: project.id })),
    })
  }

  const handleCancel = () => router.visit(projects.show.url({ project: project.id }))

  return (
    <AppLayout>
      <Head title={`Edit ${project.name}`} />

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1400px] p-6 lg:p-8 space-y-6">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.visit(projects.show.url({ project: project.id }))}
              className="w-fit gap-2 rounded-none hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>

            <div className="border-b border-border pb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Project #{project.id}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Edit Project</h1>
              <p className="mt-1 text-sm text-muted-foreground">Update project information and settings</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <Section index="01" title="Basic Information" description="Update the core details of your project">
                  <div>
                    <FieldLabel htmlFor="client_key_id">Client Key</FieldLabel>
                    <Select value={data.client_key_id} onValueChange={(value) => setData("client_key_id", value)}>
                      <SelectTrigger className="rounded-none border-border font-mono text-xs">
                        <SelectValue placeholder="Select a client key" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {keys.map((key) => (
                          <SelectItem key={key.id} value={key.key} className="font-mono text-xs">
                            {key.key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.client_key_id && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.client_key_id}</p>}
                  </div>

                  <div>
                    <FieldLabel htmlFor="name">Project Name</FieldLabel>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                      placeholder="Enter project name"
                      className="rounded-none border-border"
                      required
                    />
                    {errors.name && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.name}</p>}
                  </div>

                  <div>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      placeholder="Describe your project..."
                      rows={6}
                      className="rounded-none border-border"
                    />
                    {errors.description && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.description}</p>}
                  </div>
                </Section>

                <Section index="02" title="Project Timeline" description="Set the start and end dates for this project">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                      <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData("start_date", e.target.value)}
                        className="rounded-none border-border font-mono text-xs"
                      />
                      {errors.start_date && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.start_date}</p>}
                    </div>
                    <div>
                      <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                      <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData("due_date", e.target.value)}
                        className="rounded-none border-border font-mono text-xs"
                      />
                      {errors.due_date && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.due_date}</p>}
                    </div>
                  </div>
                </Section>

                <Section index="03" title="Project File" description="Upload or update the project file">
                  {project.file && (
                    <div className="border border-border p-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current file</p>
                      <p className="mt-1 break-all text-sm font-medium text-foreground">{project.file.split('/').pop()}</p>
                    </div>
                  )}
                  <div>
                    <FieldLabel htmlFor="file">Upload New File (optional)</FieldLabel>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setData("file", file)
                      }}
                      className="rounded-none border-border font-mono text-xs file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:uppercase file:tracking-widest file:text-background"
                    />
                    <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                      Max file size: 10MB. Leave empty to keep current file.
                    </p>
                    {errors.file && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.file}</p>}
                  </div>
                </Section>
              </div>

              <div className="space-y-3">
                <Section index="04" title="Status & Priority" description="Configure project status and priority level">
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <Select value={data.status} onValueChange={(value) => setData("status", value)}>
                      <SelectTrigger className="rounded-none border-border font-mono text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="planned" className="font-mono text-xs">Planned</SelectItem>
                        <SelectItem value="in_progress" className="font-mono text-xs">In Progress</SelectItem>
                        <SelectItem value="on_hold" className="font-mono text-xs">On Hold</SelectItem>
                        <SelectItem value="completed" className="font-mono text-xs">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.status}</p>}
                  </div>

                  <div>
                    <FieldLabel>Priority</FieldLabel>
                    <Select value={data.priority} onValueChange={(value) => setData("priority", value)}>
                      <SelectTrigger className="rounded-none border-border font-mono text-xs">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="low" className="font-mono text-xs">Low</SelectItem>
                        <SelectItem value="medium" className="font-mono text-xs">Medium</SelectItem>
                        <SelectItem value="high" className="font-mono text-xs">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.priority}</p>}
                  </div>
                </Section>

                <div className="border border-border bg-muted/30 p-6">
                  <div className="space-y-3">
                    <Button type="submit" disabled={processing} className="w-full gap-2 rounded-none">
                      <Save className="h-4 w-4" />
                      {processing ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full gap-2 rounded-none"
                      disabled={processing}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}