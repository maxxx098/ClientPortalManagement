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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, Label } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

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

  // Generate realistic weekly data based on actual stats
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalTasks = stats.tasks.total;
    const avgPerDay = Math.ceil(totalTasks / 7);
    
    return days.map((day, index) => {
      const variance = Math.random() * 0.4 + 0.8; // 80-120% of average
      const created = Math.max(1, Math.floor(avgPerDay * variance));
      const completed = Math.floor(created * (Math.random() * 0.3 + 0.6)); // 60-90% completion
      
      return {
        month: day,
        created,
        completed,
      };
    });
  };

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
  const [weeklyData] = useState(generateWeeklyData());

  // Chart configs
  const barChartConfig = {
    created: {
      label: "Created",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const radialChartData = [{ 
    month: "current", 
    completed: taskCompletionRate,
    pending: 100 - taskCompletionRate 
  }];

  const radialChartConfig = {
    completed: {
      label: "Completed",
      color: taskCompletionRate >= 75 ? "hsl(142, 76%, 36%)" : taskCompletionRate >= 50 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--muted))",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Task Activity Chart Component with Shadcn
  const TaskActivityChart = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-lg">Task Activity</CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-1">Last 7 days overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="created" fill="var(--color-created)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            {stats.tasks.completed > stats.tasks.pending ? 'Trending up' : 'Keep going'} <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Task creation and completion for the last week
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Efficiency Radial Chart Component with Shadcn
  const EfficiencyRadialChart = () => {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-foreground text-base">Overall Efficiency</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">This week</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={radialChartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={radialChartData}
              startAngle={90}
              endAngle={-270}
              innerRadius={80}
              outerRadius={130}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {taskCompletionRate}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 15}
                            className="fill-muted-foreground text-xs"
                          >
                            Completion Rate
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="completed"
                stackId="a"
                cornerRadius={10}
                fill="var(--color-completed)"
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="pending"
                fill="var(--color-pending)"
                stackId="a"
                cornerRadius={10}
                className="stroke-transparent stroke-2"
              />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            {taskCompletionRate >= 75 ? 'Excellent progress!' : taskCompletionRate >= 50 ? 'Good momentum' : 'Room for improvement'} <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Based on {stats.tasks.total} total tasks
          </div>
        </CardFooter>
      </Card>
    );
  };


  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  Dashboard Overview
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
                  className="relative p-2.5 border rounded-xl bg-background hover:bg-muted transition-colors"
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {recentActivity.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

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

          {/* Stats Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.projects.active} active projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasks.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.tasks.in_progress} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.tasks.pending}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.tasks.overdue} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.tasks.completed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {taskCompletionRate}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Projects Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Active Projects</h2>
                  <Link 
                    href="/admin/projects" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="text-center py-16 text-muted-foreground">
                          <FolderKanban className="w-16 h-16 opacity-30 mx-auto mb-4" />
                          <p className="text-sm pb-3.5">No projects yet</p>
                          <Link
                            href="/admin/projects"
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Create your first project
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <Card key={project.id} className='hover:bg-background/50 transition-colors cursor-pointer'>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                                {project.name}
                              </h3>
                              {project.client_key && (
                                <p className="text-xs text-muted-foreground">
                                  {project.client_key.name}
                                </p>
                              )}
                            </div>
                            <Badge className={`${getStatusColor(project.status)} border text-[10px] px-2 py-0.5 ml-2`}>
                              {project.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-muted-foreground">{project.tasks_count || 0} Tasks</span>
                                <span className="text-foreground font-semibold">{project.progress || 0}%</span>
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

                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(3, Math.floor(Math.random() * 5) + 1))].map((_, i) => (
                                  <div 
                                    key={i}
                                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-muted flex items-center justify-center text-white text-xs font-medium"
                                  >
                                    {(project.client_key?.name?.charAt(i) ?? project.name?.charAt(i) ?? '?').toUpperCase()}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(project.due_date)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Activity Chart */}
              <TaskActivityChart />
            </div>
            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1 space-y-6 ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Your Tasks</h2>
                  <Link 
                    href="/admin/tasks" 
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              {/* Your Tasks */}
              <Card className='bg-muted/30 p-6 border-0'>
                <div className="space-y-3 ">
                  {recentTasks.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12 text-muted-foreground">
                        <CheckSquare className="w-12 h-12 opacity-30 mx-auto mb-3" />
                        <p className="text-sm">No tasks yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    recentTasks.slice(0, 1).map((task) => (
                      <Card key={task.id} className='hover:bg-background/50 transition-colors cursor-pointer'>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-semibold text-foreground text-sm flex-1 line-clamp-2">
                              {task.title}
                            </h3>
                            <Badge className={`${getStatusColor(task.status)} border text-[10px] px-2 py-0.5 flex-shrink-0`}>
                              {task.status === 'in_progress' ? 'Progress' : task.status === 'todo' ? 'Pending' : task.status}
                            </Badge>
                          </div>
                          {task.client_key && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {task.client_key.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(task.created_at)}
                            </div>
                            {task.status === 'overdue' && (
                              <span className="text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

              {/* Efficiency Gauge */}
              <EfficiencyRadialChart />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}