import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  AlarmClock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Stats {
  clients: { total: number; active: number; inactive: number };
  projects: { total: number; active: number; completed: number; on_hold: number };
  tasks: { total: number; pending: number; in_progress: number; completed: number; overdue: number };
  users: { total: number; admins: number; staff: number };
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
  client_key?: { id: number; key: string; name: string };
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
  client_key?: { id: number; key: string; name: string };
  project?: { id: number; name: string };
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

export default function Index({ stats, recentClients, recentProjects, recentTasks }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalTasks = stats.tasks.total || 100;
    const avgPerMonth = Math.max(5, Math.ceil(totalTasks / 12));
    return months.map((month, index) => {
      const successWave = Math.sin(index * 0.6) * 0.6 + Math.random() * 0.3 + 0.7;
      const success = Math.max(3, Math.floor(avgPerMonth * successWave));
      const failedWave = Math.sin(index * 0.6 + 0.5) * 0.5 + Math.random() * 0.4 + 0.5;
      const failed = Math.max(2, Math.floor(avgPerMonth * failedWave * 0.7));
      return { name: month, success, failed };
    });
  };
  const [monthlyData] = useState(generateMonthlyData());
  const lastMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const monthlyTrend = prevMonth
    ? (((lastMonth.success - prevMonth.success) / prevMonth.success) * 100).toFixed(1)
    : '0';

  const taskCompletionRate =
    stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0;

  const formatDate = (date?: string) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- Ledger row stat (replaces bubble stat cards) ----------
  const LedgerStat = ({
    index,
    label,
    value,
    trend,
    isNegative,
  }: {
    index: string;
    label: string;
    value: number;
    trend: number;
    isNegative: boolean;
  }) => (
    <div className="flex items-baseline justify-between border-b border-border py-5 first:pt-0 last:border-b-0">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] text-muted-foreground">{index}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span
          className={`flex items-center gap-1 font-mono text-[11px] ${
            isNegative ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {isNegative ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}
          {trend}%
        </span>
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {String(value).padStart(2, '0')}
        </span>
      </div>
    </div>
  );

  // ---------- Tick-mark ruler meter (signature element, replaces circular gauge) ----------
  const RulerMeter = () => {
    const totalTicks = 40;
    const filledTicks = Math.round((taskCompletionRate / 100) * totalTicks);

    return (
      <div className="flex h-full flex-col border border-border p-6">
        <div className="mb-8 flex items-baseline justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Completion Rate
          </h3>
          <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
            {taskCompletionRate}
            <span className="text-base text-muted-foreground">%</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="flex h-16 items-end gap-[3px]">
            {Array.from({ length: totalTicks }).map((_, i) => {
              const filled = i < filledTicks;
              const major = i % 5 === 0;
              return (
                <div
                  key={i}
                  className={`flex-1 ${major ? 'h-full' : 'h-2/3'} ${filled ? 'bg-foreground' : 'bg-border'}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <Separator className="my-6 bg-border" />

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Done', value: stats.tasks.completed },
            { label: 'Active', value: stats.tasks.in_progress },
            { label: 'Queued', value: stats.tasks.pending },
          ].map((item) => (
            <div key={item.label}>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {item.label}
              </p>
              <p className="font-mono text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------- Trend chart (kept, restyled flat) ----------
  const TrendChart = () => (
    <div className="flex h-full flex-col border border-border p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Monthly Throughput
          </h3>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
              {lastMonth.success}
            </span>
            <span
              className={`flex items-center gap-1 font-mono text-[11px] ${
                Number(monthlyTrend) >= 0 ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {Number(monthlyTrend) >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {Number(monthlyTrend) >= 0 ? '+' : ''}
              {monthlyTrend}%
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-[2px] w-3 bg-foreground" /> completed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-[2px] w-3 border-t border-dashed border-muted-foreground" /> failed
          </span>
        </div>
      </div>

      <div className="min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 0,
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'hsl(var(--popover-foreground))',
              }}
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line
              type="linear"
              dataKey="success"
              stroke="hsl(var(--foreground))"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--foreground))', stroke: 'hsl(var(--background))', strokeWidth: 1 }}
            />
            <Line
              type="linear"
              dataKey="failed"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--muted-foreground))', stroke: 'hsl(var(--background))', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="flex min-h-screen w-full overflow-hidden bg-background font-sans">
        <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
          {/* Masthead — replaces the promo banner with an actual status line */}
          <div className="border-b border-border pl-8 pr-3 pt-6 pb-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {today}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Operations Overview</h1>
              </div>
              <div className="flex gap-8 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <span>
                  Clients&nbsp;
                  <span className="text-foreground">{String(stats.clients.total).padStart(2, '0')}</span>
                </span>
                <span>
                  Projects&nbsp;
                  <span className="text-foreground">{String(stats.projects.total).padStart(2, '0')}</span>
                </span>
                <span>
                  Overdue&nbsp;
                  <span className="text-foreground">{String(stats.tasks.overdue).padStart(2, '0')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pl-8 pr-3 py-6">
            {/* Stat ledger + charts */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div className="border border-border p-6 lg:col-span-1">
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  This Month
                </h3>
                <LedgerStat index="01" label="Projects" value={stats.projects.total} trend={12} isNegative={false} />
                <LedgerStat index="02" label="Completed" value={stats.tasks.completed} trend={15} isNegative={false} />
                <LedgerStat index="03" label="Overdue" value={stats.tasks.overdue} trend={-5} isNegative={true} />
              </div>
              <div className="lg:col-span-1">
                <RulerMeter />
              </div>
              <div className="lg:col-span-1">
                <TrendChart />
              </div>
            </div>

            {/* Tracking rows */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Status Tracker */}
              <div className="border border-border p-6">
                <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Client Status
                </h3>
                <div className="flex flex-col">
                  {recentClients.slice(0, 4).map((client, i) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Avatar className="h-7 w-7 rounded-none border border-border">
                          <AvatarFallback className="rounded-none bg-foreground text-[10px] font-semibold text-background">
                            {(client.name || '?').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-foreground">{client.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {client.projects_count} projects
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 ${client.status === 'active' ? 'bg-foreground' : 'bg-border'}`}
                        />
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatRelativeTime(client.last_activity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pulse Monitor */}
              <div className="hidden border border-border p-6 md:block">
                <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  Pulse Monitor
                </h3>
                <div className="flex flex-col">
                  {recentClients.slice(0, 4).map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">{client.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">Operations</p>
                      </div>
                      <div className="h-[3px] w-14 bg-border">
                        <div className="h-full w-1/2 bg-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tasks — numbering is real here: it's a priority queue */}
              <div className="border border-border p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Task Queue
                  </h3>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-none">
                    <Plus size={14} className="text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex flex-col">
                  {recentTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={task.id}
                      className="flex gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium leading-tight text-foreground">{task.title}</h4>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {task.client_key?.name || 'No client'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="rounded-none px-1.5 py-0 font-mono text-[9px] font-normal uppercase"
                          >
                            {task.priority}
                          </Badge>
                          <span className="font-mono text-[9px] uppercase text-muted-foreground">
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar — Meeting Schedule */}
        <aside className="mt-6 mr-8 mb-6 hidden w-full max-w-[380px] shrink-0 border border-border xl:block">
          <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Schedule
            </h2>

            {/* Date Navigation */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <button className="text-muted-foreground hover:text-foreground">
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs text-foreground">Dec, 2024</span>
              <button className="text-muted-foreground hover:text-foreground">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Week strip — underline instead of filled bubble */}
            <div className="flex items-center justify-between">
              {[
                { d: 'Mon', n: 26 },
                { d: 'Tue', n: 27 },
                { d: 'Wed', n: 28, active: true },
                { d: 'Thu', n: 29 },
                { d: 'Fri', n: 30 },
              ].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 pb-2">
                  <span className={`font-mono text-[10px] ${day.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day.d}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${day.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day.n}
                  </span>
                  <span className={`mt-1 h-[2px] w-6 ${day.active ? 'bg-foreground' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  type="text"
                  placeholder="Search"
                  className="rounded-none border-border py-2 pl-9 pr-3 font-mono text-xs placeholder:text-muted-foreground"
                />
              </div>
              <Button size="icon" variant="outline" className="rounded-none border-border text-muted-foreground hover:text-foreground">
                <Filter size={16} />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-5 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-widest">
              <span className="border-b-2 border-foreground pb-3 -mb-3 text-foreground">Meeting</span>
              <span className="text-muted-foreground hover:text-foreground">Events</span>
              <span className="text-muted-foreground hover:text-foreground">Holiday</span>
            </div>

            {/* Meeting list — flat rows, no nested cards */}
            <div className="flex flex-col">
              {recentProjects.slice(0, 3).map((project, i) => (
                <div key={project.id} className="border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h4 className="text-sm font-semibold tracking-tight text-foreground">{project.name}</h4>
                    </div>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <AlarmClock size={11} />
                      {formatDate(project.due_date)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, Math.floor(Math.random() * 3) + 1))].map((_, idx) => (
                        <Avatar key={idx} className="h-6 w-6 rounded-none border-2 border-card">
                          <AvatarFallback className="rounded-none bg-foreground text-[9px] font-semibold text-background">
                            {(project.name?.charAt(idx) ?? '?').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <ExternalLink size={9} />
                        {project.client_key?.name || 'No client'}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Floating chat trigger — square, minimal */}
        <Button className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-none bg-foreground p-0 text-background shadow-none hover:bg-foreground/90 xl:hidden">
          <MessageSquare size={20} />
        </Button>
      </div>
    </AppLayout>
  );
}