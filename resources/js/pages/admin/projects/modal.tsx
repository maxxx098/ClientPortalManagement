import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useForm } from "@inertiajs/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import projects from "@/routes/admin/projects"

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  availableClientKeys: { id: number; key: string }[]
}

// Shared mono field label — matches the ledger label treatment used across the app
const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <Label
    htmlFor={htmlFor}
    className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
  >
    {children}
  </Label>
)

export default function CreateProjectModal({ open, setOpen, availableClientKeys }: Props) {
  const { data, setData, post, processing, reset, errors } = useForm({
    client_key_id: "",
    name: "",
    description: "",
    status: "planned",
    start_date: "",
    file: null as File | null,
    due_date: "",
    priority: "medium",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(projects.store.url(), {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
      onError: () => console.error(errors),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-none border-border sm:max-w-lg">
        <DialogHeader className="border-b border-border pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">New Entry</p>
          <DialogTitle className="text-xl font-semibold tracking-tight">Create Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel htmlFor="client_key_id">Client Key</FieldLabel>
            <Select value={data.client_key_id} onValueChange={(value) => setData("client_key_id", value)}>
              <SelectTrigger className="rounded-none border-border font-mono text-xs">
                <SelectValue placeholder="Select a client key" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {availableClientKeys.map((key) => (
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
              className="rounded-none border-border"
            />
            {errors.description && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.description}</p>}
          </div>

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

          <div>
            <FieldLabel htmlFor="file">Attach File</FieldLabel>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setData("file", file)
              }}
              className="rounded-none border-border font-mono text-xs file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:uppercase file:tracking-widest file:text-background"
            />
            {errors.file && <p className="mt-1 font-mono text-[11px] text-destructive">{errors.file}</p>}
          </div>

          <Button type="submit" disabled={processing} className="w-full rounded-none">
            {processing ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}