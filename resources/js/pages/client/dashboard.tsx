import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Activity,
  BarChart3,
  MoreVertical,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  projectsByStatus 
}: Props) {

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      in_progress: 'bg-red-500/10 text-red-400 border-red-500/20',
      on_hold: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      completed: 'bg-red-500/10 text-red-400 border-red-500/20',
      todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      done: 'bg-red-500/10 text-red-400 border-red-500/20',
      pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      overdue: 'bg-slate-600/10 text-slate-400 border-slate-600/20',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      medium: 'bg-slate-600/10 text-slate-300 border-slate-600/20',
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[priority] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const taskCompletionRate = stats.tasks.total > 0 
    ? (stats.tasks.completed / stats.tasks.total) * 100 
    : 0;

  const projectCompletionRate = stats.projects.total > 0
    ? (stats.projects.completed / stats.projects.total) * 100
    : 0;

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="container mx-auto p-6 max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, User 👋
                </h1>
                <p className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl px-5 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <FolderKanban className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Active Projects</div>
                      <div className="text-2xl font-bold text-white">{stats.projects.active}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl px-5 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Completion Rate</div>
                      <div className="text-2xl font-bold text-white">{Math.round(taskCompletionRate)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column - Main Content (2 cols) */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Active Projects</h2>
                    <p className="text-sm text-slate-400">Track your ongoing work</p>
                  </div>
                  <Link 
                    href="/client/projects" 
                    className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors group"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                            <FolderKanban className="w-8 h-8 text-slate-600" />
                          </div>
                          <h3 className="text-white font-medium mb-1">No projects yet</h3>
                          <p className="text-sm text-slate-500 mb-4">Start by creating your first project</p>
                          <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                            Create Project
                          </button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    recentProjects.slice(0, 4).map((project) => (
                      <Card key={project.id} className='bg-muted/30'>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-base mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                                {project.name}
                              </h3>
                              <Badge className={`${getPriorityColor(project.priority)} border text-xs px-2 py-0.5 font-medium`}>
                                {project.priority}
                              </Badge>
                            </div>
                            <button className="text-slate-500 hover:text-slate-300 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {project.tasks_count || 0} Tasks
                              </span>
                              <span className="text-red-400 font-semibold">
                                {project.progress || 0}% Complete
                              </span>
                            </div>

                            <div className="relative">
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700 ease-out"
                                  style={{ width: `${project.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <span className="text-xs text-slate-400">{project.team_members || 3}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
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

              {/* Recent Tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                    <p className="text-sm text-slate-400">Your latest assignments</p>
                  </div>
                  <Link 
                    href="/client/tasks" 
                    className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors group"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-3 grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentTasks.length === 0 ? (
                    <Card className='bg-muted/30'>
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                          <CheckSquare className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-white font-medium mb-1">No tasks assigned</h3>
                        <p className="text-sm text-slate-500">Tasks will appear here once assigned</p>
                      </CardContent>
                    </Card>
                  ) : (
                    recentTasks.slice(0, 5).map((task) => {
                      const statusColors: Record<string, string> = {
                        'in_progress': 'from-red-500 to-red-600',
                        'todo': 'from-slate-500 to-slate-600',
                        'pending': 'from-slate-500 to-slate-600',
                        'done': 'from-red-500 to-red-600',
                        'completed': 'from-red-500 to-red-600',
                        'overdue': 'from-slate-600 to-slate-700',
                      };
                      const gradientColor = statusColors[task.status] || 'from-slate-500 to-slate-600';
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date();

                      return (
                        <Card key={task.id} className='border-0 bg-muted/30 shadow-sm'>
                          <div className={`h-1 w-full bg-gradient-to-r ${gradientColor}`}></div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className="font-semibold text-white text-sm flex-1 group-hover:text-red-400 transition-colors">
                                {task.title}
                              </h3>
                              <Badge className={`${getStatusColor(task.status)} border text-xs px-2 py-0.5 whitespace-nowrap font-medium`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                              {task.description || `Task management for ${task.title.toLowerCase()}`}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(task.due_date)}</span>
                              </div>
                              {isOverdue && (
                                <Badge className="bg-slate-600/10 text-slate-400 border-slate-600/20 text-xs px-2 py-0.5">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Activity Chart */}
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">Weekly Activity</CardTitle>
                      <CardDescription className="text-slate-400 text-sm">Task completion trends</CardDescription>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-700 rounded"></div>
                        <span className="text-slate-400">Planned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-slate-400">Completed</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-3 h-48 px-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                      const planned = [10, 8, 12, 8, 6];
                      const completed = [8, 10, 10, 8, 5];
                      const maxValue = 15;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-3 group">
                          <div className="w-full flex items-end justify-center gap-2 h-40">
                            <div className="relative w-full">
                              <div 
                                className="w-full bg-slate-700/40 rounded-t-lg transition-all duration-500 group-hover:bg-slate-700/60"
                                style={{ height: `${(planned[i] / maxValue) * 100}%` }}
                              ></div>
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {planned[i]}
                              </div>
                            </div>
                            <div className="relative w-full">
                              <div 
                                className="w-full bg-red-500 rounded-t-lg transition-all duration-500 group-hover:shadow-lg group-hover:shadow-red-500/20"
                                style={{ height: `${(completed[i] / maxValue) * 100}%` }}
                              ></div>
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                {completed[i]}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{day}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar (1 col) */}
            <div className="xl:col-span-1 bg-muted/30 p-6 rounded-2xl space-y-6">
              
              {/* Performance Card */}
              <Card className="border-0 bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">Performance</CardTitle>
                      <CardDescription className="text-slate-400 text-sm">This week's efficiency</CardDescription>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center py-6">
                    <div className="relative w-40 h-40 mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-800"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="url(#gradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - taskCompletionRate / 100)}`}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-bold text-white mb-1">{Math.round(taskCompletionRate)}%</div>
                        <div className="text-xs text-slate-400">Completion</div>
                      </div>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Total</div>
                        <div className="text-lg font-bold text-white">{stats.tasks.total}</div>
                      </div>
                      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-xs text-red-400 mb-1">Done</div>
                        <div className="text-lg font-bold text-white">{stats.tasks.completed}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Stats */}
              <div className="space-y-3">
                <Card className="border-0 bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">In Progress</div>
                        <div className="text-2xl font-bold text-white">{stats.tasks.in_progress}</div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <Activity className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Completed</div>
                        <div className="text-2xl font-bold text-white">{stats.tasks.completed}</div>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <CheckSquare className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-card shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Pending</div>
                        <div className="text-2xl font-bold text-white">{stats.tasks.pending}</div>
                      </div>
                      <div className="p-3 bg-slate-700/40 rounded-lg">
                        <Clock className="w-6 h-6 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Deadlines */}
              <Card className="border-0 bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">Upcoming</CardTitle>
                      <CardDescription className="text-slate-400 text-sm">Deadlines & events</CardDescription>
                    </div>
                    <Link 
                      href="#" 
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      View all
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto mb-3">
                        <Calendar className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-500">No upcoming deadlines</p>
                    </div>
                  ) : (
                    upcomingDeadlines.slice(0, 4).map((project, index) => (
                      <div key={project.id} className="flex gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <span className="text-white font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium mb-1 line-clamp-2 group-hover:text-red-400 transition-colors">
                            {project.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(project.due_date)}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}