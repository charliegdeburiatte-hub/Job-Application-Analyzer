// ============================================================================
// CV & Profile Types
// ============================================================================

export interface CVDocument {
  fileName: string;
  uploadDate: string;
  docxBase64: string;
  extractedText: string;
  fileSize: number;
}

export interface CVProfile {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    technologies?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade?: string;
  }>;
  certifications: string[];
  languages?: string[];
  totalExperienceYears?: number;
}

// ============================================================================
// Job Data Types
// ============================================================================

export type JobSource = 'linkedin' | 'indeed' | 'reed';

export interface JobData {
  url: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements?: string;
  postedDate?: string;
  salary?: string;
  jobType?: string;
  source?: JobSource; // Optional for test purposes
}

// ============================================================================
// Analysis Types
// ============================================================================

export type Recommendation = 'apply' | 'maybe' | 'pass';

export interface MatchDetails {
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  strengthAreas: string[];
  weakAreas: string[];
}

export interface Analysis {
  jobId: string;
  analyzedDate: string;
  matchScore: number;
  baseScore?: number;
  bonusPoints?: number;
  recommendation: Recommendation;
  matchDetails: MatchDetails;
  confidence: number;
  scoringBreakdown?: {
    requiredMatched: number;
    requiredTotal: number;
    preferredMatched: number;
    preferredTotal: number;
    experienceBonus: number;
    weightedScore: number;
  };
}

// ============================================================================
// Job Tracking Types
// ============================================================================

export type JobStatus =
  | 'analyzed'
  | 'applied'
  | 'rejected'
  | 'interviewing'
  | 'offer'
  | 'accepted';

export interface AnalyzedJob {
  jobId: string;
  url: string;
  title: string;
  company: string;
  analyzedDate: string;
  matchScore: number;
  status: JobStatus;
  matchDetails: MatchDetails;
  notes?: string;
  applicationDate?: string;
  lastUpdated: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export type PopupBehavior = 'badge' | 'auto-popup' | 'icon-only';
export type AnalysisDetail = 'quick' | 'detailed';
export type ThemeMode = 'light' | 'dark';

export interface UserSettings {
  autoDetect: boolean;
  minimumMatchPercentage: number;
  enabledJobSites: JobSource[];
  popupBehavior: PopupBehavior;
  analysisDetail: AnalysisDetail;
  showNotifications: boolean;
  retentionDays: number;
  themeMode: ThemeMode;
  popupSize: 'small' | 'medium' | 'large';
}

// ============================================================================
// Storage Schema Types
// ============================================================================

export interface LocalStorage {
  cvDocument: CVDocument | null;
  analyzedJobs: Record<string, AnalyzedJob>;
  currentJob: JobData | null;
  currentAnalysis: Analysis | null;
}

export interface SyncStorage {
  cvProfile: CVProfile | null;
  settings: UserSettings;
}

// ============================================================================
// Message Passing Types
// ============================================================================

export type ExtensionMessage =
  | { type: 'JOB_DETECTED'; payload: { url: string; title: string; source: JobSource } }
  | { type: 'ANALYZE_JOB'; payload: { jobData: JobData } }
  | { type: 'ANALYSIS_COMPLETE'; payload: { analysis: Analysis } }
  | { type: 'UPDATE_STATUS'; payload: { jobId: string; status: JobStatus } }
  | { type: 'UPDATE_BADGE'; payload: { score: number } }
  | { type: 'GET_CURRENT_JOB'; payload?: never }
  | { type: 'SAVE_CV'; payload: { cvDocument: CVDocument; cvProfile: CVProfile } }
  | { type: 'UPDATE_SETTINGS'; payload: { settings: Partial<UserSettings> } }
  | { type: 'GET_ANALYZED_JOBS'; payload?: never }
  | { type: 'DELETE_JOB'; payload: { jobId: string } };

// ============================================================================
// Job Detection Types
// ============================================================================

export type DetectionMethod = 'url-pattern' | 'content-analysis' | 'user-triggered';

export interface DetectionResult {
  isJob: boolean;
  confidence: number;
  method: DetectionMethod;
  site?: JobSource;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ViewTab = 'analysis' | 'history' | 'cv' | 'settings';

export interface PopupState {
  currentTab: ViewTab;
  isLoading: boolean;
  error: string | null;
  currentJob: JobData | null;
  currentAnalysis: Analysis | null;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ErrorState {
  message: string;
  code?: string;
  timestamp: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
