import { create } from 'zustand';
import { UserProfile, ResumeVersion, Application } from '../types';
import {
  getResumeVersions,
  getApplications,
  createApplication,
  updateApplicationStatusApi,
  updateApplicationApi,
  deleteApplicationApi,
} from '../services/api';
import { getToken, clearToken } from '../services/apiClient';

interface AppState {
  user: UserProfile | null;
  resumes: ResumeVersion[];
  activeResumeId: string;
  applications: Application[];
  activeTab: string;
  activeSubView: string;
  bootstrapped: boolean;

  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  bootstrap: () => Promise<void>;
  setActiveTab: (tab: string, subView?: string) => void;
  setActiveResumeId: (id: string) => void;

  addResume: (resume: ResumeVersion) => void;
  updateResume: (resume: ResumeVersion) => void;

  addApplication: (app: Omit<Application, 'id'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  updateApplication: (app: Application) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  resumes: [],
  activeResumeId: '',
  applications: [],
  activeTab: 'dashboard',
  activeSubView: 'upload',
  bootstrapped: false,

  setUser: (user) => set({ user }),

  logout: () => {
    clearToken();
    set({ user: null, resumes: [], applications: [], activeResumeId: '', bootstrapped: false });
  },

  // Called once right after login/signup — pulls the user's real resumes and
  // applications from the backend so the dashboard isn't empty on first paint
  bootstrap: async () => {
    if (!getToken()) return;
    try {
      const [resumes, applications] = await Promise.all([getResumeVersions(), getApplications()]);
      set({
        resumes,
        applications,
        activeResumeId: resumes[0]?.id || '',
        bootstrapped: true,
      });
    } catch (err) {
      console.error('Failed to bootstrap user data', err);
      set({ bootstrapped: true });
    }
  },

  setActiveTab: (tab, subView = 'default') => set({ activeTab: tab, activeSubView: subView }),

  setActiveResumeId: (id) => set({ activeResumeId: id }),

  addResume: (resume) => set((state) => ({
    resumes: [resume, ...state.resumes],
    activeResumeId: resume.id
  })),

  updateResume: (updatedResume) => set((state) => ({
    resumes: state.resumes.map((r) => r.id === updatedResume.id ? updatedResume : r)
  })),

  addApplication: async (newApp) => {
    const created = await createApplication(newApp);
    set((state) => ({ applications: [created, ...state.applications] }));
  },

  updateApplicationStatus: async (id, status) => {
    // Optimistic update first — the Kanban drag should feel instant
    set((state) => ({
      applications: state.applications.map((app) => app.id === id ? { ...app, status } : app)
    }));
    try {
      await updateApplicationStatusApi(id, status);
    } catch (err) {
      console.error('Failed to persist status change', err);
    }
  },

  updateApplication: async (updatedApp) => {
    const saved = await updateApplicationApi(updatedApp);
    set((state) => ({
      applications: state.applications.map((app) => app.id === saved.id ? saved : app)
    }));
  },

  deleteApplication: async (id) => {
    set((state) => ({ applications: state.applications.filter((app) => app.id !== id) }));
    try {
      await deleteApplicationApi(id);
    } catch (err) {
      console.error('Failed to delete on server', err);
    }
  },
}));
