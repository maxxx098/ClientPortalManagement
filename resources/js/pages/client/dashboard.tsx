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
  Users
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
      planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-green-500/20 text-green-400 border-green-500/30',
      on_hold: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      todo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      done: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                Hello, User 👋
              </h1>
              <p className="text-slate-400 text-sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Main Layout - 3 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Projects & Tasks */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Projects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Projects</h2>
                  <Link 
                    href="/client/projects" 
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      <FolderKanban className="w-12 h-12 opacity-50 mx-auto mb-3" />
                      <p className="text-sm">No projects yet</p>
                    </div>
                  ) : (
                    recentProjects.slice(0, 3).map((project) => (
                      <Card key={project.id}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-white text-sm line-clamp-2 flex-1">
                              {project.name}
                            </h3>
                            <button className="text-slate-500 hover:text-slate-400">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">{project.tasks_count || 0} Task</span>
                              <span className="text-slate-400">{project.progress || 0}% Progress</span>
                            </div>

                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                              <div className="text-xs text-slate-400">
                                <span className="text-slate-500">Team's Team</span>
                                <div className="text-slate-400">{project.team_members || 3} Members</div>
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="text-slate-500">Estimated Completion</span>
                                <div className="text-slate-400">{formatDate(project.due_date)}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Two Column Layout for Tasks and Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Your Task */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Your Task</h2>
                    <Link 
                      href="/client/tasks" 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {recentTasks.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <CheckSquare className="w-12 h-12 opacity-50 mx-auto mb-3" />
                        <p className="text-sm">No tasks yet</p>
                      </div>
                    ) : (
                      recentTasks.slice(0, 3).map((task) => {
                        const statusColors: Record<string, string> = {
                          'in_progress': 'bg-green-500',
                          'todo': 'bg-yellow-500',
                          'pending': 'bg-yellow-500',
                          'done': 'bg-green-500',
                          'completed': 'bg-green-500',
                          'overdue': 'bg-red-500',
                        };
                        const leftBorderColor = statusColors[task.status] || 'bg-slate-500';

                        return (
                          <Card key={task.id} className="transition-colors overflow-hidden relative">
                            <div className={`h-full w-1 ${leftBorderColor} absolute left-0 top-0 bottom-0`}></div>
                            <CardContent className="p-4 pl-5">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="font-semibold text-white text-sm flex-1">
                                  {task.title}
                                </h3>
                                <Badge className={`${getStatusColor(task.status)} border-0 text-xs px-2 py-0.5 whitespace-nowrap font-medium rounded-md`}>
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                                {task.description || `Task management for ${task.title.toLowerCase()}`}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-medium">Due Date:</span>
                                <span>
                                  {formatDate(task.due_date)}
                                </span>
                                {task.due_date && new Date(task.due_date) < new Date() && (
                                  <span className="text-red-500 ml-1">🚩</span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Statistics</h2>
                    <select className="text-xs text-slate-400 border rounded px-2 py-1">
                      <option>This month</option>
                      <option>Last month</option>
                      <option>This year</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{stats.tasks.in_progress}</div>
                        <div className="text-xs text-slate-400">Total Ongoing Task</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{stats.tasks.completed}</div>
                        <div className="text-xs text-slate-400">Total Completed Task</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-1">{stats.tasks.pending}</div>
                        <div className="text-xs text-slate-400">Total Pending Task</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm">Activity</CardTitle>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-blue-500/50 rounded-sm"></div>
                            <span className="text-slate-400">Planned</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                            <span className="text-slate-400">Completed</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-2 h-32">
                        {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((week, i) => {
                          const planned = [10, 8, 10, 8, 0];
                          const completed = [8, 10, 10, 8, 3];
                          return (
                            <div key={week} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full flex items-end justify-center gap-1 h-24">
                                <div 
                                  className="w-full bg-blue-500/30 rounded-t"
                                  style={{ height: `${(planned[i] / 12) * 100}%` }}
                                ></div>
                                <div 
                                  className="w-full bg-red-500 rounded-t"
                                  style={{ height: `${(completed[i] / 12) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500">{week}</span>
                              <span className="text-xs text-slate-600">{planned[i]}/{completed[i]} task</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Your Agenda */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">Your Agenda</CardTitle>
                    <Link 
                      href="#" 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      View all
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-10 h-10 opacity-50 mx-auto mb-2" />
                      <p className="text-xs">No upcoming events</p>
                    </div>
                  ) : (
                    upcomingDeadlines.slice(0, 3).map((project, index) => (
                      <div key={project.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-semibold text-sm">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 mb-1">
                            {formatDate(project.due_date)}
                          </div>
                          <div className="text-sm text-white font-medium mb-1 line-clamp-1">
                            {project.name}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Overall Efficiency */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base">Overall Efficiency</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">This week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-6">
                    <div className="relative w-40 h-40">
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
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 70}`}
                          strokeDashoffset={`${2 * Math.PI * 70 * (1 - taskCompletionRate / 100)}`}
                          className="text-red-500 transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-white">{Math.round(taskCompletionRate)}%</div>
                        <div className="text-xs text-slate-400">My Efficiency</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">Messages</CardTitle>
                    <Link 
                      href="#" 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      View all
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-10 h-10 opacity-50 mx-auto mb-2" />
                    <p className="text-xs">No new messages</p>
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