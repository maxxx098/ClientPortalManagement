import { useEffect, useState } from "react";
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
  availableClientKeys: {id: number, key: string}[]
}

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
  });

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(projects.store.url(), {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
      onError: () => console.error(errors),
    });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                {availableClientKeys.map((key) => (
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
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

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

          {/* Dates */}
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

          <div>
            <Label htmlFor="file">Attach File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setData("file", file);
              }}
            />
            {errors.file && (
              <p className="text-sm text-red-500 mt-1">{errors.file}</p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={processing} className="w-full">
            {processing ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

