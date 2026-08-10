import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
  FolderKanban,
  CheckSquare,
  ArrowUpRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bell,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Stats {
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}

interface Project {
  id: number;
  name: string;
  status: string;
  priority: string;
  due_date?: string;
  start_date?: string;
  tasks_count?: number;
  progress?: number;
  team_members?: number;
}

interface Task {
  id: number;
  title: string;
  status: string;
  created_at: string;
  due_date?: string;
  priority?: string;
  description?: string;
}

interface Props {
  stats: Stats;
  recentProjects: Project[];
  recentTasks: Task[];
  upcomingDeadlines: Project[];
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
}

export default function Index({
  stats,
  recentProjects,
  recentTasks,
  upcomingDeadlines,
  tasksByStatus,
  projectsByStatus,
}: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date?: string) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLabel = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const taskCompletionRate = stats.tasks.total > 0
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    if (status === "overdue") return "default";
    if (status === "completed" || status === "done") return "secondary";
    return "outline";
  };

  const getPriorityVariant = (priority: string): "default" | "outline" | "secondary" => {
    if (priority === "high") return "default";
    if (priority === "low") return "secondary";
    return "outline";
  };

  const taskStatusEntries = Object.entries(tasksByStatus || {});
  const projectStatusEntries = Object.entries(projectsByStatus || {});
  const maxTaskStatus = Math.max(1, ...taskStatusEntries.map(([, v]) => v));

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-16">
        <main className="mx-auto w-full max-w-[1500px] px-8 py-8">

          {/* Masthead */}
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {currentDate}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 rounded-none border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative border border-border p-2.5 transition-colors hover:bg-accent"
                >
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {upcomingDeadlines.length > 0 && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 bg-foreground" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 z-50 mt-3 w-80 border border-border bg-popover">
                    <div className="border-b border-border p-3">
                      <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                        Notifications
                      </h3>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {upcomingDeadlines.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          <p className="text-xs">No upcoming deadlines</p>
                        </div>
                      ) : (
                        upcomingDeadlines.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="flex items-start gap-3 border-b border-border p-3 last:border-b-0 hover:bg-accent"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-foreground bg-foreground font-mono text-xs font-bold text-background">
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-foreground">
                                {project.name}
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                Due {formatDate(project.due_date)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Total Projects</p>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{stats.projects.total}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {stats.projects.active} active
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Total Tasks</p>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{stats.tasks.total}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {stats.tasks.in_progress} in progress
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Pending Tasks</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums text-foreground">{stats.tasks.pending}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Need attention
              </p>
            </div>

            <div className="border border-border bg-foreground p-6 text-background">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-background/60">Completed</p>
                <CheckCircle2 className="h-4 w-4 text-background/60" />
              </div>
              <h3 className="font-mono text-3xl font-semibold tabular-nums">{stats.tasks.completed}</h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-background/60">
                {taskCompletionRate}% completion rate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">

            {/* Main Content */}
            <div className="space-y-3 lg:col-span-2">

              {/* Active Projects */}
              <div className="border border-border p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                    Active Projects
                    <span className="ml-3 h-px w-16 bg-border" />
                  </h2>
                  <Link
                    href="/client/projects"
                    className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    View all
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                      <FolderKanban className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No projects yet</p>
                    </div>
                  ) : (
                    recentProjects.slice(0, 4).map((project) => (
                      <div key={project.id} className="border border-border p-5 transition-colors hover:bg-accent">
                        <div className="mb-4 flex items-start justify-between">
                          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground">
                            {project.name}
                          </h3>
                        </div>
                        <Badge variant={getPriorityVariant(project.priority)} className="mb-4 rounded-none font-mono text-[9px] uppercase">
                          {project.priority}
                        </Badge>

                        <div className="space-y-3">
                          <div>
                            <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              <span>{project.tasks_count || 0} Tasks</span>
                              <span className="font-semibold text-foreground">{project.progress || 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted">
                              <div
                                className="h-full bg-foreground transition-all"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-border pt-3">
                            <Badge variant={getStatusVariant(project.status)} className="rounded-none font-mono text-[9px] uppercase">
                              {formatLabel(project.status)}
                            </Badge>
                            <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.due_date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Task Activity - real status breakdown, not a randomized chart */}
              <div className="border border-border p-8">
                <h2 className="mb-6 flex items-center font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  Tasks by Status
                  <span className="ml-3 h-px flex-1 bg-border" />
                </h2>

                {taskStatusEntries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No task data yet</p>
                ) : (
                  <div className="flex h-32 items-end gap-3">
                    {taskStatusEntries.map(([status, count]) => (
                      <div key={status} className="group relative flex-1">
                        <div
                          className="w-full bg-foreground transition-all"
                          style={{ height: `${Math.max(4, (count / maxTaskStatus) * 128)}px` }}
                          title={`${formatLabel(status)}: ${count}`}
                        />
                        <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  {taskStatusEntries.map(([status]) => (
                    <span key={status} className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatLabel(status)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 lg:col-span-1">

              {/* Your Tasks */}
              <div className="border border-border p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                    Your Tasks
                  </h2>
                  <Link
                    href="/client/tasks"
                    className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    View all
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentTasks.length === 0 ? (
                    <div className="py-12 text-center">
                      <CheckSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No tasks yet</p>
                    </div>
                  ) : (
                    recentTasks.slice(0, 4).map((task) => {
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                      return (
                        <div key={task.id} className="border border-border p-4 transition-colors hover:bg-accent">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 flex-1 text-sm font-semibold text-foreground">
                              {task.title}
                            </h3>
                            <Badge variant={getStatusVariant(task.status)} className="flex-shrink-0 rounded-none font-mono text-[9px] uppercase">
                              {formatLabel(task.status)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(task.due_date)}
                            </div>
                            {isOverdue && (
                              <span className="flex items-center gap-1 text-foreground">
                                <AlertCircle className="h-3 w-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="border border-border bg-foreground p-8 text-background">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-background/60">
                  Overall Completion
                </p>
                <h3 className="mb-4 font-mono text-4xl font-semibold tabular-nums">{taskCompletionRate}%</h3>
                <div className="h-1.5 w-full bg-background/20">
                  <div className="h-full bg-background transition-all" style={{ width: `${taskCompletionRate}%` }} />
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-background/60">
                  Based on {stats.tasks.total} total tasks
                </p>

                {projectStatusEntries.length > 0 && (
                  <div className="mt-6 space-y-2 border-t border-background/20 pt-6">
                    {projectStatusEntries.map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                        <span className="text-background/60">{formatLabel(status)}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}