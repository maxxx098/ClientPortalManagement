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
  ArrowDownRight,
  ArrowDown,
  ArrowDown01Icon,
  ChevronDown,
  AlarmCheck,
  AlarmClock
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
  // Gauge configuration
  const center = 100;
  const radius = 80;
  const strokeWidth = 10;
  
  // Helper to calculate arc path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Generate tick dots
  const ticks = [];
  for (let i = 0; i <= 20; i++) {
    const angle = (i / 20) * 180;
    const pos = polarToCartesian(center, center + 30, radius - 15, angle);
    ticks.push(<circle key={i} cx={pos.x} cy={pos.y} r="0.5" fill="white" />);
  }

  // Calculate marker position based on completion rate
  const markerAngle = (taskCompletionRate / 100) * 180;
  const thumbPos = polarToCartesian(center, center + 30, radius, markerAngle);

  return (
    <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col items-center h-full">
      <h3 className="text-[11px] font-medium text-gray-500 self-start mb-6 uppercase tracking-widest">Performance Score</h3>
      
      <div className="w-full aspect-[4/3] relative flex items-center justify-center -mt-4">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Inner dots pattern */}
          {ticks}
          
          {/* Segment 1: Gold (Left) */}
          <path
            d={describeArc(center, center + 30, radius, 0, 54)}
            fill="none"
            stroke="#d97706"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Segment 2: Purple (Middle) */}
          <path
            d={describeArc(center, center + 30, radius, 66, 114)}
            fill="none"
            stroke="#a855f7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Segment 3: Blue (Right) */}
          <path
            d={describeArc(center, center + 30, radius, 126, 180)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

        </svg>
        
        <div className="absolute top-[62%] left-1/2 -translate-x-1/2 text-center">
          <span className="text-6xl font-semibold text-white tracking-tighter">{taskCompletionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full mt-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-amber-600"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Productivity</p>
          </div>
          <p className="text-xs font-bold">{stats.tasks.completed}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-purple-500"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Punctuality</p>
          </div>
          <p className="text-xs font-bold">{stats.tasks.in_progress}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="w-1 h-3 rounded-full bg-blue-500"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Creativity</p>
          </div>
          <p className="text-xs font-bold">{stats.tasks.pending}</p>
        </div>
      </div>

      <button className="mt-10 px-10 py-2 rounded-full bg-white/[0.03] border border-white/[0.04] text-[13px] font-bold text-gray-300 flex items-center justify-center gap-3 hover:bg-white/[0.07] transition-all group">
        <div className="relative flex items-center justify-center">
          {/* Spinning Dots Circle */}
          <div className="w-3 h-3 relative animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-[1px] h-[2px] bg-gray-400 rounded-full" 
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: `rotate(${i * 45}deg) translate(0, -8px)`,
                  opacity: 0.3 + (i * 0.09)
                }}
              />
            ))}
          </div>
          {/* Center Dot */}
        
        </div>
        {taskCompletionRate >= 75 ? 'Excellent Performance' : taskCompletionRate >= 50 ? 'Good Progress' : 'Keep Going'}
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

  // Work Progress Chart Component
const WorkProgressChart = () => {
  // Generate monthly data based on actual stats
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalTasks = stats.tasks.total || 100;
    const avgPerMonth = Math.max(5, Math.ceil(totalTasks / 12));
    
    return months.map((month, index) => {
      // Create wave-like pattern for success (violet) - dramatic variation
      const successWave = Math.sin(index * 0.6) * 0.6 + Math.random() * 0.3 + 0.7;
      const success = Math.max(3, Math.floor(avgPerMonth * successWave));
      
      // Create similar but slightly offset wave for failed (orange) - can overlap
      const failedWave = Math.sin(index * 0.6 + 0.5) * 0.5 + Math.random() * 0.4 + 0.5;
      const failed = Math.max(2, Math.floor(avgPerMonth * failedWave * 0.7));
      
      return { 
        name: month, 
        success, 
        failed,
        total: success + failed 
      };
    });
  };

  const [monthlyData] = useState(generateMonthlyData());

  // Calculate trend
  const lastMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const trend = prevMonth ? ((lastMonth.success - prevMonth.success) / prevMonth.success * 100).toFixed(1) : 0;

  return (
    <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 p-6 rounded-3xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-1">Work Progress Overview</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-white">{lastMonth.success}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${Number(trend) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {Number(trend) >= 0 ? '+' : ''}{trend}%
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-[10px] text-gray-400">Post Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-[10px] text-gray-400">Post Failed</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <defs>
              <linearGradient id="successGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="failedGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              vertical={false} 
              stroke="#1f2937" 
              strokeDasharray="3 3" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              dx={-10}
              domain={[0, 'auto']}
              allowDataOverflow={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0a0a0a', 
                border: '1px solid rgba(139, 92, 246, 0.3)', 
                borderRadius: '12px', 
                fontSize: '12px',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
              }}
              itemStyle={{ color: '#fff' }}
              cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            {/* Success Line with Glow */}
            <Line 
              type="monotone" 
              dataKey="success" 
              stroke="#8b5cf6" 
              strokeWidth={2.5}
              dot={{ 
                fill: '#8b5cf6', 
                strokeWidth: 2, 
                r: 3.5,
                stroke: '#0a0a0a'
              }}
              activeDot={{ 
                r: 6, 
                fill: '#8b5cf6',
                stroke: '#0a0a0a',
                strokeWidth: 2,
                filter: 'url(#glow)'
              }}
              isAnimationActive={true}
            />
            {/* Failed Line with Glow */}
            <Line 
              type="monotone" 
              dataKey="failed" 
              stroke="#fb923c" 
              strokeWidth={2.5}
              dot={{ 
                fill: '#fb923c', 
                strokeWidth: 2, 
                r: 3.5,
                stroke: '#0a0a0a'
              }}
              activeDot={{ 
                r: 6, 
                fill: '#fb923c',
                stroke: '#0a0a0a',
                strokeWidth: 2,
                filter: 'url(#glow)'
              }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
  // Stat Card Component
  const StatCard = ({ label, value, trend, isNegative, history }: any) => {
    return (
      <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-45 hover:border-yellow-500/20 transition-all group">
      <div className='mb-3'>
        <p className="text-[15px] text-gray-500 font-medium mb-2 uppercase ">{label}</p>
      </div>
        <div className="flex justify-between items-start">
          <div>
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
          <div className={`flex items-center text-[15px] font-medium ${isNegative ? 'text-red-400 border border-accent bg-red-500/20 rounded-2xl px-2 py-1' : 'text-green-400 border-accent  bg-gradient-to-br from-emerald-500/20  border rounded-2xl px-2 py-1'}`}>
            <span className="mr-1">{trend}%</span>
            {isNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          </div>
          <div className="flex items-center text-[13px] text-gray-500 uppercase">
            <span className='flex items-center gap-1'>This month <ChevronDown size={16} /></span>
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
      <header className="p-8 flex justify-between items-center ">
          <div>
            <h1 className="text-3xl font-medium flex items-center gap-3">
              Welcome back! Admin
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
            
            <button className="p-2.5 bg-green-500 text-black rounded-full hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
              <Plus size={20} />
            </button>
          </div>
        </header>

      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
          {/* Dashboard Content */}
          <div className="pl-8 pr-3 pb-8 flex flex-col gap-3 mt-3">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-3">
                <WorkProgressChart />
              </div>
              <div className="lg:col-span-1">
                <CreditScoreGauge />
              </div>
            </div>

            {/* User Tracking Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Status Tracker */}
              <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 p-5 rounded-2xl">
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
              <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 p-5 rounded-2xl hidden md:block">
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
              <div className="bg-white/[0.0] backdrop-blur-xl border border-white/5 card-bg p-8 rounded-2xl relative">
                <div className="flex justify-between items-center mb-10">
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
          <aside className="w-auto shrink-0 h-auto hidden mt-3 mr-8 xl:block bg-[#080808] border rounded-2xl border-white/5">
            <div className="p-5 flex flex-col gap-8 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase">MEETING SCHEDULE</h2>
              </div>

              {/* Date Navigation */}
              <div className="bg-[#0f0f0f] border border-white/[0.03] rounded-[2rem] p-4 flex items-center justify-between">
                <button className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-gray-300">Dec, 2024</span>
                <button className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Week Calendar */}
              <div className="flex items-center justify-between px-2">
                <button className="text-gray-600 hover:text-gray-400"><ChevronLeft size={16} /></button>
                <div className="flex gap-1">
                  {[
                    { d: 'Mon', n: 26 },
                    { d: 'Tue', n: 27 },
                    { d: 'Wed', n: 28, active: true },
                    { d: 'Thu', n: 29 },
                    { d: 'Fri', n: 30 }
                  ].map((day, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col items-center justify-center w-12 py-3 rounded-[1.5rem] transition-all ${day.active ? 'bg-[#1a1a1a]' : ''}`}
                    >
                      <span className={`text-[10px] mb-2 font-medium ${day.active ? 'text-gray-300' : 'text-gray-600'}`}>
                        {day.d}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${day.active ? 'bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500'}`}>
                        {day.n}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-gray-600 hover:text-gray-400"><ChevronRight size={16} /></button>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full bg-[#0f0f0f] border border-white/[0.03] rounded-[1.5rem] py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-white/10 text-gray-300"
                  />
                </div>
                <button className="p-3.5 bg-[#0f0f0f] rounded-[1.2rem] border border-white/[0.03] text-gray-500 hover:text-white">
                  <Filter size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 px-2">
                <button className="px-8 py-3 bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-full text-xs font-semibold text-[#0a8301] shadow-lg">
                  Meeting
                </button>
                <button className="text-xs font-semibold text-gray-600 hover:text-gray-400">Events</button>
                <button className="text-xs font-semibold text-gray-600 hover:text-gray-400">Holiday</button>
              </div>

              {/* Meeting Cards List */}
              <div className="flex flex-col gap-3 mt-2 ">
                {recentProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="group bg-gradient-to-br p-5 rounded-2xl from-white/[] via-white/[0.03] to-white/[0.05] relative">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[15px] font-bold text-gray-100 tracking-tight">{project.name}</h4>
                      <div className="flex items-center gap-1.5 text-[#11892b] bg-[#57ca04]/10 px-2.5 py-1.5 rounded-[0.8rem] transition-colors">
                        <AlarmClock size={13} className="stroke-[3]" />
                        <span className="text-[10px] font-bold tracking-wider">{formatDate(project.due_date)}</span>
                      </div>
                    </div>
                    
                    <p className="text-[12px] text-gray-600 font-medium mb-6">{formatDate(project.due_date)}</p>
                    
                    <div className="flex -space-x-2.5 mb-6">
                      {[...Array(Math.min(3, Math.floor(Math.random() * 3) + 1))].map((_, idx) => (
                        <div key={idx} className="w-7 h-7 rounded-full border-[3px] border-[#080808] bg-gradient-to-br from-red-500 to-white-500 flex items-center justify-center text-white text-[10px] font-semibold">
                          {(project.name?.charAt(idx) ?? '?').toUpperCase()}
                        </div>
                      ))}
                      <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border-[3px] border-[#080808] flex items-center justify-center text-[10px] text-gray-500 font-bold">+2</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <ExternalLink size={10} />
                        <span className="opacity-60">{project.client_key?.name || 'No client'}</span>
                      </div>
                      <div className="px-3 py-1 rounded-[0.6rem] bg-white/[0.03] text-[9px] text-gray-500 font-bold uppercase tracking-widest border border-white/5">
                        {project.status}
                      </div>
                    </div>
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