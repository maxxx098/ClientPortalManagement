"use client";
import React, { useEffect, useState } from "react";
import KanbanBoard from "@/components/kanbanboard";
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface Task {
    id: number;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    client_key_id?: string;
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    useEffect(() => {
        fetch('/api/tasks')
            .then((response) => response.json())
            .then((data) => setTasks(data))
            .catch((error) => console.error('Error fetching tasks:', error));
    }, []);

   const updateTaskStatus = (id: number, status: Task['status']) => {
  setTasks((prev) =>
    prev.map((t) => (t.id === id ? { ...t, status } : t))
  );

  fetch(`/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
    },
    body: JSON.stringify({ status }),
  }).catch((error) => console.error('Error updating task status:', error));
};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} />
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
