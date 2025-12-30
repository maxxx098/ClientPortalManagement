import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  FolderKanban, 
  CheckSquare, 
  Calendar,
  ArrowUpRight,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Bell,
  Search,
  Download,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink,
  MessageSquare,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Generate weekly data based on actual stats
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalTasks = stats.tasks.total;
    const avgPerDay = Math.ceil(totalTasks / 7);
    
    return days.map((day, index) => {
      const variance = Math.random() * 0.4 + 0.8;
      const success = Math.max(1, Math.floor(avgPerDay * variance));
      const failed = Math.floor(success * (Math.random() * 0.3 + 0.2));
      
      return { name: day, success, failed };
    });
  };

  const [weeklyData] = useState(generateWeeklyData());

  const taskCompletionRate = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      planned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      on_hold: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      todo: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric' 
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Credit Score Gauge Component
  const CreditScoreGauge = () => {
    const data = [
      { name: 'Progress', value: taskCompletionRate },
      { name: 'Remaining', value: 100 - taskCompletionRate }
    ];

    return (
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col items-center h-full">
        <h3 className="text-xs font-semibold text-gray-400 self-start mb-4 uppercase tracking-wider">Performance Score</h3>
        
        <div className="w-full h-40 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="80%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#a855f7" />
                <Cell fill="#1f2937" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-0 text-center">
            <span className="text-4xl font-bold block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{taskCompletionRate}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full mt-6">
          <div className="text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mx-auto mb-2"></div>
            <p className="text-[10px] text-gray-400">Completed</p>
            <p className="text-xs font-bold">{stats.tasks.completed}</p>
          </div>
          <div className="text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mb-2"></div>
            <p className="text-[10px] text-gray-400">In Progress</p>
            <p className="text-xs font-bold">{stats.tasks.in_progress}</p>
          </div>
          <div className="text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mx-auto mb-2"></div>
            <p className="text-[10px] text-gray-400">Pending</p>
            <p className="text-xs font-bold">{stats.tasks.pending}</p>
          </div>
        </div>

        <button className="mt-6 px-4 py-2 rounded-full border border-white/10 text-[10px] flex items-center gap-2 hover:bg-white/5 transition-colors">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          {taskCompletionRate >= 75 ? 'Excellent Performance' : taskCompletionRate >= 50 ? 'Good Progress' : 'Keep Going'}
        </button>
      </div>
    );
  };

  // Work Progress Chart Component
  const WorkProgressChart = () => {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 rounded-3xl h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-semibold text-gray-200">Work Progress Overview</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-[10px] text-gray-400">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <span className="text-[10px] text-gray-400">Failed</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopOpacity={0.3}/>
                  <stop offset="95%"  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorSuccess)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stroke="#fb923c" 
                fillOpacity={1} 
                fill="url(#colorFailed)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Stat Card Component
  const StatCard = ({ label, value, trend, isNegative, history }: any) => {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-40 hover:border-yellow-500/20 transition-all group">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 tracking-wider mb-2 uppercase">{label}</p>
            <h2 className="text-3xl font-bold text-white">{value}</h2>
          </div>
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isNegative ? "#ef4444" : "#22c55e"} 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className={`flex items-center text-xs font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
            <span className="mr-1">{trend}%</span>
            {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          </div>
          <div className="flex items-center text-[10px] text-gray-500 uppercase">
            <span>This month</span>
          </div>
        </div>
      </div>
    );
  };

  // Generate stat history data
  const generateStatHistory = (baseValue: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + Math.floor(Math.random() * 10) - 5
    }));
  };

  return (
    <AppLayout>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
          {/* Header */}
          <header className="p-8 flex justify-between items-center border-b border-white/5">
            <div>
              <h1 className="text-3xl font-medium flex items-center gap-3">
                Welcome back! 
              </h1>
              <p className="text-xs text-gray-500 mt-1">{currentDate}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/30 w-64 transition-all"
                />
              </div>
              
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Bell size={20} className="text-gray-400" />
                  {recentActivity.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      <Link href="#" className="text-xs text-gray-400 hover:text-white">
                        View all
                      </Link>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="w-10 h-10 opacity-30 mx-auto mb-2" />
                          <p className="text-xs">No new notifications</p>
                        </div>
                      ) : (
                        recentActivity.slice(0, 5).map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                                {activity.description.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium line-clamp-2">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
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

              <Link 
                href="/admin/projects" 
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm">Schedule</span>
              </Link>
              
              <button className="p-2.5 bg-yellow-500 text-black rounded-full hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
                <Plus size={20} />
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="px-8 pb-8 flex flex-col gap-6 mt-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard 
                label="Total Projects" 
                value={stats.projects.total} 
                trend={12} 
                isNegative={false}
                history={generateStatHistory(stats.projects.total)}
              />
              <StatCard 
                label="Active Tasks" 
                value={stats.tasks.in_progress} 
                trend={8} 
                isNegative={false}
                history={generateStatHistory(stats.tasks.in_progress)}
              />
              <StatCard 
                label="Completed" 
                value={stats.tasks.completed} 
                trend={15} 
                isNegative={false}
                history={generateStatHistory(stats.tasks.completed)}
              />
              <StatCard 
                label="Overdue" 
                value={stats.tasks.overdue} 
                trend={-5} 
                isNegative={true}
                history={generateStatHistory(stats.tasks.overdue)}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WorkProgressChart />
              </div>
              <div className="lg:col-span-1">
                <CreditScoreGauge />
              </div>
            </div>

            {/* Projects & Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projects - 2 columns */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Active Projects</h2>
                  <Link 
                    href="/admin/projects" 
                    className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProjects.length === 0 ? (
                    <div className="col-span-full bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
                      <FolderKanban className="w-16 h-16 opacity-20 mx-auto mb-4 text-gray-500" />
                      <p className="text-sm text-gray-500 mb-4">No projects yet</p>
                      <Link
                        href="/admin/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Create your first project
                      </Link>
                    </div>
                  ) : (
                    recentProjects.map((project) => (
                      <div key={project.id} className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl hover:border-yellow-500/20 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">
                              {project.name}
                            </h3>
                            {project.client_key && (
                              <p className="text-xs text-gray-500">
                                {project.client_key.name}
                              </p>
                            )}
                          </div>
                          <span className={`${getStatusColor(project.status)} border text-[10px] px-2 py-1 rounded-full ml-2 uppercase tracking-wider font-medium`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <span className="text-gray-500">{project.tasks_count || 0} Tasks</span>
                              <span className="text-white font-semibold">{project.progress || 0}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  (project.progress || 0) >= 75 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                    : (project.progress || 0) >= 50 
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                                }`}
                                style={{ width: `${project.progress || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex -space-x-2">
                              {[...Array(Math.min(3, Math.floor(Math.random() * 5) + 1))].map((_, i) => (
                                <div 
                                  key={i}
                                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[#050505] flex items-center justify-center text-white text-xs font-medium"
                                >
                                  {(project.client_key?.name?.charAt(i) ?? project.name?.charAt(i) ?? '?').toUpperCase()}
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(project.due_date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tasks Sidebar - 1 column */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                  <Link 
                    href="/admin/tasks" 
                    className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl space-y-4">
                  {recentTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="w-12 h-12 opacity-20 mx-auto mb-3 text-gray-500" />
                      <p className="text-sm text-gray-500">No tasks yet</p>
                    </div>
                  ) : (
                    recentTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl hover:border-yellow-500/20 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-semibold text-white text-sm flex-1 line-clamp-2">
                            {task.title}
                          </h3>
                          <span className={`${getStatusColor(task.status)} border text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wider font-medium`}>
                            {task.status === 'in_progress' ? 'Progress' : task.status === 'todo' ? 'Pending' : task.status}
                          </span>
                        </div>
                        {task.client_key && (
                          <p className="text-xs text-gray-500 mb-2">
                            {task.client_key.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* User Tracking Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Tracker */}
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4 tracking-wider">Status Tracker</h3>
                <div className="flex flex-col gap-4">
                  {recentClients.slice(0, 4).map(client => (
                    <div key={client.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {(client.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${client.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'} border-2 border-[#050505] rounded-full`}></div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{client.name}</p>
                          <p className="text-[10px] text-gray-500">{client.projects_count} projects</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium">{formatRelativeTime(client.last_activity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pulse Monitor */}
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl hidden md:block">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-4 tracking-wider">Pulse Monitor</h3>
                <div className="flex flex-col gap-4">
                  {recentClients.slice(0, 4).map(client => (
                    <div key={client.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-gray-400">
                            {(client.name || '?').charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{client.name}</p>
                          <p className="text-[10px] text-gray-500">Operations</p>
                        </div>
                      </div>
                      <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-yellow-500/50"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Tasks Summary */}
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Tasks</h3>
                  <button className="p-1 hover:bg-white/5 rounded-full"><Plus size={16} className="text-gray-400" /></button>
                </div>
                <div className="flex flex-col gap-5">
                  {recentTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex flex-col gap-2 relative">
                      <h4 className="text-xs font-bold leading-tight text-white">{task.title}</h4>
                      <p className="text-[10px] text-gray-500">{task.client_key?.name || 'No client'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2">
                          <span className="text-[8px] text-gray-400">{formatDate(task.created_at)}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <button className="text-[10px] text-gray-400 flex items-center gap-1 hover:text-white">
                          {task.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Meeting Schedule */}
        <aside className="w-[320px] shrink-0 h-screen hidden xl:block border-l border-white/5 bg-[#0a0a0a]">
          <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">MEETING SCHEDULE</h2>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4">
                <button className="p-1 hover:bg-white/5 rounded-full"><ChevronLeft size={16}/></button>
                <span className="text-sm font-medium">Dec, 2024</span>
                <button className="p-1 hover:bg-white/5 rounded-full"><ChevronRight size={16}/></button>
              </div>
              <div className="flex justify-between px-2">
                {[ {d:'Mon', n:26}, {d:'Tue', n:27}, {d:'Wed', n:28, active: true}, {d:'Thu', n:29}, {d:'Fri', n:30} ].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">{day.d}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${day.active ? 'bg-white/10 ring-1 ring-yellow-500/50 text-white shadow-lg shadow-yellow-500/20' : 'text-gray-400'}`}>
                      {day.n}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <button className="p-2 bg-white/5 rounded-full border border-white/10">
                <Filter size={14} className="text-gray-400" />
              </button>
            </div>

            <div className="flex bg-white/5 rounded-full p-1 text-[10px] font-medium">
              <button className="flex-1 py-2 bg-yellow-500/20 text-yellow-500 rounded-full">Meeting</button>
              <button className="flex-1 py-2 text-gray-500">Events</button>
              <button className="flex-1 py-2 text-gray-500">Holiday</button>
            </div>

            <div className="flex flex-col gap-4">
              {recentProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="relative group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-white">{project.name}</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Clock size={12} />
                      <span className="text-[10px]">Soon</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">{formatDate(project.due_date)}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, Math.floor(Math.random() * 3) + 1))].map((_, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                          {(project.name?.charAt(idx) ?? '?').toUpperCase()}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#0a0a0a] flex items-center justify-center text-[8px]">+2</div>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-white/5 text-[8px] text-gray-400 uppercase tracking-widest border border-white/10">
                      {project.status}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
                    <ExternalLink size={10} />
                    <span>{project.client_key?.name || 'No client'}</span>
                  </div>
                  <div className="mt-4 border-b border-white/5 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Floating Chat Trigger */}
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-yellow-500 hover:scale-110 transition-transform xl:hidden z-50 shadow-lg shadow-yellow-500/20">
          <MessageSquare size={24} />
        </button>
      </div>
    </AppLayout>
  );
}