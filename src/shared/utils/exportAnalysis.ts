/**
 * Export Analysis Utilities
 *
 * Provides functions to export job analysis history in multiple formats:
 * - JSON: Structured data with all fields
 * - CSV: Spreadsheet-compatible format
 * - Markdown: Human-readable report format
 */

import type { AnalyzedJob } from '../types';

/**
 * Export jobs to JSON format with pretty printing
 */
export function exportToJSON(jobs: AnalyzedJob[]): string {
  return JSON.stringify(jobs, null, 2);
}

/**
 * Export jobs to CSV format for spreadsheet applications
 */
export function exportToCSV(jobs: AnalyzedJob[]): string {
  if (jobs.length === 0) {
    return 'No jobs to export';
  }

  // CSV header
  const headers = [
    'Job Title',
    'Company',
    'URL',
    'Match Score',
    'Status',
    'Analyzed Date',
    'Application Date',
    'Matched Skills Count',
    'Missing Skills Count',
    'Strengths Count',
    'Gaps Count',
    'Notes'
  ];

  // Build CSV rows
  const rows = jobs.map(job => {
    const matchDetails = job.matchDetails;
    return [
      escapeCsvField(job.title),
      escapeCsvField(job.company),
      escapeCsvField(job.url),
      job.matchScore,
      job.status,
      job.analyzedDate,
      job.applicationDate || '',
      matchDetails.matchedSkills.length,
      matchDetails.missingSkills.length,
      matchDetails.strengthAreas.length,
      matchDetails.weakAreas.length,
      escapeCsvField(job.notes || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape special characters in CSV fields
 */
function escapeCsvField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Export jobs to Markdown format for human-readable reports
 */
export function exportToMarkdown(jobs: AnalyzedJob[]): string {
  if (jobs.length === 0) {
    return '# Job Application Analysis Report\n\nNo jobs analyzed yet.';
  }

  let markdown = '# Job Application Analysis Report\n\n';
  markdown += `**Total Jobs Analyzed:** ${jobs.length}\n`;
  markdown += `**Report Generated:** ${new Date().toLocaleDateString()}\n\n`;

  // Summary statistics
  const avgScore = Math.round(jobs.reduce((sum, job) => sum + job.matchScore, 0) / jobs.length);
  const statusCounts = jobs.reduce((counts, job) => {
    counts[job.status] = (counts[job.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  markdown += '## Summary\n\n';
  markdown += `- **Average Match Score:** ${avgScore}%\n`;
  markdown += `- **Status Breakdown:**\n`;
  Object.entries(statusCounts).forEach(([status, count]) => {
    markdown += `  - ${capitalizeFirst(status)}: ${count}\n`;
  });
  markdown += '\n---\n\n';

  // Individual job entries
  markdown += '## Job Details\n\n';
  jobs.forEach((job, index) => {
    markdown += `### ${index + 1}. ${job.title} at ${job.company}\n\n`;
    markdown += `- **Match Score:** ${job.matchScore}% ${getScoreEmoji(job.matchScore)}\n`;
    markdown += `- **Status:** ${capitalizeFirst(job.status)}\n`;
    markdown += `- **Analyzed:** ${new Date(job.analyzedDate).toLocaleDateString()}\n`;
    if (job.applicationDate) {
      markdown += `- **Applied:** ${new Date(job.applicationDate).toLocaleDateString()}\n`;
    }
    markdown += `- **URL:** ${job.url}\n\n`;

    // Skills breakdown
    const { matchedSkills, missingSkills, strengthAreas, weakAreas } = job.matchDetails;
    if (matchedSkills.length > 0) {
      markdown += `**✓ Matched Skills (${matchedSkills.length}):**\n`;
      markdown += `${matchedSkills.join(', ')}\n\n`;
    }

    if (missingSkills.length > 0) {
      markdown += `**✗ Missing Skills (${missingSkills.length}):**\n`;
      markdown += `${missingSkills.join(', ')}\n\n`;
    }

    if (strengthAreas.length > 0) {
      markdown += `**💪 Strengths:**\n`;
      strengthAreas.forEach(strength => {
        markdown += `- ${strength}\n`;
      });
      markdown += '\n';
    }

    if (weakAreas.length > 0) {
      markdown += `**⚠️ Gaps:**\n`;
      weakAreas.forEach(gap => {
        markdown += `- ${gap}\n`;
      });
      markdown += '\n';
    }

    // Notes
    if (job.notes) {
      markdown += `**Notes:** ${job.notes}\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown;
}

/**
 * Copy text to clipboard using Clipboard API
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('[exportAnalysis] Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard. Please try again.');
  }
}

/**
 * Trigger browser download of content as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string): void {
  try {
    // Create blob
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    // Create download link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[exportAnalysis] Failed to download file:', error);
    throw new Error('Failed to download file. Please try again.');
  }
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(format: 'json' | 'csv' | 'md'): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `job-analysis-${timestamp}.${format}`;
}

/**
 * Helper: Capitalize first letter of string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper: Get emoji for match score
 */
function getScoreEmoji(score: number): string {
  if (score >= 80) return '🎯';
  if (score >= 70) return '✅';
  if (score >= 50) return '⚠️';
  return '❌';
}
