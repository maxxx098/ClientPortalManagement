import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, TeamMember } from '../types';
import { initialTeamMembers } from '../data/mockData';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  defaultStatus?: TaskStatus;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  defaultStatus = 'Todo'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [startDate, setStartDate] = useState('15 Dec');
  const [endDate, setEndDate] = useState('18 Dec');
  const [selectedAssignees, setSelectedAssignees] = useState<TeamMember[]>([initialTeamMembers[0]]);
  const [tagInput, setTagInput] = useState('Product, UX');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || 'New task created in Mixkura backlog.',
      status,
      priority,
      projectId: 'p2',
      assignees: selectedAssignees,
      startDate,
      endDate,
      progress: 0,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
      commentsCount: 0
    });

    // Reset & close
    setTitle('');
    setDescription('');
    onClose();
  };

  const toggleAssignee = (member: TeamMember) => {
    if (selectedAssignees.some(m => m.id === member.id)) {
      if (selectedAssignees.length > 1) {
        setSelectedAssignees(selectedAssignees.filter(m => m.id !== member.id));
      }
    } else {
      setSelectedAssignees([...selectedAssignees, member]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--gray-200)] w-full max-w-lg overflow-hidden text-[var(--ink)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--gray-200)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--ink)]"></span>
            <h3 className="text-base font-bold font-sans">Create Operational Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--gray-400)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Foundation Tokens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] transition-all resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono"
              >
                <option value="Todo">Todo</option>
                <option value="In Design">In Design</option>
                <option value="In Development">In Development</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
                Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
                End Date
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--gray-500)] mb-1">
              Assign Team Members
            </label>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
              {initialTeamMembers.map((member) => {
                const isSelected = selectedAssignees.some(m => m.id === member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleAssignee(member)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bryl-pill-inverted'
                        : 'bryl-pill'
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-3.5 h-3.5 rounded-full object-cover grayscale"
                      referrerPolicy="no-referrer"
                    />
                    <span>{member.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[var(--gray-200)] font-mono text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="bryl-btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bryl-btn-primary px-5 py-2"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

