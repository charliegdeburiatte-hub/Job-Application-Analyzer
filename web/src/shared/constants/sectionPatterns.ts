/**
 * Section Detection Patterns for CV Parsing
 *
 * These regex patterns identify common CV sections across different formats and languages.
 * Each section has multiple variations to handle different CV styles.
 */

export const SECTION_PATTERNS = {
  // Experience section headers
  EXPERIENCE: [
    /^\s*(professional\s+)?experience\s*$/i,
    /^\s*work\s+(history|experience)\s*$/i,
    /^\s*employment\s+(history|record)\s*$/i,
    /^\s*career\s+(history|summary)\s*$/i,
    /^\s*professional\s+background\s*$/i,
    /^\s*work\s*$/i,
  ],

  // Education section headers
  EDUCATION: [
    /^\s*education\s*$/i,
    /^\s*academic\s+(background|qualifications)\s*$/i,
    /^\s*educational\s+background\s*$/i,
    /^\s*qualifications\s*$/i,
    /^\s*degrees?\s*$/i,
  ],

  // Skills section headers
  SKILLS: [
    /^\s*(technical\s+)?skills\s*$/i,
    /^\s*core\s+(competencies|skills)\s*$/i,
    /^\s*competencies\s*$/i,
    /^\s*areas\s+of\s+expertise\s*$/i,
    /^\s*technical\s+proficienc(y|ies)\s*$/i,
    /^\s*key\s+skills\s*$/i,
  ],

  // Certifications section headers
  CERTIFICATIONS: [
    /^\s*certifications?\s*$/i,
    /^\s*professional\s+certifications?\s*$/i,
    /^\s*licenses?\s+(and\s+certifications?)?\s*$/i,
    /^\s*credentials\s*$/i,
  ],

  // Summary/Objective section headers
  SUMMARY: [
    /^\s*(professional\s+)?(summary|profile)\s*$/i,
    /^\s*career\s+(objective|summary)\s*$/i,
    /^\s*objective\s*$/i,
    /^\s*about\s+(me|myself)\s*$/i,
    /^\s*executive\s+summary\s*$/i,
  ],

  // Projects section headers
  PROJECTS: [
    /^\s*projects?\s*$/i,
    /^\s*key\s+projects?\s*$/i,
    /^\s*notable\s+projects?\s*$/i,
    /^\s*portfolio\s*$/i,
  ],

  // Languages section headers
  LANGUAGES: [
    /^\s*languages?\s*$/i,
    /^\s*language\s+proficienc(y|ies)\s*$/i,
    /^\s*linguistic\s+skills\s*$/i,
  ],
};

/**
 * Patterns for extracting personal information
 */
export const PERSONAL_INFO_PATTERNS = {
  // Email pattern
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,

  // Phone patterns (various formats)
  PHONE: [
    /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,  // US/UK formats
    /\b\+?\d{1,4}[-.\s]?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,5}\b/,     // International
  ],

  // LinkedIn URL
  LINKEDIN: /linkedin\.com\/in\/[\w-]+/i,

  // GitHub URL
  GITHUB: /github\.com\/[\w-]+/i,

  // Location patterns (city, country)
  LOCATION: /\b[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/,
};

/**
 * Patterns for date extraction
 */
export const DATE_PATTERNS = {
  // Month Year format (Jan 2020, January 2020)
  MONTH_YEAR: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/gi,

  // Year only (2020, 2019-2021)
  YEAR: /\b(19|20)\d{2}\b/g,

  // Date range (2019-2021, 2019-Present)
  DATE_RANGE: /\b(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|Present|Current|Now)\b/gi,

  // Month-Year range (Sep 2021 – Mar 2022, Jan 2020 – Present)
  MONTH_YEAR_RANGE: /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\s*[-–—]\s*((Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present|Current|Now)\b/gi,

  // Present/Current indicators
  PRESENT: /\b(Present|Current|Now|Today)\b/i,
};

/**
 * Section delimiters - common patterns that indicate section boundaries
 */
export const SECTION_DELIMITERS = {
  // Lines of repeated characters (====, ----, etc.)
  SEPARATOR: /^[-=_*]{3,}$/,

  // All caps headers
  ALL_CAPS_HEADER: /^[A-Z\s]{3,}$/,

  // Bullet points
  BULLET: /^\s*[•●○■□▪▫–—*]\s+/,

  // Numbered lists
  NUMBERED: /^\s*\d+[\.)]\s+/,
};

/**
 * Skill indicators - patterns that suggest a line contains skills
 */
export const SKILL_INDICATORS = {
  // Comma-separated list
  COMMA_SEPARATED: /^[^,]+(?:,\s*[^,]+){2,}$/,

  // Pipe-separated list
  PIPE_SEPARATED: /\|/,

  // Multiple technical terms
  TECHNICAL_DENSITY: /\b(JavaScript|Python|Java|SQL|AWS|Docker|React|Node|API|Database|Cloud)\b/gi,
};
