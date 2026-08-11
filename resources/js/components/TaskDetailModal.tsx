import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { X, Calendar, Sparkles, Trash2 } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdateStatus,
  onDeleteTask
}) => {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  if (!task) return null;

  const handleGenerateAiBreakdown = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setAiSummary(
        `AI Analysis for "${task.title}":\n• Estimated completion confidence: 92%\n• Key Dependencies: Design system palette & layout grid\n• Recommended Next Step: Review contrast ratios and run automated component snapshot tests.`
      );
      setIsGeneratingAi(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--gray-200)] w-full max-w-xl overflow-hidden text-[var(--ink)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bryl-pill-inverted">
              {task.status}
            </span>
            <span className="text-[var(--gray-400)]">ID: {task.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--gray-400)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold font-sans text-[var(--ink)] mb-1">{task.title}</h2>
            <p className="text-xs sm:text-sm text-[var(--gray-500)] leading-relaxed">{task.description}</p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-[var(--gray-50)] p-4 rounded-xl border border-[var(--gray-200)] font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)] block mb-1">Timeline Schedule</span>
              <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--gray-500)]" />
                <span>{task.startDate} – {task.endDate}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)] block mb-1">Priority</span>
              <span className="bryl-pill">
                {task.priority} Priority
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--gray-400)] block mb-1.5">Assigned Team</span>
              <div className="flex items-center gap-2">
                {task.assignees.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5 bg-[var(--bg)] px-2.5 py-1 rounded-md border border-[var(--gray-200)] text-xs text-[var(--ink)]">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-3.5 h-3.5 rounded-full object-cover grayscale"
                      referrerPolicy="no-referrer"
                    />
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Change Status */}
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-[var(--gray-500)] block mb-2">
              Change Status
            </label>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {(['Todo', 'In Design', 'In Development', 'In Review', 'Completed'] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(task.id, st)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    task.status === st
                      ? 'bryl-pill-inverted font-bold'
                      : 'bryl-pill'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* AI Helper Feature */}
          <div className="p-4 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-200)] font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--ink)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--ink)]" />
                <span>Mixkura AI Smart Assistant</span>
              </div>
              {!aiSummary && (
                <button
                  onClick={handleGenerateAiBreakdown}
                  disabled={isGeneratingAi}
                  className="bryl-btn-primary px-3 py-1 text-[11px]"
                >
                  {isGeneratingAi ? 'Analyzing...' : 'Generate AI Insights'}
                </button>
              )}
            </div>

            {aiSummary ? (
              <div className="text-xs text-[var(--ink)] whitespace-pre-line leading-relaxed bg-[var(--bg)] p-3 rounded-lg border border-[var(--gray-200)]">
                {aiSummary}
              </div>
            ) : (
              <p className="text-xs text-[var(--gray-400)]">
                Click to get instant automated dependencies, risk estimation, and workload recommendation.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--gray-200)] bg-[var(--gray-50)] font-mono text-xs">
          <button
            onClick={() => onDeleteTask(task.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[var(--gray-500)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>

          <button
            onClick={onClose}
            className="bryl-btn-primary px-5 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

