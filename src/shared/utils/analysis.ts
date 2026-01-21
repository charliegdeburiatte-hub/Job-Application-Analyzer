import {
  JobData,
  CVProfile,
  Analysis,
  Recommendation,
  MatchDetails,
} from '../types';
import { COMMON_SKILLS, MATCH_THRESHOLDS, REQUIREMENT_KEYWORDS } from '../constants';
import { generateJobId } from './helpers';

// ============================================================================
// Skill Extraction
// ============================================================================

/**
 * Extract skills from job description text
 */
export function extractSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    // Create regex pattern that matches whole word boundaries
    const pattern = new RegExp(`\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

    if (pattern.test(normalizedText)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}

/**
 * Extract required skills from job description
 */
export function extractRequiredSkills(text: string): string[] {
  const allSkills = extractSkills(text);
  const requiredSkills: string[] = [];

  // Look for sections mentioning required/essential skills
  const lines = text.split('\n');
  let inRequiredSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering a required section
    if (REQUIREMENT_KEYWORDS.REQUIRED.some(keyword => lowerLine.includes(keyword))) {
      inRequiredSection = true;
      continue;
    }

    // Check if we're exiting required section
    if (REQUIREMENT_KEYWORDS.PREFERRED.some(keyword => lowerLine.includes(keyword))) {
      inRequiredSection = false;
      continue;
    }

    // Extract skills from this line if in required section
    if (inRequiredSection) {
      for (const skill of allSkills) {
        if (new RegExp(`\\b${skill}\\b`, 'i').test(line) && !requiredSkills.includes(skill)) {
          requiredSkills.push(skill);
        }
      }
    }
  }

  // If no required section found, assume first 50% of skills are required
  if (requiredSkills.length === 0) {
    return allSkills.slice(0, Math.ceil(allSkills.length / 2));
  }

  return requiredSkills;
}

/**
 * Extract preferred/nice-to-have skills
 */
export function extractPreferredSkills(text: string): string[] {
  const allSkills = extractSkills(text);
  const requiredSkills = extractRequiredSkills(text);

  // Preferred skills are those not in required list
  return allSkills.filter(skill => !requiredSkills.includes(skill));
}

// ============================================================================
// Skill Matching
// ============================================================================

/**
 * Fuzzy match two skill strings (handles variations like "React" vs "React.js")
 */
export function fuzzyMatchSkill(skill1: string, skill2: string): boolean {
  const s1 = skill1.toLowerCase().replace(/[.\-_\s]/g, '');
  const s2 = skill2.toLowerCase().replace(/[.\-_\s]/g, '');

  // Exact match after normalization
  if (s1 === s2) return true;

  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Common variations
  const variations: Record<string, string[]> = {
    javascript: ['js', 'ecmascript'],
    typescript: ['ts'],
    react: ['reactjs'],
    vue: ['vuejs'],
    node: ['nodejs'],
    postgres: ['postgresql'],
    kubernetes: ['k8s'],
    docker: ['containerization'],
  };

  for (const [base, vars] of Object.entries(variations)) {
    if ((s1 === base && vars.includes(s2)) || (s2 === base && vars.includes(s1))) {
      return true;
    }
  }

  return false;
}

/**
 * Match CV skills against job skills
 */
export function matchSkills(
  jobSkills: string[],
  cvSkills: string[]
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const jobSkill of jobSkills) {
    const isMatched = cvSkills.some(cvSkill => fuzzyMatchSkill(jobSkill, cvSkill));

    if (isMatched) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  }

  return { matched, missing };
}

// ============================================================================
// Recommendation Logic
// ============================================================================

/**
 * Generate recommendation based on match score and missing required skills
 */
export function getRecommendation(
  matchScore: number,
  missingRequiredCount: number,
  matchedSkillsCount: number
): Recommendation {
  // If missing more than 3 required skills, likely not a good fit
  if (missingRequiredCount > 3) {
    return 'pass';
  }

  // Strong match: high score, few missing required skills
  if (matchScore >= MATCH_THRESHOLDS.APPLY && matchedSkillsCount >= 5 && missingRequiredCount <= 1) {
    return 'apply';
  }

  // Decent match: medium score or some missing required skills
  if (matchScore >= MATCH_THRESHOLDS.MAYBE && matchedSkillsCount >= 3) {
    return 'maybe';
  }

  // Weak match
  return 'pass';
}

// ============================================================================
// Analysis Generation
// ============================================================================

/**
 * Generate strength areas based on matched skills
 */
function generateStrengths(matchedSkills: string[], cvProfile: CVProfile): string[] {
  const strengths: string[] = [];

  // Check for frontend strength
  const frontendSkills = ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'];
  const matchedFrontend = matchedSkills.filter(s => frontendSkills.some(f => fuzzyMatchSkill(s, f)));
  if (matchedFrontend.length >= 3) {
    strengths.push('Strong frontend development background');
  }

  // Check for backend strength
  const backendSkills = ['Node.js', 'Python', 'Java', 'Django', 'Express', 'SQL'];
  const matchedBackend = matchedSkills.filter(s => backendSkills.some(b => fuzzyMatchSkill(s, b)));
  if (matchedBackend.length >= 3) {
    strengths.push('Solid backend development experience');
  }

  // Check for full-stack
  if (matchedFrontend.length >= 2 && matchedBackend.length >= 2) {
    strengths.push('Full-stack development capabilities');
  }

  // Check for cloud/DevOps
  const cloudSkills = ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'];
  const matchedCloud = matchedSkills.filter(s => cloudSkills.some(c => fuzzyMatchSkill(s, c)));
  if (matchedCloud.length >= 2) {
    strengths.push('Cloud and DevOps experience');
  }

  // Add experience years if available
  if (cvProfile.experience.length > 0) {
    const totalYears = cvProfile.experience.length * 1.5; // Rough estimate
    if (totalYears >= 3) {
      strengths.push(`${Math.floor(totalYears)}+ years of professional experience`);
    }
  }

  return strengths.length > 0 ? strengths : ['Relevant technical skills'];
}

/**
 * Generate weakness areas based on missing skills
 */
function generateWeaknesses(missingRequiredSkills: string[]): string[] {
  if (missingRequiredSkills.length === 0) {
    return [];
  }

  const weaknesses: string[] = [];

  if (missingRequiredSkills.length === 1) {
    weaknesses.push(`Missing ${missingRequiredSkills[0]} experience`);
  } else if (missingRequiredSkills.length === 2) {
    weaknesses.push(`Missing ${missingRequiredSkills.join(' and ')} experience`);
  } else {
    weaknesses.push(`Missing ${missingRequiredSkills.length} required skills`);
  }

  return weaknesses;
}

/**
 * Calculate confidence score for the analysis
 */
function calculateConfidence(jobData: JobData, cvProfile: CVProfile): number {
  let confidence = 0.5; // Base confidence

  // Higher confidence if CV has detailed information
  if (cvProfile.skills.length > 5) confidence += 0.1;
  if (cvProfile.experience.length > 1) confidence += 0.1;

  // Higher confidence if job description is detailed
  if (jobData.description.length > 500) confidence += 0.1;
  if (jobData.requirements) confidence += 0.1;

  // Lower confidence if job description is very short
  if (jobData.description.length < 200) confidence -= 0.2;

  return Math.max(0, Math.min(1, confidence));
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze a job posting against a CV profile
 */
export function analyzeJob(jobData: JobData, cvProfile: CVProfile): Analysis {
  // Extract skills from job description
  const jobSkills = extractSkills(jobData.description);
  const requiredSkills = extractRequiredSkills(jobData.description);
  // const preferredSkills = extractPreferredSkills(jobData.description); // Phase 2

  // Normalize CV skills
  const cvSkills = cvProfile.skills.map(s => s.trim());

  // DEBUG LOGGING
  console.log('=== ANALYSIS DEBUG ===');
  console.log('Job description length:', jobData.description.length);
  console.log('Job skills found:', jobSkills.length, jobSkills);
  console.log('CV skills:', cvSkills.length, cvSkills);
  console.log('Required skills:', requiredSkills);

  // Match skills
  const { matched: matchedSkills, missing: missingSkills } = matchSkills(jobSkills, cvSkills);

  // Find missing required skills specifically
  const { missing: missingRequired } = matchSkills(requiredSkills, cvSkills);

  console.log('Matched skills:', matchedSkills);
  console.log('Missing skills:', missingSkills);
  console.log('=== END DEBUG ===');

  // Calculate match score
  const matchScore =
    jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 0;

  // Generate recommendation
  const recommendation = getRecommendation(
    matchScore,
    missingRequired.length,
    matchedSkills.length
  );

  // Build match details
  const matchDetails: MatchDetails = {
    matchedSkills,
    missingSkills,
    matchedExperience: [], // Phase 2: Experience matching
    strengthAreas: generateStrengths(matchedSkills, cvProfile),
    weakAreas: generateWeaknesses(missingRequired),
  };

  // Generate analysis
  const analysis: Analysis = {
    jobId: generateJobId(jobData.url),
    analyzedDate: new Date().toISOString(),
    matchScore,
    recommendation,
    matchDetails,
    confidence: calculateConfidence(jobData, cvProfile),
  };

  return analysis;
}
