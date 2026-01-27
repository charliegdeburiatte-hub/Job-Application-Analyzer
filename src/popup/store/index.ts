import { create } from 'zustand';
import {
  ViewTab,
  JobData,
  Analysis,
  AnalyzedJob,
  CVProfile,
  CVDocument,
  UserSettings,
  JobStatus,
} from '@/shared/types';
import {
  getLocalStorage,
  getSyncStorage,
  saveCVDocument,
  saveCVProfile,
  saveAnalyzedJob,
  updateSettings,
  getAnalyzedJobs,
  deleteAnalyzedJob,
  saveCurrentAnalysis,
  clearCurrentAnalysis as clearStoredAnalysis,
} from '@/shared';

// ============================================================================
// Store State Interface
// ============================================================================

interface PopupStore {
  // UI State
  currentTab: ViewTab;
  isLoading: boolean;
  error: string | null;

  // Current Job Analysis
  currentJob: JobData | null;
  currentAnalysis: Analysis | null;

  // CV Data
  cvDocument: CVDocument | null;
  cvProfile: CVProfile | null;

  // History
  analyzedJobs: Record<string, AnalyzedJob>;

  // Settings
  settings: UserSettings;

  // Actions
  setCurrentTab: (tab: ViewTab) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;

  setCurrentJob: (job: JobData | null) => void;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  clearCurrentAnalysis: () => Promise<void>;

  saveCVData: (cvDoc: CVDocument, cvProf: CVProfile) => Promise<void>;
  loadCVData: () => Promise<void>;

  loadAnalyzedJobs: () => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus, notes?: string) => Promise<void>;
  removeJob: (jobId: string) => Promise<void>;

  updateUserSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;

  init: () => Promise<void>;
}

// ============================================================================
// Zustand Store
// ============================================================================

export const usePopupStore = create<PopupStore>((set, get) => ({
  // Initial State
  currentTab: 'analysis',
  isLoading: false,
  error: null,
  currentJob: null,
  currentAnalysis: null,
  cvDocument: null,
  cvProfile: null,
  analyzedJobs: {},
  settings: {
    autoDetect: true,
    minimumMatchPercentage: 70,
    enabledJobSites: ['linkedin', 'indeed', 'reed'],
    popupBehavior: 'auto-popup',
    analysisDetail: 'detailed',
    showNotifications: true,
    retentionDays: 90,
    themeMode: 'light',
    popupSize: 'medium',
  },

  // UI Actions
  setCurrentTab: (tab: ViewTab) => set({ currentTab: tab }),

  setError: (error: string | null) => set({ error }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  // Job Analysis Actions
  setCurrentJob: (job: JobData | null) => {
    set({ currentJob: job });
    const { currentAnalysis } = get();
    // Persist to storage whenever currentJob is updated
    saveCurrentAnalysis(job, currentAnalysis).catch(console.error);
  },

  setCurrentAnalysis: (analysis: Analysis | null) => {
    set({ currentAnalysis: analysis });
    const { currentJob } = get();
    // Persist to storage whenever currentAnalysis is updated
    saveCurrentAnalysis(currentJob, analysis).catch(console.error);
  },

  clearCurrentAnalysis: async () => {
    try {
      await clearStoredAnalysis();
      set({ currentJob: null, currentAnalysis: null });
    } catch (error) {
      console.error('[store] Failed to clear current analysis:', error);
    }
  },

  // CV Actions
  saveCVData: async (cvDoc: CVDocument, cvProf: CVProfile) => {
    try {
      set({ isLoading: true, error: null });

      await saveCVDocument(cvDoc);
      await saveCVProfile(cvProf);

      set({
        cvDocument: cvDoc,
        cvProfile: cvProf,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save CV';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  loadCVData: async () => {
    try {
      set({ isLoading: true, error: null });

      const localStorage = await getLocalStorage();
      const syncStorage = await getSyncStorage();

      set({
        cvDocument: localStorage.cvDocument,
        cvProfile: syncStorage.cvProfile,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load CV';
      set({ error: errorMessage, isLoading: false });
    }
  },

  // History Actions
  loadAnalyzedJobs: async () => {
    try {
      set({ isLoading: true, error: null });

      const jobs = await getAnalyzedJobs();

      set({
        analyzedJobs: jobs,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs';
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateJobStatus: async (jobId: string, status: JobStatus, notes?: string) => {
    try {
      const { analyzedJobs } = get();
      const job = analyzedJobs[jobId];

      if (!job) {
        throw new Error('Job not found');
      }

      const updatedJob: AnalyzedJob = {
        ...job,
        status,
        notes: notes !== undefined ? notes : job.notes,
        lastUpdated: new Date().toISOString(),
        applicationDate:
          status === 'applied' ? new Date().toISOString() : job.applicationDate,
      };

      await saveAnalyzedJob(jobId, updatedJob);

      set({
        analyzedJobs: {
          ...analyzedJobs,
          [jobId]: updatedJob,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeJob: async (jobId: string) => {
    try {
      await deleteAnalyzedJob(jobId);

      const { analyzedJobs } = get();
      const { [jobId]: removed, ...remaining } = analyzedJobs;

      set({ analyzedJobs: remaining });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Settings Actions
  updateUserSettings: async (newSettings: Partial<UserSettings>) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };

      await updateSettings(newSettings);

      set({ settings: updatedSettings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      set({ error: errorMessage });
      throw error;
    }
  },

  loadSettings: async () => {
    try {
      const syncStorage = await getSyncStorage();

      set({ settings: syncStorage.settings });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      set({ error: errorMessage });
    }
  },

  // Initialize store
  init: async () => {
    try {
      set({ isLoading: true, error: null });

      // Load all data in parallel
      const [localStorage, syncStorage, jobs] = await Promise.all([
        getLocalStorage(),
        getSyncStorage(),
        getAnalyzedJobs(),
      ]);

      set({
        cvDocument: localStorage.cvDocument,
        cvProfile: syncStorage.cvProfile,
        settings: syncStorage.settings,
        analyzedJobs: jobs,
        currentJob: localStorage.currentJob,
        currentAnalysis: localStorage.currentAnalysis,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
