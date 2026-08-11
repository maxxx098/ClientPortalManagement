import React, { useState } from 'react';
import { Task, ViewType, TaskStatus, Project } from '../types';
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
  ChevronDown,
  Sparkles,
  Inbox,
  FileText,
  Map,
  Home as HomeIcon,
  CheckCircle2,
  MoreHorizontal,
  ArrowUpRight,
  Maximize2,
  Calendar
} from 'lucide-react';

interface HeroSectionProps {
  tasks: Task[];
  projects: Project[];
  activeProject: Project;
  onSelectProject: (proj: Project) => void;
  onOpenAddTask: () => void;
  onOpenTaskDetail: (task: Task) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenFullDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  tasks,
  projects,
  activeProject,
  onSelectProject,
  onOpenAddTask,
  onOpenTaskDetail,
  onOpenAuth,
  onOpenFullDemo
}) => {
  const [activeView, setActiveView] = useState<ViewType>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth] = useState('December');

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

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'In Design':
        return 'border-[var(--gray-300)] text-[var(--ink)] bg-[var(--gray-100)]';
      case 'In Review':
        return 'border-[var(--gray-300)] text-[var(--ink)] bg-[var(--gray-100)]';
      case 'In Development':
        return 'border-[var(--ink)] text-[var(--bg)] bg-[var(--ink)] font-bold';
      case 'Completed':
        return 'border-[var(--gray-300)] text-[var(--gray-500)] bg-[var(--gray-50)]';
      default:
        return 'border-[var(--gray-200)] text-[var(--gray-500)] bg-transparent';
    }
  };

  return (
    <section id="home" className="relative min-h-screen pt-28 pb-20 overflow-hidden flex flex-col justify-between bg-halftone">
      {/* Soft gradient vignette over halftone texture */}
      <div className="absolute inset-0 bg-radial from-transparent via-[var(--bg)]/70 to-[var(--bg)] pointer-events-none"></div>

      {/* Hero Header Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center mb-12">
        {/* Section Marker micro-label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--gray-200)] bg-[var(--bg)]/90 mb-6 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)]">
            01 — AI Task Operations Platform
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-[var(--ink)] tracking-tight leading-[1.08] mb-6 font-sans">
          Smarter Execution for <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-[var(--ink)]">
            Technical Workflows
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl mx-auto text-sm sm:text-base text-[var(--gray-500)] font-sans leading-relaxed mb-8">
          Track sprint metrics, optimize team capacity, and execute with precision using AI breakdown tools in a clean, high-clarity environment.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('signup')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--bg)]" />
          </button>

          <button
            onClick={onOpenFullDemo}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg)] hover:bg-[var(--gray-100)] text-[var(--ink)] font-mono text-xs uppercase tracking-wider border border-[var(--gray-200)] transition-all cursor-pointer shadow-2xs"
          >
            <span>Interactive Demo</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--gray-400)]" />
          </button>
        </div>
      </div>

      {/* Floating Interactive Dashboard Frame */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
        <div className="bryl-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
            {/* Sidebar inside Preview */}
            <div className="hidden md:block md:col-span-3 border-r border-[var(--gray-200)] bg-[var(--gray-50)] p-4 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <Logo />
                  <button className="text-[var(--gray-400)] hover:text-[var(--ink)]">
                    <Maximize2 className="w-4 h-4" onClick={onOpenFullDemo} title="Expand Full Workspace" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--gray-400)]" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-[var(--bg)] border border-[var(--gray-200)] rounded-lg focus:outline-none focus:border-[var(--ink)] font-mono"
                  />
                  <div className="absolute right-2 top-2 text-[9px] text-[var(--gray-400)] font-mono bg-[var(--gray-100)] px-1 rounded">⌘K</div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 mb-6">
                  <a href="#" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--ink)] bg-[var(--gray-100)]">
                    <HomeIcon className="w-4 h-4 text-[var(--gray-500)]" />
                    <span>Home Dashboard</span>
                  </a>
                  <a href="#" className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)]">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-[var(--gray-400)]" />
                      <span>Inbox</span>
                    </div>
                    <span className="bryl-pill-inverted">6</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)]">
                    <FileText className="w-4 h-4 text-[var(--gray-400)]" />
                    <span>Documents</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--gray-500)] hover:bg-[var(--gray-100)]">
                    <Map className="w-4 h-4 text-[var(--gray-400)]" />
                    <span>Roadmaps</span>
                  </a>
                </div>

                {/* Projects Section */}
                <div>
                  <div className="flex items-center justify-between px-2 mb-2 font-mono text-[10px] text-[var(--gray-400)] uppercase tracking-widest">
                    <span>PROJECTS</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--gray-400)]" />
                  </div>
                  <div className="space-y-1">
                    {projects.map((proj) => {
                      const isSelected = activeProject.id === proj.id;
                      return (
                        <button
                          key={proj.id}
                          onClick={() => onSelectProject(proj)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                            isSelected
                              ? 'bg-[var(--bg)] text-[var(--ink)] font-bold border border-[var(--gray-200)] shadow-2xs'
                              : 'text-[var(--gray-500)] hover:bg-[var(--gray-100)]'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: proj.color }}
                          ></span>
                          <span className="truncate">{proj.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Copilot Card */}
              <div className="p-3 bg-[var(--ink)] text-[var(--bg)] rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-mono font-bold text-[11px] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--bg)]" />
                  <span>Gemini Copilot</span>
                </div>
                <p className="font-mono text-[10px] opacity-80 leading-tight">
                  Auto breakdown active for tasks.
                </p>
              </div>
            </div>

            {/* Main Board View Area */}
            <div className="col-span-1 md:col-span-9 p-5 sm:p-6 flex flex-col justify-between bg-[var(--bg)]">
              <div>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--gray-400)] mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
                  <span>{activeProject.category}</span>
                  <span>/</span>
                  <span className="text-[var(--ink)] font-bold">{activeProject.name}</span>
                </div>

                {/* Title & Top Right Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--ink)] font-sans">{activeProject.name}</h2>
                    <MoreHorizontal className="w-4 h-4 text-[var(--gray-400)] cursor-pointer" />
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 px-3 py-1.5 font-mono text-xs text-[var(--gray-500)] bg-[var(--gray-100)] hover:text-[var(--ink)] rounded-lg transition-colors cursor-pointer">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>

                    <button
                      onClick={onOpenAddTask}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-bold text-[var(--bg)] bg-[var(--ink)] hover:opacity-90 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* View Selector Tabs & Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--gray-200)] mb-5">
                  <div className="flex items-center gap-1 bg-[var(--gray-100)] p-1 rounded-lg">
                    <button
                      onClick={() => setActiveView('timeline')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeView === 'timeline' ? 'bg-[var(--bg)] text-[var(--ink)] shadow-2xs' : 'text-[var(--gray-400)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <CalendarRange className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>

                    <button
                      onClick={() => setActiveView('board')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeView === 'board' ? 'bg-[var(--bg)] text-[var(--ink)] shadow-2xs' : 'text-[var(--gray-400)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Kanban</span>
                    </button>

                    <button
                      onClick={() => setActiveView('list')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeView === 'list' ? 'bg-[var(--bg)] text-[var(--ink)] shadow-2xs' : 'text-[var(--gray-400)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>

                    <button
                      onClick={() => setActiveView('table')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeView === 'table' ? 'bg-[var(--bg)] text-[var(--ink)] shadow-2xs' : 'text-[var(--gray-400)] hover:text-[var(--ink)]'
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
                        className="pl-8 pr-3 py-1 text-xs border border-[var(--gray-200)] rounded-md focus:outline-none focus:border-[var(--ink)] w-36 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* View Content Display */}
                {activeView === 'timeline' && (
                  <div className="space-y-3">
                    {/* Days Header */}
                    <div className="grid grid-cols-10 text-center border-b border-[var(--gray-200)] pb-2 font-mono">
                      {days.map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <span className="text-[10px] text-[var(--gray-400)]">{d.label}</span>
                          <span className={`text-xs font-bold ${d.active ? 'text-[var(--ink)] border-b-2 border-[var(--ink)]' : 'text-[var(--gray-400)]'}`}>
                            {d.day}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Timeline List */}
                    <div className="space-y-2 pt-1">
                      {filteredTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onOpenTaskDetail(task)}
                          className="group bg-[var(--bg)] rounded-lg border border-[var(--gray-200)] p-3 hover:border-[var(--ink)] transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[var(--ink)] group-hover:underline">
                              {task.title}
                            </span>
                            <span className={`bryl-pill ${getStatusBadgeClass(task.status)}`}>
                              {task.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-[var(--gray-400)]">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Calendar className="w-3 h-3 text-[var(--gray-400)]" />
                              <span>{task.startDate} - {task.endDate}</span>
                            </div>

                            <span className="text-[10px] uppercase">{task.priority}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeView === 'board' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['Todo', 'In Development', 'In Review'] as TaskStatus[]).map((col) => {
                      const colTasks = filteredTasks.filter(t => t.status === col);
                      return (
                        <div key={col} className="bg-[var(--gray-50)] p-3 rounded-xl border border-[var(--gray-200)]">
                          <div className="flex items-center justify-between mb-3 font-mono text-[11px] uppercase text-[var(--gray-500)]">
                            <span>{col}</span>
                            <span className="font-bold text-[var(--ink)]">{colTasks.length}</span>
                          </div>
                          <div className="space-y-2">
                            {colTasks.map(task => (
                              <div
                                key={task.id}
                                onClick={() => onOpenTaskDetail(task)}
                                className="bg-[var(--bg)] p-2.5 rounded-lg border border-[var(--gray-200)] hover:border-[var(--ink)] cursor-pointer"
                              >
                                <div className="text-xs font-bold text-[var(--ink)] mb-1">{task.title}</div>
                                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--gray-400)]">
                                  <span>{task.startDate}</span>
                                  <span className="uppercase">{task.priority}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeView === 'list' && (
                  <div className="space-y-2">
                    {filteredTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => onOpenTaskDetail(task)}
                        className="flex items-center justify-between bg-[var(--bg)] p-3 rounded-lg border border-[var(--gray-200)] hover:border-[var(--ink)] transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[var(--gray-400)]" />
                          <span className="font-bold text-[var(--ink)]">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-xs">
                          <span className={`bryl-pill ${getStatusBadgeClass(task.status)}`}>
                            {task.status}
                          </span>
                          <span className="text-[var(--gray-400)]">{task.endDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeView === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono text-[var(--gray-500)]">
                      <thead>
                        <tr className="border-b border-[var(--gray-200)] text-[var(--gray-400)] uppercase text-[10px]">
                          <th className="pb-2">Task Title</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Priority</th>
                          <th className="pb-2">Dates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--gray-200)]">
                        {filteredTasks.map(task => (
                          <tr key={task.id} onClick={() => onOpenTaskDetail(task)} className="hover:bg-[var(--gray-50)] cursor-pointer">
                            <td className="py-2.5 font-bold text-[var(--ink)]">{task.title}</td>
                            <td className="py-2.5">
                              <span className={`bryl-pill ${getStatusBadgeClass(task.status)}`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="py-2.5 uppercase">{task.priority}</td>
                            <td className="py-2.5 text-[var(--gray-400)]">{task.startDate} - {task.endDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer Banner */}
              <div className="mt-4 pt-3 border-t border-[var(--gray-200)] flex items-center justify-between font-mono text-[11px] text-[var(--gray-400)]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--ink)]"></span>
                  <span>System Engine: Operational</span>
                </div>
                <button
                  onClick={onOpenFullDemo}
                  className="font-bold text-[var(--ink)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Launch Full Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

