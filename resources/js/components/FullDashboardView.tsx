import React, { useState } from 'react';
import { Task, Project, ViewType, TaskStatus } from '../types';
import { Logo } from './Logo';
import {
  Search,
  Plus,
  UserPlus,
  LayoutGrid,
  CalendarRange,
  ListTodo,
  Table as TableIcon,
  Filter,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Inbox,
  FileText,
  Map,
  Home as HomeIcon,
  ChevronDown,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlarmClock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';

interface FullDashboardViewProps {
  tasks: Task[];
  projects: Project[];
  activeProject: Project;
  onSelectProject: (p: Project) => void;
  onClose: () => void;
  onOpenAddTask: () => void;
  onOpenTaskDetail: (t: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

export const FullDashboardView: React.FC<FullDashboardViewProps> = ({
  tasks,
  projects,
  activeProject,
  onSelectProject,
  onClose,
  onOpenAddTask,
  onOpenTaskDetail,
  onUpdateStatus
}) => {
  const [activeView, setActiveView] = useState<ViewType>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const days = [
    { label: 'T', day: '13' },
    { label: 'W', day: '14' },
    { label: 'T', day: '15', active: true },
    { label: 'F', day: '16' },
    { label: 'S', day: '17' },
    { label: 'S', day: '18' },
    { label: 'M', day: '19' },
    { label: 'T', day: '20' },
    { label: 'W', day: '21' },
    { label: 'T', day: '22' }
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Development' || t.status === 'In Design').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 75;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans overflow-hidden animate-in fade-in duration-150">
      {/* Top Banner to return to Showcase Landing Page */}
      <div className="bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 flex items-center justify-between text-xs border-b border-[var(--gray-200)] shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--bg)] text-[var(--ink)] font-bold transition-opacity hover:opacity-90 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Showcase</span>
          </button>
          <span className="hidden sm:inline opacity-30">|</span>
          <span className="hidden sm:inline font-mono text-[11px] opacity-80">
            Mixkura Operational Matrix — Live Interactive Sandbox
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[var(--bg)] animate-pulse"></span>
          <span className="font-bold">Operational</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-60 bg-[var(--bg)] border-r border-[var(--gray-200)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Logo />
            </div>

            {/* Navigation */}
            <div className="space-y-1 mb-6 font-mono text-xs">
              <a href="#" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-bold text-[var(--ink)] bg-[var(--gray-100)]">
                <HomeIcon className="w-4 h-4 text-[var(--ink)]" />
                <span>Home Dashboard</span>
              </a>
              <a href="#" className="flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--ink)]">
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-[var(--gray-400)]" />
                  <span>Inbox</span>
                </div>
                <span className="bryl-pill-inverted px-1.5 py-0.2 text-[10px]">6</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--ink)]">
                <FileText className="w-4 h-4 text-[var(--gray-400)]" />
                <span>Specs & Docs</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--ink)]">
                <Map className="w-4 h-4 text-[var(--gray-400)]" />
                <span>Roadmaps</span>
              </a>
            </div>

            {/* Projects Workspaces */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2 font-mono text-[10px] font-bold text-[var(--gray-400)] uppercase tracking-widest">
                <span>PROJECTS</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--gray-400)]" />
              </div>
              <div className="space-y-1 font-mono text-xs">
                {projects.map((proj) => {
                  const isSelected = activeProject.id === proj.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => onSelectProject(proj)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[var(--ink)] text-[var(--bg)] font-bold'
                          : 'text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current"></span>
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] opacity-70">
                        {proj.taskCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom AI Assistant Card */}
          <div className="p-3 bg-[var(--gray-100)] border border-[var(--gray-200)] rounded-lg text-[var(--ink)] font-mono">
            <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>AI Task Copilot</span>
            </div>
            <p className="text-[11px] text-[var(--gray-500)] leading-tight">
              Click any task card to trigger Gemini AI automatic subtask breakdown.
            </p>
          </div>
        </aside>

        {/* Center Operational Content Area */}
        <main className="flex-1 bg-[var(--bg)] flex flex-col overflow-y-auto">
          {/* Scanned Masthead */}
          <div className="border-b border-[var(--gray-200)] px-6 py-5 bg-[var(--bg)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gray-400)]">
                  {todayStr}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-[var(--ink)]">
                  Operations & Task Matrix
                </h1>
              </div>
              <div className="flex gap-6 font-mono text-[11px] uppercase tracking-widest text-[var(--gray-500)]">
                <span>
                  Tasks&nbsp;
                  <span className="text-[var(--ink)] font-bold">{String(tasks.length).padStart(2, '0')}</span>
                </span>
                <span>
                  In Dev&nbsp;
                  <span className="text-[var(--ink)] font-bold">{String(inProgressCount).padStart(2, '0')}</span>
                </span>
                <span>
                  Done&nbsp;
                  <span className="text-[var(--ink)] font-bold">{String(completedCount).padStart(2, '0')}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Top Stat Row with Ledger & Ruler Meter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ledger Row Stat Block */}
              <div className="border border-[var(--gray-200)] p-5 bg-[var(--gray-50)]">
                <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
                  Workspace Ledger
                </h3>
                <div className="flex items-baseline justify-between border-b border-[var(--gray-200)] py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--gray-400)]">01</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-500)]">Tasks Total</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="flex items-center gap-0.5 font-mono text-[11px] text-[var(--gray-500)]">
                      <ArrowUpRight size={11} /> 12%
                    </span>
                    <span className="font-mono text-xl font-semibold tabular-nums text-[var(--ink)]">
                      {String(tasks.length).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between border-b border-[var(--gray-200)] py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--gray-400)]">02</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-500)]">Completed</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="flex items-center gap-0.5 font-mono text-[11px] text-[var(--gray-500)]">
                      <ArrowUpRight size={11} /> 18%
                    </span>
                    <span className="font-mono text-xl font-semibold tabular-nums text-[var(--ink)]">
                      {String(completedCount).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-[var(--gray-400)]">03</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-500)]">In Flight</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="flex items-center gap-0.5 font-mono text-[11px] text-[var(--gray-400)]">
                      <ArrowUpRight size={11} /> 5%
                    </span>
                    <span className="font-mono text-xl font-semibold tabular-nums text-[var(--ink)]">
                      {String(inProgressCount).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tick-mark Ruler Meter (Signature Element) */}
              <div className="border border-[var(--gray-200)] p-5 bg-[var(--bg)] flex flex-col justify-between">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
                    Completion Velocity
                  </h3>
                  <span className="font-mono text-2xl font-bold tabular-nums text-[var(--ink)]">
                    {completionRate}<span className="text-sm text-[var(--gray-400)]">%</span>
                  </span>
                </div>
                <div className="flex h-10 items-end gap-[2px] my-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const filled = i < Math.round((completionRate / 100) * 30);
                    const major = i % 5 === 0;
                    return (
                      <div
                        key={i}
                        className={`flex-1 ${major ? 'h-full' : 'h-2/3'} ${filled ? 'bg-[var(--ink)]' : 'bg-[var(--gray-200)]'}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[var(--gray-400)]">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Priority Task Queue Counter */}
              <div className="border border-[var(--gray-200)] p-5 bg-[var(--bg)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
                    Priority Queue
                  </h3>
                  <button
                    onClick={onOpenAddTask}
                    className="p-1 text-[var(--gray-400)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredTasks.slice(0, 2).map((t, idx) => (
                    <div
                      key={t.id}
                      onClick={() => onOpenTaskDetail(t)}
                      className="flex items-center justify-between text-xs border-b border-[var(--gray-200)] pb-2 cursor-pointer hover:text-[var(--ink)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--gray-400)]">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="font-medium text-[var(--ink)] truncate max-w-[140px]">{t.title}</span>
                      </div>
                      <span className="bryl-pill text-[9px]">
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View Selector Tabs & Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--gray-200)] font-mono">
              <div className="flex items-center gap-1 bg-[var(--gray-100)] p-1 rounded-md">
                <button
                  onClick={() => setActiveView('timeline')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'timeline' ? 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--gray-200)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5 text-[var(--ink)]" />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => setActiveView('board')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'board' ? 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--gray-200)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Board</span>
                </button>

                <button
                  onClick={() => setActiveView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'list' ? 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--gray-200)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>

                <button
                  onClick={() => setActiveView('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeView === 'table' ? 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--gray-200)]' : 'text-[var(--gray-500)] hover:text-[var(--ink)]'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[var(--gray-400)]" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs border border-[var(--gray-200)] bg-[var(--bg)] rounded-md focus:outline-none focus:border-[var(--ink)] w-36 sm:w-48 text-[var(--ink)]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold text-[var(--ink)] bg-[var(--gray-100)] border border-[var(--gray-200)] rounded-md focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Todo">Todo</option>
                  <option value="In Design">In Design</option>
                  <option value="In Development">In Development</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  onClick={onOpenAddTask}
                  className="bryl-btn-primary px-3 py-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* View Content Display */}
            <div>
              {activeView === 'timeline' && (
                <div className="space-y-4 font-mono">
                  {/* Timeline Days Header */}
                  <div className="grid grid-cols-10 text-center border-b border-[var(--gray-200)] pb-2">
                    {days.map((d, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-[10px] text-[var(--gray-400)]">{d.label}</span>
                        <span className={`text-xs font-bold ${d.active ? 'bryl-pill-inverted rounded-full w-5 h-5 flex items-center justify-center' : 'text-[var(--ink)]'}`}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail(task)}
                        className="group bg-[var(--bg)] border border-[var(--gray-200)] p-3 hover:border-[var(--ink)] transition-all cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[var(--gray-300)] group-hover:text-[var(--ink)] transition-colors" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--ink)]">
                                {task.title}
                              </span>
                              <span className="bryl-pill text-[9px]">
                                {task.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--gray-500)] line-clamp-1 font-sans">{task.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-[var(--gray-400)]">
                          <span>{task.startDate} - {task.endDate}</span>
                          <div className="flex -space-x-1">
                            {task.assignees.map((m, i) => (
                              <img
                                key={i}
                                src={m.avatar}
                                alt={m.name}
                                className="w-5 h-5 rounded-none border border-[var(--gray-200)] object-cover grayscale"
                                referrerPolicy="no-referrer"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'board' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(['Todo', 'In Design', 'In Development', 'In Review'] as TaskStatus[]).map((col) => {
                    const colTasks = filteredTasks.filter(t => t.status === col);
                    return (
                      <div key={col} className="bg-[var(--gray-50)] p-3 border border-[var(--gray-200)] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3 px-1 font-mono text-[11px] uppercase tracking-wider text-[var(--gray-500)]">
                            <span>{col}</span>
                            <span className="font-bold text-[var(--ink)]">
                              {colTasks.length}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {colTasks.map(task => (
                              <div
                                key={task.id}
                                onClick={() => onOpenTaskDetail(task)}
                                className="bg-[var(--bg)] p-3 border border-[var(--gray-200)] hover:border-[var(--ink)] cursor-pointer transition-all"
                              >
                                <div className="text-xs font-bold text-[var(--ink)] mb-1 font-sans">{task.title}</div>
                                <p className="text-[11px] text-[var(--gray-500)] line-clamp-2 mb-2 font-sans">{task.description}</p>
                                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--gray-400)]">
                                  <span>{task.endDate}</span>
                                  <div className="flex -space-x-1">
                                    {task.assignees.map((m, i) => (
                                      <img key={i} src={m.avatar} className="w-4 h-4 rounded-none border border-[var(--gray-200)] object-cover grayscale" referrerPolicy="no-referrer" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={onOpenAddTask}
                          className="mt-3 w-full py-1.5 font-mono text-[10px] uppercase text-[var(--gray-500)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] border border-dashed border-[var(--gray-200)] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeView === 'list' && (
                <div className="space-y-2 font-mono">
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskDetail(task)}
                      className="flex items-center justify-between bg-[var(--bg)] p-3 border border-[var(--gray-200)] hover:border-[var(--ink)] transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[var(--gray-300)] hover:text-[var(--ink)] transition-colors" />
                        <div>
                          <div className="font-bold text-[var(--ink)] text-xs font-sans">{task.title}</div>
                          <div className="text-[var(--gray-500)] text-[11px] font-sans">{task.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="bryl-pill text-[10px]">
                          {task.status}
                        </span>
                        <span className="text-[var(--gray-400)] font-mono text-[11px]">{task.startDate} - {task.endDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'table' && (
                <div className="bg-[var(--bg)] border border-[var(--gray-200)] overflow-hidden">
                  <table className="w-full text-left text-xs text-[var(--ink)] font-mono">
                    <thead className="bg-[var(--gray-50)] border-b border-[var(--gray-200)] text-[10px] text-[var(--gray-400)] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 font-semibold">Task Title</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Priority</th>
                        <th className="p-3 font-semibold">Assignees</th>
                        <th className="p-3 font-semibold">Dates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--gray-200)]">
                      {filteredTasks.map(task => (
                        <tr key={task.id} onClick={() => onOpenTaskDetail(task)} className="hover:bg-[var(--gray-50)] cursor-pointer transition-colors">
                          <td className="p-3 font-bold text-[var(--ink)] text-xs font-sans">{task.title}</td>
                          <td className="p-3">
                            <span className="bryl-pill text-[9px]">
                              {task.status}
                            </span>
                          </td>
                          <td className="p-3 text-[var(--gray-500)]">{task.priority}</td>
                          <td className="p-3">
                            <div className="flex -space-x-1">
                              {task.assignees.map((m, i) => (
                                <img key={i} src={m.avatar} className="w-4 h-4 rounded-none border border-[var(--gray-200)] object-cover grayscale" referrerPolicy="no-referrer" />
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-[var(--gray-400)] text-[11px]">{task.startDate} - {task.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar — Scanned Schedule Panel */}
        <aside className="w-80 bg-[var(--bg)] border-l border-[var(--gray-200)] p-5 flex flex-col gap-5 overflow-y-auto hidden lg:flex shrink-0">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--gray-400)]">
            Schedule & Events
          </h2>

          {/* Date Selector */}
          <div className="flex items-center justify-between border-b border-[var(--gray-200)] pb-3">
            <button className="text-[var(--gray-400)] hover:text-[var(--ink)] cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-[var(--ink)] font-bold">Dec, 2024</span>
            <button className="text-[var(--gray-400)] hover:text-[var(--ink)] cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week Strip (Underline indicator) */}
          <div className="flex items-center justify-between">
            {[
              { d: 'Mon', n: 26 },
              { d: 'Tue', n: 27 },
              { d: 'Wed', n: 28, active: true },
              { d: 'Thu', n: 29 },
              { d: 'Fri', n: 30 },
            ].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 pb-1">
                <span className={`font-mono text-[10px] ${day.active ? 'text-[var(--ink)] font-bold' : 'text-[var(--gray-400)]'}`}>
                  {day.d}
                </span>
                <span className={`text-xs font-semibold tabular-nums ${day.active ? 'text-[var(--ink)]' : 'text-[var(--gray-400)]'}`}>
                  {day.n}
                </span>
                <span className={`mt-1 h-[2px] w-5 ${day.active ? 'bg-[var(--ink)]' : 'bg-transparent'}`} />
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative font-mono">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]" size={13} />
            <input
              type="text"
              placeholder="Filter meetings"
              className="w-full border border-[var(--gray-200)] bg-[var(--bg)] text-[var(--ink)] py-1.5 pl-8 pr-3 font-mono text-xs placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-4 border-b border-[var(--gray-200)] pb-2 font-mono text-[10px] uppercase tracking-widest">
            <span className="border-b-2 border-[var(--ink)] pb-2 -mb-2 text-[var(--ink)] font-bold">Meetings</span>
            <span className="text-[var(--gray-400)] hover:text-[var(--ink)] cursor-pointer">Milestones</span>
          </div>

          {/* Meeting items list (Flat rows) */}
          <div className="flex flex-col space-y-3 font-mono">
            {projects.slice(0, 3).map((proj, i) => (
              <div key={proj.id} className="border-b border-[var(--gray-200)] pb-3 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-[var(--gray-400)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--ink)]">{proj.name}</h4>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--gray-400)]">
                    <AlarmClock size={11} />
                    10:00 AM
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--gray-500)]">
                  <span className="flex items-center gap-1">
                    <ExternalLink size={10} />
                    {proj.category}
                  </span>
                  <span className="uppercase text-[var(--gray-400)]">
                    Active Sync
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};


