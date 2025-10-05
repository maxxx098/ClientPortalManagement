"use client";

import React, { useState } from "react";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import KanbanBoard from "@/components/kanbanboard";
interface Task {
  id: number;
  title: string;
  status: "todo" | "in_progress" | "done";
  client_key_id?: string;
}

interface Props {
  tasks: Task[];
  clients: { id: string; name: string }[];
  auth: { user: { role: string } };
}

export default function Index({ tasks: initialTasks, clients, auth }: Props) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_key_id: "",
  });

  const handleSubmit = () => {
    // Your post logic here using useForm from Inertia
    // post("/tasks", { onSuccess: () => { reset(); setOpen(false); }});
    console.log("Task created:", formData);
    setFormData({ title: "", description: "", client_key_id: "" });
    setOpen(false);
  };

  const updateTaskStatus = (id: number, status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    // patch(route("tasks.update", id), { status });
  };

  return (
    <AppLayout>
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your tasks efficiently
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your kanban board. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the task in detail"
                    rows={4}
                  />
                </div>

                {auth.user.role === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="client">Assign to Client</Label>
                    <Select
                      value={formData.client_key_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, client_key_id: value })
                      }
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {client.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Create Task</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board Placeholder */}
        <div className="pt-4">
          <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} />
        </div>
      </div>
    </div>
    </AppLayout>
  );
}