import { JobSource, DetectionResult } from '../types';
import { JOB_PATTERNS } from '../constants';

// ============================================================================
// Job ID Generation
// ============================================================================

/**
 * Generate a unique job ID from URL using simple hash
 */
export function generateJobId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `job_${Math.abs(hash).toString(36)}`;
}

// ============================================================================
// Job Detection
// ============================================================================

/**
 * Check if URL matches job page patterns
 */
export function isJobPage(url: string): DetectionResult {
  for (const [site, pattern] of Object.entries(JOB_PATTERNS)) {
    if (pattern.test(url)) {
      return {
        isJob: true,
        confidence: 1,
        method: 'url-pattern',
        site: site as JobSource,
      };
    }
  }

  return {
    isJob: false,
    confidence: 0,
    method: 'url-pattern',
  };
}

/**
 * Normalize URL to remove query parameters and fragments
 */
export function normalizeJobUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Keep only origin + pathname, remove query and hash
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format ISO date string to readable format
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Format date to short format (e.g., "Jan 15, 2026")
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// File Handling
// ============================================================================

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:application/vnd...;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Text Processing
// ============================================================================

/**
 * Truncate text to maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extract company name from LinkedIn URL
 */
export function extractCompanyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('linkedin.com')) {
      // Try to extract from URL path
      const match = url.match(/\/company\/([^\/]+)/);
      return match ? match[1].replace(/-/g, ' ') : null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Clean text by removing extra whitespace
 */
export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Deduplicate array of strings (case-insensitive)
 */
export function deduplicateStrings(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    const lower = item.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
}

/**
 * Sort strings alphabetically (case-insensitive)
 */
export function sortStringsAlpha(arr: string[]): string[] {
  return [...arr].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// ============================================================================
// Storage Size Formatting
// ============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if string is valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Get color class based on match score
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-success-600';
  if (score >= 50) return 'text-warning-600';
  return 'text-danger-600';
}

/**
 * Get background color class based on match score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 70) return 'bg-success-100';
  if (score >= 50) return 'bg-warning-100';
  return 'bg-danger-100';
}

/**
 * Get recommendation emoji
 */
export function getRecommendationEmoji(recommendation: 'apply' | 'maybe' | 'pass'): string {
  switch (recommendation) {
    case 'apply':
      return '✅';
    case 'maybe':
      return '⚠️';
    case 'pass':
      return '❌';
  }
}

/**
 * Get recommendation text
 */
export function getRecommendationText(recommendation: 'apply' | 'maybe' | 'pass'): string {
  switch (recommendation) {
    case 'apply':
      return 'Strong Fit - Apply!';
    case 'maybe':
      return 'Possible Fit - Consider';
    case 'pass':
      return 'Weak Fit - Pass';
  }
}
