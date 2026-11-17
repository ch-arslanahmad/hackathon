import React from 'react';
import {
  CheckSquare,
  Calendar,
  Clock,
  Briefcase,
  User,
  ShieldCheck,
  Building,
  CheckCircle2,
  Circle,
  PlayCircle,
} from 'lucide-react';
import type { TaskStatus, TaskWithAssignee, User as UserType } from '../types/index.js';

interface AgentTasksViewProps {
  tasks: TaskWithAssignee[];
  currentUser: UserType;
  isLoading: boolean;
  onOpenProject?: (projectId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  updatingTaskId: string | null;
}

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

const statusStyle: Record<TaskStatus, string> = {
  TODO: 'border-slate-700 bg-slate-800 text-slate-300',
  IN_PROGRESS: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  DONE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

export const AgentTasksView: React.FC<AgentTasksViewProps> = ({
  tasks,
  currentUser,
  isLoading,
  onOpenProject,
  onUpdateTaskStatus,
  updatingTaskId,
}) => {
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Assigned Tasks
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Showing exclusively tasks assigned to {currentUser.name} ({currentUser.id}). Other
            developers' tasks are inaccessible.
          </p>
          <div className="mt-4 max-w-md">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Personal progress</span>
              <span className="text-cyan-300">{completedTasks}/{tasks.length} complete · {progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Workload</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">{totalHours} Hours</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Developer Role</span>
            <span className="text-xs font-medium text-cyan-300">{currentUser.specialization}</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading your assigned tasks...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tasks.length === 0 && (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Tasks Assigned Yet</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
            You currently have no tasks assigned to your account ({currentUser.name}). Once projects
            are created from meeting transcripts, your allocated tasks will appear here.
          </p>
        </div>
      )}

      {/* Task Cards List */}
      {!isLoading && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${task.status === 'DONE' ? 'border-emerald-500/25' : 'border-slate-800 hover:border-slate-700'}`}
            >
              <div>
                {/* Project & Client Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-white">{task.projectName || 'Project'}</span>
                  </div>
                  {task.clientName && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Client: {task.clientName}
                    </span>
                  )}
                </div>

                {/* Task Title */}
                <h3 className="text-base font-bold text-white mb-1.5">{task.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {task.description || 'No specific description provided.'}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle[task.status]}`}>
                  {task.status === 'DONE' ? <CheckCircle2 className="h-3.5 w-3.5" /> : task.status === 'IN_PROGRESS' ? <PlayCircle className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  {statusOptions.find((option) => option.value === task.status)?.label}
                </span>
                <label className="sr-only" htmlFor={`status-${task.id}`}>Update status for {task.title}</label>
                <select
                  id={`status-${task.id}`}
                  value={task.status}
                  disabled={updatingTaskId === task.id}
                  onChange={(event) => onUpdateTaskStatus(task.id, event.target.value as TaskStatus)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-200 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {task.status !== 'DONE' && (
                  <button
                    type="button"
                    disabled={updatingTaskId === task.id}
                    onClick={() => onUpdateTaskStatus(task.id, 'DONE')}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-wait disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark done
                  </button>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
                {task.managerName && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Project Manager:
                    </span>
                    <span className="text-amber-300 font-medium">{task.managerName}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Deadline:
                  </span>
                  <span className="font-mono text-cyan-300 font-semibold">{task.deadline}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Estimated Hours:
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">{task.estimatedHours} hrs</span>
                </div>

                {onOpenProject && (
                  <div className="pt-2 text-right">
                    <button
                      onClick={() => onOpenProject(task.projectId)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
                    >
                      View Parent Project →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
