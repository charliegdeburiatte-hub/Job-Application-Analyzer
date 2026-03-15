import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
} from 'docx'
import type { Analysis, JobData } from '../types'
import { getRecommendationText } from '../utils/helpers'
import { downloadBlob } from '../utils/helpers'

interface AIResult {
  coverLetter: string
  addBullets: string[]
  removeBullets: string[]
}

export async function exportAnalysisDocx(params: {
  jobData: JobData
  analysis: Analysis
  aiResult?: AIResult | null
  notes?: string
}): Promise<void> {
  const { jobData, analysis, aiResult, notes } = params
  const { matchScore, recommendation, matchDetails, scoringBreakdown } = analysis

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  } as const

  const sections: Paragraph[] = []

  // ── Title ──
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'Job Application Analyser', bold: true, size: 36, color: '2d6a4f', font: 'Calibri' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Analysis Report  •  ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 18, color: '6b7280', font: 'Calibri' })],
      spacing: { after: 300 },
    }),
  )

  // ── Job Details ──
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: jobData.title, bold: true, size: 28, font: 'Calibri' })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: jobData.company, size: 22, color: '4b5563', font: 'Calibri' }),
        ...(jobData.location ? [new TextRun({ text: `  •  ${jobData.location}`, size: 22, color: '4b5563', font: 'Calibri' })] : []),
      ],
      spacing: { after: 200 },
    }),
  )

  // ── Score & Recommendation ──
  const scoreColor = matchScore >= 70 ? '16a34a' : matchScore >= 50 ? 'ca8a04' : 'dc2626'
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${matchScore}%`, bold: true, size: 40, color: scoreColor, font: 'Calibri' }),
        new TextRun({ text: `    ${getRecommendationText(recommendation)}`, bold: true, size: 24, font: 'Calibri' }),
      ],
      spacing: { after: 200 },
    }),
  )

  // Build full document children (Paragraphs + Tables)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = [...sections]

  // ── Scoring Breakdown ──
  if (scoringBreakdown) {
    children.push(
      new Paragraph({ text: 'Scoring Breakdown', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
    )

    const rows = [
      ['Base Score', `${analysis.baseScore}%`],
      ['Experience Bonus', `+${scoringBreakdown.experienceBonus}`],
      ['Required Skills', `${scoringBreakdown.requiredMatched} / ${scoringBreakdown.requiredTotal} (3× weight)`],
      ['Preferred Skills', `${scoringBreakdown.preferredMatched} / ${scoringBreakdown.preferredTotal} (1× weight)`],
      ['Final Score', `${matchScore}%`],
    ]

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map(([label, value], i) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, size: 20, color: '4b5563', font: 'Calibri' })], spacing: { before: 40, after: 40 } })],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noBorder,
                shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: 'f3f4f6' } : undefined,
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: value, bold: true, size: 20, font: 'Calibri' })], alignment: AlignmentType.RIGHT, spacing: { before: 40, after: 40 } })],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noBorder,
                shading: i % 2 === 0 ? { type: ShadingType.SOLID, color: 'f3f4f6' } : undefined,
              }),
            ],
          }),
        ),
      }),
    )
  }

  // ── Skills sections ──
  const addSkillSection = (title: string, skills: string[], color: string) => {
    if (skills.length === 0) return
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${title} (${skills.length})`, bold: true, size: 22, color, font: 'Calibri' })],
        spacing: { before: 300, after: 100 },
      }),
    )
    skills.forEach(skill => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `•  ${skill}`, size: 20, font: 'Calibri' })],
          spacing: { after: 40 },
          indent: { left: 360 },
        }),
      )
    })
  }

  addSkillSection('Matched Skills', matchDetails.matchedSkills, '16a34a')
  addSkillSection('Missing Skills', matchDetails.missingSkills, 'dc2626')

  // ── Strengths & Gaps ──
  const addBulletSection = (title: string, items: string[], color: string) => {
    if (items.length === 0) return
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 22, color, font: 'Calibri' })],
        spacing: { before: 300, after: 100 },
      }),
    )
    items.forEach(item => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `•  ${item}`, size: 20, font: 'Calibri' })],
          spacing: { after: 60 },
          indent: { left: 360 },
        }),
      )
    })
  }

  addBulletSection('Your Strengths', matchDetails.strengthAreas, '16a34a')
  addBulletSection('Areas for Improvement', matchDetails.weakAreas, 'ca8a04')

  // ── Cover Letter ──
  if (aiResult?.coverLetter) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Cover Letter', bold: true, size: 24, color: '2d6a4f', font: 'Calibri' })],
        spacing: { before: 400, after: 200 },
      }),
    )
    // Split by double newlines for paragraphs
    aiResult.coverLetter.split(/\n\n+/).forEach(para => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.replace(/\n/g, ' '), size: 22, font: 'Calibri' })],
          spacing: { after: 160 },
        }),
      )
    })
  }

  // ── CV Suggestions ──
  if (aiResult && aiResult.addBullets.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'CV Bullet Points to Add', bold: true, size: 24, color: '2d6a4f', font: 'Calibri' })],
        spacing: { before: 400, after: 100 },
      }),
    )
    aiResult.addBullets.forEach(bullet => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `+  ${bullet}`, size: 20, color: '16a34a', font: 'Calibri' })],
          spacing: { after: 60 },
          indent: { left: 360 },
        }),
      )
    })
  }

  if (aiResult && aiResult.removeBullets.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Consider Removing or Downplaying', bold: true, size: 24, color: 'ca8a04', font: 'Calibri' })],
        spacing: { before: 300, after: 100 },
      }),
    )
    aiResult.removeBullets.forEach(bullet => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `−  ${bullet}`, size: 20, color: 'ca8a04', font: 'Calibri' })],
          spacing: { after: 60 },
          indent: { left: 360 },
        }),
      )
    })
  }

  // ── Notes ──
  if (notes) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Notes', bold: true, size: 22, font: 'Calibri' })],
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: notes, size: 20, color: '4b5563', font: 'Calibri' })],
      }),
    )
  }

  // ── Footer ──
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Generated by Job Application Analyser  •  All analysis runs locally in your browser', size: 16, color: '9ca3af', font: 'Calibri' })],
      spacing: { before: 400 },
    }),
  )

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `job-analysis-${jobData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`
  downloadBlob(blob, filename)
}
