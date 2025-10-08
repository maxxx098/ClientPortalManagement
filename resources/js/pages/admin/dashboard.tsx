import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  MoreVertical,
  Key,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Briefcase,
  Plus,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface Stats {
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    on_hold: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    overdue: number;
  };
  users: {
    total: number;
    admins: number;
    staff: number;
  };
}

interface Client {
  id: number;
  key: string;
  name: string;
  email?: string;
  projects_count: number;
  tasks_count: number;
  status: string;
  created_at: string;
  last_activity?: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  priority: string;
  client_key?: {
    id: number;
    key: string;
    name: string;
  };
  due_date?: string;
  start_date?: string;
  progress?: number;
  tasks_count?: number;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  client_key?: {
    id: number;
    key: string;
    name: string;
  };
  project?: {
    id: number;
    name: string;
  };
  due_date?: string;
  created_at: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user?: string;
  timestamp: string;
}

interface Props {
  stats: Stats;
  recentClients: Client[];
  recentProjects: Project[];
  recentTasks: Task[];
  overdueTasks: Task[];
  recentActivity: RecentActivity[];
  projectsByStatus: Record<string, number>;
  tasksByStatus: Record<string, number>;
}

export default function Index({ 
  stats, 
  recentClients,
  recentProjects, 
  recentTasks,
  overdueTasks,
  recentActivity,
  projectsByStatus,
  tasksByStatus 
}: Props) {

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      planned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      on_hold: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[priority] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatRelativeTime = (date?: string) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const taskCompletionRate = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const projectCompletionRate = stats.projects.total > 0
    ? Math.round((stats.projects.completed / stats.projects.total) * 100)
    : 0;

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric' 
  });
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
  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  Hello, {stats.users.admins > 1 ? 'Admins' : 'Admin'}!
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {currentDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search here..." 
                  className="px-4 py-2.5 pl-10 border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="relative" ref={notifRef}>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 border rounded-xl hover:bg-muted transition-colors"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {recentActivity.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
                <div className="p-3 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground">Messages</h3>
                    <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                    View all
                    </Link>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {recentActivity.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Activity className="w-10 h-10 opacity-30 mx-auto mb-2" />
                        <p className="text-xs">No new messages</p>
                    </div>
                    ) : (
                    recentActivity.slice(0, 5).map((activity) => (
                        <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors"
                        >
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                            {activity.description.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium line-clamp-2">
                            {activity.description.split(' ').slice(0, 6).join(' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(activity.timestamp)}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6 bg-background">
              
              {/* Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Projects</h2>
                  <Link 
                    href="/admin/projects" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full">
                      <Card className='bg-muted/30'>
                        <CardContent className="text-center py-16 text-muted-foreground">
                          <FolderKanban className="w-16 h-16 opacity-30 mx-auto mb-4" />
                          <p className="text-sm">No projects yet</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <Card key={project.id} className='bg-muted/30'>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                {project.name}
                              </h3>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground">{project.tasks_count || 0} Tasks</span>
                                <span className="text-foreground font-semibold">{project.progress || 0}% Progress</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    (project.progress || 0) >= 75 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                      : (project.progress || 0) >= 50 
                                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                                  }`}
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            {/* Team & Completion */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div className="flex items-center gap-2">
                                {project.client_key && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-2">
                                      {[...Array(Math.min(3, Math.floor(Math.random() * 5) + 1))].map((_, i) => (
                                        <div 
                                          key={i}
                                          className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-card flex items-center justify-center text-white text-xs font-medium"
                                        >
                                          {project.client_key?.name.charAt(i).toUpperCase()}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      {Math.floor(Math.random() * 5) + 2} Members
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(project.due_date)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Your Tasks and Statistics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Your Task - Left Column */}
                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Your Task</h2>
                    <Link 
                      href="/admin/tasks" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentTasks.length === 0 ? (
                      <Card className='bg-muted/30'>
                        <CardContent className="text-center py-16 text-muted-foreground">
                          <CheckSquare className="w-16 h-16 opacity-30 mx-auto mb-4" />
                          <p className="text-sm">No tasks yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      recentTasks.slice(0, 3).map((task) => (
                        <Card key={task.id} className='bg-muted/30' >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground text-sm">
                                    {task.title}
                                  </h3>
                                  <Badge className={`${getStatusColor(task.status)} border text-[10px] px-2 py-0.5`}>
                                    {task.status === 'in_progress' ? 'Progress' : task.status === 'todo' ? 'Pending' : task.status === 'overdue' ? 'Overdue' : task.status}
                                  </Badge>
                                </div>
                                {task.client_key && (
                                  <p className="text-xs text-muted-foreground mb-3">
                                    {task.client_key.name}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Due Date: {formatDate(task.created_at)}</span>
                                  </div>
                                  {task.status === 'overdue' && (
                                    <span className="text-xs text-red-400 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Overdue
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* Statistics - Right Column */}
                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Statistics</h2>
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      This month
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>

                  <Card className="bg-muted/30 mb-6">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 gap-4 text-center">
                        <div className="pb-4 border-b border-border">
                          <div className="text-3xl font-bold text-foreground mb-1">{stats.tasks.total} Tasks</div>
                          <div className="text-xs text-muted-foreground">Total Ongoing Task</div>
                        </div>
                        <div className="pb-4 border-b border-border">
                          <div className="text-3xl font-bold text-foreground mb-1">{stats.tasks.completed} Tasks</div>
                          <div className="text-xs text-muted-foreground">Total Completed Task</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-foreground mb-1">{stats.tasks.pending} Tasks</div>
                          <div className="text-xs text-muted-foreground">Total Pending Task</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Chart */}
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-base">Activity</CardTitle>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                            <span className="text-muted-foreground">Planned</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-sm"></div>
                            <span className="text-muted-foreground">Completed</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-3 h-48">
                        {[
                          { week: 'Week 1', planned: 6, completed: 8, label: '6/8 task' },
                          { week: 'Week 2', planned: 10, completed: 10, label: '10/10 task' },
                          { week: 'Week 3', planned: 8, completed: 10, label: '8/10 task' },
                          { week: 'Week 4', planned: 8, completed: 9, label: '8/9 task' },
                          { week: 'Week 5', planned: 3, completed: 5, label: '3/5 task' }
                        ].map((data, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            <div className="w-full flex items-end justify-center gap-1 flex-1 relative">
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {data.label}
                              </div>
                              
                              <div 
                                className="w-full bg-gradient-to-t from-blue-500/80 to-blue-500 rounded-t-lg transition-all duration-300 hover:brightness-110"
                                style={{ height: `${(data.completed / 10) * 100}%`, minHeight: '20px' }}
                              ></div>
                              <div 
                                className="w-full bg-gradient-to-t from-red-500 to-orange-500 rounded-t-lg transition-all duration-300 hover:brightness-110"
                                style={{ height: `${(data.planned / 10) * 100}%`, minHeight: '20px' }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">{data.week}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6 bg-muted/30 p-6 rounded-2xl">
              
              {/* Your Agenda */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Your Agenda</h2>
                  <Link 
                    href="#" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <Card className="border-0 bg-card shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    {overdueTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 opacity-30 mx-auto mb-3" />
                        <p className="text-xs">No pending tasks</p>
                      </div>
                    ) : (
                      overdueTasks.slice(0, 3).map((task, index) => (
                        <div key={task.id} className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                              <span className="text-foreground font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {formatDate(task.created_at)}
                            </p>
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                              {task.title}
                            </h3>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Overall Efficiency */}
              <Card className="border-0 bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Overall Efficiency</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">This week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <svg className="w-full h-48" viewBox="0 0 200 120">
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="20"
                        strokeDasharray="220 440"
                        transform="rotate(-90 100 100)"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="20"
                        strokeDasharray={`${(taskCompletionRate / 100) * 220} 440`}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                      <text x="100" y="95" textAnchor="middle" className="fill-foreground text-4xl font-bold">
                        {taskCompletionRate}%
                      </text>
                      <text x="100" y="115" textAnchor="middle" className="fill-muted-foreground text-xs">
                        My Efficiency
                      </text>
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="border-0 bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Statistics</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground mb-1">{stats.tasks.total}</div>
                      <div className="text-xs text-muted-foreground">Total Tasks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground mb-1">{stats.tasks.completed}</div>
                      <div className="text-xs text-muted-foreground">Total Completed Task</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground mb-1">{stats.tasks.pending}</div>
                      <div className="text-xs text-muted-foreground">Total Pending Task</div>
                    </div>
                  </div>

                  {/* Activity Chart */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">Activity</h4>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-muted-foreground">Planned</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-muted-foreground">Completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between gap-2 h-32">
                      {[
                        { week: 'Week 1', planned: 8, completed: 6 },
                        { week: 'Week 2', planned: 6, completed: 8 },
                        { week: 'Week 3', planned: 10, completed: 10 },
                        { week: 'Week 4', planned: 8, completed: 8 },
                        { week: 'Week 5', planned: 5, completed: 3 }
                      ].map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end justify-center gap-0.5 flex-1">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500/60 to-blue-500 rounded-t"
                              style={{ height: `${(data.planned / 10) * 100}%` }}
                            ></div>
                            <div 
                              className="w-full bg-gradient-to-t from-red-500/60 to-red-500 rounded-t"
                              style={{ height: `${(data.completed / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1">{data.week}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

