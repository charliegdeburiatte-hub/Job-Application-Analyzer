import * as XLSX from 'xlsx'
import type { HistoryEntry } from '../../App'

export function exportHistoryXlsx(entries: HistoryEntry[]): void {
  const headers = [
    'Date',
    'Job Title',
    'Company',
    'Score',
    'Recommendation',
    'Status',
    'Matched Skills',
    'Missing Skills',
    'Strengths',
    'Areas for Improvement',
    'Notes',
  ]

  const rows = entries.map(e => [
    new Date(e.date).toLocaleDateString('en-GB'),
    e.jobTitle,
    e.company,
    e.matchScore,
    e.recommendation,
    e.status ?? 'saved',
    e.analysis.matchDetails.matchedSkills.join(', '),
    e.analysis.matchDetails.missingSkills.join(', '),
    e.analysis.matchDetails.strengthAreas.join(', '),
    e.analysis.matchDetails.weakAreas.join(', '),
    e.notes ?? '',
  ])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Column widths
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 30 },  // Job Title
    { wch: 20 },  // Company
    { wch: 7 },   // Score
    { wch: 14 },  // Recommendation
    { wch: 12 },  // Status
    { wch: 40 },  // Matched Skills
    { wch: 40 },  // Missing Skills
    { wch: 40 },  // Strengths
    { wch: 40 },  // Areas for Improvement
    { wch: 30 },  // Notes
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Applications')

  XLSX.writeFile(wb, `job-applications-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
