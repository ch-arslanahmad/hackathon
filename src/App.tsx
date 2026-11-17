/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { LoginView } from './components/LoginView.js';
import { ProjectsList } from './components/ProjectsList.js';
import { ProjectDetailView } from './components/ProjectDetailView.js';
import { AgentTasksView } from './components/AgentTasksView.js';
import { TranscriptCreator } from './components/TranscriptCreator.js';
import { TeamDirectoryView } from './components/TeamDirectoryView.js';
import { DemoGuideModal } from './components/DemoGuideModal.js';
import { api, authStorage } from './lib/api.js';
import { DEMO_PASSWORD } from '../server/seedData.js';
import type {
  User,
  ProjectWithDetails,
  TaskWithAssignee,
  TranscriptCreationResult,
} from './types/index.js';
import { ShieldAlert, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<'projects' | 'directory' | 'my-tasks' | 'transcript'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);

  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [agentTasks, setAgentTasks] = useState<TaskWithAssignee[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);

  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { user } = await api.getMe();
        setCurrentUser(user);
        if (user.role === 'AGENT') {
          setCurrentTab('my-tasks');
        } else {
          setCurrentTab('projects');
        }
      } catch {
        authStorage.clearToken();
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    }
    checkAuth();
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setDataLoading(true);
    setAccessDeniedMessage(null);

    try {
      if (currentTab === 'projects') {
        const res = await api.getProjects();
        setProjects(res.projects);
      } else if (currentTab === 'my-tasks') {
        const res = await api.getMyTasks();
        setAgentTasks(res.tasks);
      } else if (currentTab === 'directory') {
        const res = await api.getTeam();
        setTeam(res.team);
      } else if (currentTab === 'transcript') {
        const res = await api.getProjects();
        setProjects(res.projects);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      if (err.status === 403) {
        setAccessDeniedMessage(err.message || 'Access denied by role policy.');
      }
    } finally {
      setDataLoading(false);
    }
  }, [currentUser, currentTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedProjectId || !currentUser) {
      setSelectedProject(null);
      return;
    }

    async function fetchDetail() {
      setDataLoading(true);
      try {
        const res = await api.getProjectById(selectedProjectId!);
        setSelectedProject(res.project);
      } catch (err: any) {
        console.error('Failed to get project details:', err);
        setAccessDeniedMessage(err.message || 'Direct Access Denied: You cannot view this project.');
        setSelectedProjectId(null);
      } finally {
        setDataLoading(false);
      }
    }

    fetchDetail();
  }, [selectedProjectId, currentUser]);

  // 3. Auth Actions
  const handleLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(email, pass);
      setCurrentUser(res.user);
      setSelectedProjectId(null);

      // Redirect user based on role (FR-001 / Section 7.1)
      if (res.user.role === 'AGENT') {
        setCurrentTab('my-tasks');
      } else {
        setCurrentTab('projects');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setSelectedProjectId(null);
      setSelectedProject(null);
      setProjects([]);
      setAgentTasks([]);
    }
  };

  const handleQuickSwitchUser = async (email: string) => {
    await handleLogin(email, DEMO_PASSWORD);
  };

  // 4. Tab Navigation with RBAC checks
  const handleSelectTab = (tab: 'projects' | 'directory' | 'my-tasks' | 'transcript') => {
    setSelectedProjectId(null);
    setSelectedProject(null);

    // Prevent non-admin from entering transcript tab (FR-003)
    if (tab === 'transcript' && currentUser?.role !== 'ADMIN') {
      setAccessDeniedMessage('Security Enforcement: Only Administrator accounts can access Transcript AI.');
      return;
    }

    setCurrentTab(tab);
  };

  // 5. AI Transcript Execution
  const handleProcessTranscript = async (transcript: string): Promise<TranscriptCreationResult> => {
    setIsProcessingTranscript(true);
    try {
      const result = await api.createFromTranscript(transcript);
      // Reload projects
      const res = await api.getProjects();
      setProjects(res.projects);
      return result;
    } finally {
      setIsProcessingTranscript(false);
    }
  };

  // 6. Reset Database
  const handleResetData = async () => {
    try {
      await api.resetData(true);
      await loadData();
      setSelectedProjectId(null);
      setSelectedProject(null);
    } catch (err: any) {
      alert(err.message || 'Failed to reset project data.');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Initializing NovaWorks CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen text-slate-100 font-sans">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
      />

      <main className={`min-h-screen px-4 pb-8 pt-24 sm:px-6 lg:px-8 ${currentUser ? 'md:pl-72 lg:pl-72' : ''}`}>
        <div className="page-enter mx-auto w-full max-w-7xl">
        {accessDeniedMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Access Restriction Triggered</span>
                <span className="text-xs text-rose-300">{accessDeniedMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedMessage(null)}
              className="p-1 rounded-lg hover:bg-rose-900/50 text-rose-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!currentUser ? (
          <LoginView onLogin={handleLogin} isLoading={authLoading} error={authError} />
        ) : selectedProjectId && selectedProject ? (
          <ProjectDetailView
            project={selectedProject}
            currentUser={currentUser}
            onBack={() => {
              setSelectedProjectId(null);
              setSelectedProject(null);
            }}
          />
        ) : currentTab === 'projects' ? (
          <ProjectsList
            projects={projects}
            currentUser={currentUser}
            onSelectProject={(id) => setSelectedProjectId(id)}
            onOpenTranscriptTab={() => setCurrentTab('transcript')}
            isLoading={dataLoading}
          />
        ) : currentTab === 'my-tasks' ? (
          <AgentTasksView
            tasks={agentTasks}
            currentUser={currentUser}
            isLoading={dataLoading}
            onOpenProject={(projId) => setSelectedProjectId(projId)}
          />
        ) : currentTab === 'transcript' ? (
          <TranscriptCreator
            onProcessTranscript={handleProcessTranscript}
            isProcessing={isProcessingTranscript}
            onSuccessNavigate={() => {
              setCurrentTab('projects');
              loadData();
            }}
            onClearProjects={handleResetData}
            existingProjectCount={projects.length}
          />
        ) : currentTab === 'directory' ? (
          <TeamDirectoryView team={team} isLoading={dataLoading} />
        ) : null}
        </div>
      </main>

      <footer className={`border-t border-slate-800 bg-slate-950/70 py-6 text-center text-xs text-slate-500 ${currentUser ? 'md:pl-64' : ''}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>NovaWorks Technologies CRM — THE INFINITY HACK ’26</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="text-blue-600 transition hover:text-blue-700"
            >
              Interactive Demo Checklist
            </button>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
      </footer>

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onSwitchUser={handleQuickSwitchUser}
        onSelectTab={handleSelectTab}
        onResetData={handleResetData}
      />
    </div>
  );
}
