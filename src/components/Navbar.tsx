import React, { useState } from 'react';
import {
  Briefcase,
  CheckSquare,
  ChevronDown,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  Terminal,
  Users,
  X,
} from 'lucide-react';
import type { User } from '../types/index.js';

type AppTab = 'projects' | 'directory' | 'my-tasks' | 'transcript';

interface NavbarProps {
  currentUser: User | null;
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onLogout: () => void;
  onQuickSwitchUser: (email: string) => void;
  onOpenDemoGuide: () => void;
}

const demoAccounts = [
  { label: 'Administrator', email: 'admin@novaworks.example', role: 'ADMIN' },
  { label: 'Ayesha Khan · Web PM', email: 'ayesha@novaworks.example', role: 'MANAGER' },
  { label: 'Bilal Ahmed · Mobile PM', email: 'bilal@novaworks.example', role: 'MANAGER' },
  { label: 'Hina Malik · AI PM', email: 'hina@novaworks.example', role: 'MANAGER' },
  { label: 'Ali Raza · Full-Stack', email: 'ali@novaworks.example', role: 'AGENT' },
  { label: 'Hamza Shah · Backend/API', email: 'hamza@novaworks.example', role: 'AGENT' },
  { label: 'Sara Noor · Flutter', email: 'sara@novaworks.example', role: 'AGENT' },
  { label: 'Usman Tariq · Flutter QA', email: 'usman@novaworks.example', role: 'AGENT' },
  { label: 'Zain Abbas · AI Dev', email: 'zain@novaworks.example', role: 'AGENT' },
  { label: 'Maryam Asif · AI Docs', email: 'maryam@novaworks.example', role: 'AGENT' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  onLogout,
  onQuickSwitchUser,
  onOpenDemoGuide,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navigation = (
    <nav aria-label="Main navigation" className="space-y-1">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Workspace
      </p>
      <NavItem
        active={currentTab === 'projects'}
        icon={<Briefcase className="h-[18px] w-[18px]" />}
        label={
          currentUser?.role === 'ADMIN'
            ? 'All Projects'
            : currentUser?.role === 'MANAGER'
              ? 'Assigned Projects'
              : 'Active Projects'
        }
        onClick={() => selectTab('projects')}
      />
      {currentUser?.role === 'AGENT' && (
        <NavItem
          active={currentTab === 'my-tasks'}
          icon={<CheckSquare className="h-[18px] w-[18px]" />}
          label="My Tasks"
          onClick={() => selectTab('my-tasks')}
        />
      )}
      {currentUser?.role === 'ADMIN' && (
        <NavItem
          active={currentTab === 'transcript'}
          icon={<Sparkles className="h-[18px] w-[18px]" />}
          label="Create from Transcript"
          onClick={() => selectTab('transcript')}
        />
      )}
      <NavItem
        active={currentTab === 'directory'}
        icon={<Users className="h-[18px] w-[18px]" />}
        label="Team Directory"
        onClick={() => selectTab('directory')}
      />
    </nav>
  );

  function selectTab(tab: AppTab) {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-full items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {currentUser && (
              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-novaworks-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-novaworks-blue md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-novaworks-navy text-sm font-bold tracking-wide text-white shadow-md shadow-novaworks-navy/15">
                NW
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-tight text-novaworks-navy sm:text-base">
                  NovaWorks <span className="hidden sm:inline">Project Manager</span>
                </p>
                <p className="hidden text-[11px] text-slate-500 sm:block">Meeting-to-Execution System</p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenDemoGuide}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-novaworks-lavender-strong bg-novaworks-lavender px-2.5 text-xs font-semibold text-novaworks-navy transition hover:bg-novaworks-lavender-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-novaworks-blue sm:px-3"
              title="Open Organizer / Judge Verification Guide"
            >
              <Terminal className="h-4 w-4" />
              <span className="hidden sm:inline">Demo Checklist</span>
            </button>

            {currentUser && (
              <>
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setIsAccountMenuOpen((open) => !open)}
                    className="inline-flex h-10 max-w-[190px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-novaworks-blue sm:px-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-novaworks-lavender text-xs font-bold text-novaworks-navy">
                      {currentUser.name.charAt(0)}
                    </span>
                    <span className="hidden min-w-0 text-left lg:block">
                      <span className="block truncate text-xs font-semibold text-novaworks-navy">
                        {currentUser.name}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {currentUser.role === 'ADMIN' ? 'Administrator' : currentUser.role === 'MANAGER' ? 'Manager' : 'Agent'}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                  </button>

                  {isAccountMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Switch demo account"
                      className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-card"
                    >
                      <div className="px-2 py-2">
                        <p className="text-xs font-semibold text-novaworks-navy">Quick account switch</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">{currentUser.email}</p>
                      </div>
                      <div className="max-h-[min(60vh,26rem)] space-y-0.5 overflow-y-auto border-t border-slate-100 pt-2">
                        {demoAccounts.map((account) => (
                          <button
                            key={account.email}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              onQuickSwitchUser(account.email);
                            }}
                            className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-novaworks-blue"
                          >
                            <span className="truncate">{account.label}</span>
                            <span className="shrink-0 rounded-full bg-novaworks-lavender px-2 py-0.5 text-[9px] font-bold tracking-wide text-novaworks-navy">
                              {account.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {currentUser && (
        <>
          <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
            {navigation}
            <div className="mt-auto rounded-2xl border border-novaworks-lavender-strong/70 bg-novaworks-lavender/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-novaworks-navy">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-semibold">NovaWorks Workspace</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Your workspace is tailored to your {currentUser.role.toLowerCase()} role.
              </p>
            </div>
          </aside>

          {isMobileMenuOpen && (
            <div className="fixed inset-x-0 bottom-0 top-16 z-40 md:hidden">
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute inset-0 h-full w-full bg-novaworks-navy/30 backdrop-blur-[2px]"
              />
              <aside className="relative flex h-full w-[min(19rem,85vw)] flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-card">
                {navigation}
                <div className="mt-auto rounded-2xl border border-novaworks-lavender-strong/70 bg-novaworks-lavender/60 p-4">
                  <div className="mb-2 flex items-center gap-2 text-novaworks-navy">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-semibold">NovaWorks Workspace</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Your workspace is tailored to your {currentUser.role.toLowerCase()} role.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </>
      )}
    </>
  );
};

interface NavItemProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-novaworks-blue ${
      active
        ? 'bg-novaworks-lavender text-novaworks-navy shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-novaworks-navy'
    }`}
  >
    <span className={active ? 'text-novaworks-navy' : 'text-slate-400'}>{icon}</span>
    {label}
  </button>
);
