/**
 * Enhanced CV Parser
 *
 * Supports DOCX and PDF formats with intelligent section detection,
 * context-aware skill extraction, and experience calculation.
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { COMMON_SKILLS } from '../constants';
import {
  SECTION_PATTERNS,
  PERSONAL_INFO_PATTERNS,
  DATE_PATTERNS,
} from '../constants/sectionPatterns';
import type { CVProfile } from '../types';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * CV Section structure after detection
 */
interface CVSections {
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  projects?: string;
  languages?: string;
  other: string;
}

/**
 * Parse DOCX file with enhanced HTML extraction
 */
export async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Extract HTML to preserve structure
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // Also get raw text for fallback
    const rawResult = await mammoth.extractRawText({ arrayBuffer });

    if (result.value && result.value.length > 100) {
      // Convert HTML to clean text while preserving structure
      const text = htmlToText(result.value);
      return text;
    }

    // Fallback to raw text
    return rawResult.value;
  } catch (error) {
    console.error('[cvParser] DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Parse PDF file and extract text
 */
export async function parsePdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Combine text items with proper spacing
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('[cvParser] PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. Ensure it is text-based, not scanned images.');
  }
}

/**
 * Convert HTML to plain text while preserving structure
 */
function htmlToText(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Add newlines after block elements
  const blockElements = temp.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, br');
  blockElements.forEach(el => {
    el.after(document.createTextNode('\n'));
  });

  // Get text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');

  return text.trim();
}

/**
 * Detect and extract CV sections from text
 */
export function detectSections(text: string): CVSections {
  const lines = text.split('\n');
  const sections: CVSections = { other: '' };

  let currentSection: keyof CVSections = 'other';
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      sectionContent.push('');
      continue;
    }

    // Check if this line is a section header
    const detectedSection = detectSectionHeader(line);

    if (detectedSection) {
      // Save previous section
      if (sectionContent.length > 0) {
        sections[currentSection] = (sections[currentSection] || '') + sectionContent.join('\n') + '\n';
        sectionContent = [];
      }

      // Start new section
      currentSection = detectedSection;
    } else {
      // Add line to current section
      sectionContent.push(line);
    }
  }

  // Save final section
  if (sectionContent.length > 0) {
    sections[currentSection] = (sections[currentSection] || '') + sectionContent.join('\n');
  }

  return sections;
}

/**
 * Detect if a line is a section header
 */
function detectSectionHeader(line: string): keyof CVSections | null {
  // Check each section pattern
  if (SECTION_PATTERNS.EXPERIENCE.some(pattern => pattern.test(line))) {
    return 'experience';
  }
  if (SECTION_PATTERNS.EDUCATION.some(pattern => pattern.test(line))) {
    return 'education';
  }
  if (SECTION_PATTERNS.SKILLS.some(pattern => pattern.test(line))) {
    return 'skills';
  }
  if (SECTION_PATTERNS.CERTIFICATIONS.some(pattern => pattern.test(line))) {
    return 'certifications';
  }
  if (SECTION_PATTERNS.SUMMARY.some(pattern => pattern.test(line))) {
    return 'summary';
  }
  if (SECTION_PATTERNS.PROJECTS.some(pattern => pattern.test(line))) {
    return 'projects';
  }
  if (SECTION_PATTERNS.LANGUAGES.some(pattern => pattern.test(line))) {
    return 'languages';
  }

  return null;
}

/**
 * Extract personal information from CV text
 */
export function extractPersonalInfo(text: string): CVProfile['personalInfo'] {
  const info: CVProfile['personalInfo'] = {};

  // Extract email
  const emailMatch = text.match(PERSONAL_INFO_PATTERNS.EMAIL);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Extract phone
  for (const phonePattern of PERSONAL_INFO_PATTERNS.PHONE) {
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      info.phone = phoneMatch[0];
      break;
    }
  }

  // Extract location (city, state/country)
  const locationMatch = text.match(PERSONAL_INFO_PATTERNS.LOCATION);
  if (locationMatch) {
    info.location = locationMatch[0];
  }

  // Extract name (first few words before email, if present)
  if (info.email) {
    const emailIndex = text.indexOf(info.email);
    const textBeforeEmail = text.substring(0, emailIndex).trim();
    const lines = textBeforeEmail.split('\n');
    // Take the last non-empty line before email as potential name
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && line.length < 50 && /^[A-Z]/.test(line)) {
        info.name = line;
        break;
      }
    }
  }

  return info;
}

/**
 * Extract experience entries from experience section
 */
export function extractExperience(experienceText: string): CVProfile['experience'] {
  if (!experienceText) return [];

  const experiences: CVProfile['experience'] = [];
  const lines = experienceText.split('\n').filter(l => l.trim());

  let currentExperience: Partial<CVProfile['experience'][0]> | null = null;
  let descriptionLines: string[] = [];

  for (const line of lines) {
    // Check if line looks like a job title or company (often in bold/caps)
    const isTitle = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line) ||
                    /^[A-Z\s]+$/.test(line);

    // Check if line contains date range
    const hasDateRange = DATE_PATTERNS.DATE_RANGE.test(line);

    if (isTitle || hasDateRange) {
      // Save previous experience
      if (currentExperience && currentExperience.title && currentExperience.company) {
        currentExperience.description = descriptionLines.join(' ').trim();
        experiences.push(currentExperience as CVProfile['experience'][0]);
        descriptionLines = [];
      }

      // Start new experience
      if (!currentExperience || (currentExperience.title && currentExperience.company)) {
        currentExperience = {
          title: '',
          company: '',
          duration: '',
          description: '',
        };
      }

      if (hasDateRange) {
        currentExperience.duration = line;
      } else if (!currentExperience.title) {
        currentExperience.title = line;
      } else if (!currentExperience.company) {
        currentExperience.company = line;
      }
    } else if (currentExperience) {
      // Add to description
      descriptionLines.push(line);
    }
  }

  // Save final experience
  if (currentExperience && currentExperience.title && currentExperience.company) {
    currentExperience.description = descriptionLines.join(' ').trim();
    experiences.push(currentExperience as CVProfile['experience'][0]);
  }

  return experiences;
}

/**
 * Extract education entries from education section
 */
export function extractEducation(educationText: string): CVProfile['education'] {
  if (!educationText) return [];

  const education: CVProfile['education'] = [];
  const lines = educationText.split('\n').filter(l => l.trim());

  let currentEdu: Partial<CVProfile['education'][0]> | null = null;

  for (const line of lines) {
    // Check if line contains a year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);

    // Check if line looks like a degree
    const isDegree = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)\b/i.test(line);

    if (isDegree || yearMatch) {
      // Save previous education
      if (currentEdu && currentEdu.degree && currentEdu.institution) {
        education.push(currentEdu as CVProfile['education'][0]);
      }

      // Start new education
      if (!currentEdu || (currentEdu.degree && currentEdu.institution)) {
        currentEdu = {
          degree: '',
          institution: '',
          year: '',
        };
      }

      if (isDegree) {
        currentEdu.degree = line;
      } else if (yearMatch) {
        currentEdu.year = yearMatch[0];
        if (!currentEdu.institution) {
          currentEdu.institution = line.replace(yearMatch[0], '').trim();
        }
      }
    } else if (currentEdu && !currentEdu.institution) {
      currentEdu.institution = line;
    }
  }

  // Save final education
  if (currentEdu && currentEdu.degree && currentEdu.institution) {
    education.push(currentEdu as CVProfile['education'][0]);
  }

  return education;
}

/**
 * Extract skills with context awareness
 * Skills found in experience/projects sections are weighted more heavily
 */
export function extractSkillsAdvanced(text: string, sections: CVSections): string[] {
  const skillsFound = new Set<string>();

  // Extract from skills section (if exists)
  if (sections.skills) {
    const skillsInSection = extractSkillsFromText(sections.skills);
    skillsInSection.forEach(skill => skillsFound.add(skill));
  }

  // Extract from experience section (high weight)
  if (sections.experience) {
    const skillsInExperience = extractSkillsFromText(sections.experience);
    skillsInExperience.forEach(skill => skillsFound.add(skill));
  }

  // Extract from projects section
  if (sections.projects) {
    const skillsInProjects = extractSkillsFromText(sections.projects);
    skillsInProjects.forEach(skill => skillsFound.add(skill));
  }

  // Extract from entire document as fallback
  if (skillsFound.size === 0) {
    const allSkills = extractSkillsFromText(text);
    allSkills.forEach(skill => skillsFound.add(skill));
  }

  return Array.from(skillsFound).sort();
}

/**
 * Extract skills from a text segment
 */
function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  // Check each skill in database
  for (const skill of COMMON_SKILLS) {
    const lowerSkill = skill.toLowerCase();
    // Use word boundary regex for accurate matching
    const regex = new RegExp(`\\b${escapeRegex(lowerSkill)}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

/**
 * Extract certifications from certifications section
 */
export function extractCertifications(certificationsText: string): string[] {
  if (!certificationsText) return [];

  const certifications: string[] = [];
  const lines = certificationsText.split('\n').filter(l => l.trim());

  for (const line of lines) {
    // Skip section headers
    if (SECTION_PATTERNS.CERTIFICATIONS.some(pattern => pattern.test(line))) {
      continue;
    }

    // Add non-empty lines as certifications
    if (line.length > 3) {
      certifications.push(line);
    }
  }

  return certifications;
}

/**
 * Calculate total years of experience from experience entries
 */
export function calculateExperienceYears(experiences: CVProfile['experience']): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;

  for (const exp of experiences) {
    const duration = exp.duration;
    if (!duration) continue;

    // Extract start and end years
    const yearMatches = duration.match(/\b(19|20)\d{2}\b/g);
    if (!yearMatches || yearMatches.length === 0) continue;

    const startYear = parseInt(yearMatches[0]);
    let endYear: number;

    if (DATE_PATTERNS.PRESENT.test(duration)) {
      endYear = new Date().getFullYear();
    } else if (yearMatches.length > 1) {
      endYear = parseInt(yearMatches[1]);
    } else {
      endYear = startYear;
    }

    const years = Math.max(0, endYear - startYear);
    totalMonths += years * 12;
  }

  // Convert to years, round to 1 decimal
  return Math.round((totalMonths / 12) * 10) / 10;
}

/**
 * Main parse function - detects format and routes to appropriate parser
 */
export async function parseCV(file: File): Promise<{ text: string; profile: CVProfile }> {
  const arrayBuffer = await file.arrayBuffer();
  let text: string;

  // Determine file type and parse
  if (file.name.endsWith('.pdf')) {
    text = await parsePdf(arrayBuffer);
  } else if (file.name.endsWith('.docx')) {
    text = await parseDocx(arrayBuffer);
  } else {
    throw new Error('Unsupported file format. Please upload .docx or .pdf file.');
  }

  // Validate minimum length
  if (text.length < 50) {
    throw new Error('CV content too short. Please ensure the file contains readable text.');
  }

  // Detect sections
  const sections = detectSections(text);

  // Extract components
  const personalInfo = extractPersonalInfo(text);
  const skills = extractSkillsAdvanced(text, sections);
  const experience = extractExperience(sections.experience || '');
  const education = extractEducation(sections.education || '');
  const certifications = extractCertifications(sections.certifications || '');
  const totalExperienceYears = calculateExperienceYears(experience);

  // Build profile
  const profile: CVProfile = {
    personalInfo,
    summary: sections.summary?.substring(0, 500),
    skills,
    experience,
    education,
    certifications,
    totalExperienceYears,
  };

  console.log('[cvParser] CV parsed successfully:', {
    skills: skills.length,
    experience: experience.length,
    education: education.length,
    certifications: certifications.length,
    totalYears: totalExperienceYears,
  });

  return { text, profile };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
