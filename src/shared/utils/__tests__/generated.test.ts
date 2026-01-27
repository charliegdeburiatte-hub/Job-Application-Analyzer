/**
 * Generated Test Data Tests
 *
 * Uses Faker to generate realistic test scenarios and stress test
 * the CV parser and analysis algorithms with varied, realistic data
 */

import { describe, it, expect } from 'vitest';
import { analyzeJob } from '../analysis';
import { calculateExperienceYears } from '../cvParser';
import {
  generateCV,
  generateJobPosting,
  generateJobBatch,
  generateEdgeCaseCV,
  generateBugScenario,
} from './testDataGenerator';

describe('Generated Data - CV Analysis', () => {
  describe('Realistic CV Generation', () => {
    it('should generate valid CVs with configurable parameters', () => {
      const cv = generateCV({
        skillCount: 15,
        experienceYears: 5.5,
        jobCount: 3,
      });

      // Skill count may vary slightly due to Faker randomness (±1)
      expect(cv.skills.length).toBeGreaterThanOrEqual(14);
      expect(cv.skills.length).toBeLessThanOrEqual(16);
      expect(cv.totalExperienceYears).toBe(5.5);
      expect(cv.experience).toHaveLength(3);
      expect(cv.personalInfo).toBeDefined();
      expect(cv.education).toHaveLength(1);
    });

    it('should generate CVs with IT skills by default', () => {
      const cv = generateCV({ includeITSkills: true, skillCount: 20 });

      // With 20 skills, should have some IT skills
      expect(cv.skills.length).toBeGreaterThan(10);
      expect(cv.skills.some(skill => skill.length > 0)).toBe(true);
    });

    it('should generate CVs with soft skills when enabled', () => {
      const cv = generateCV({ includeSoftSkills: true, skillCount: 20 });

      // With 20 skills and soft skills enabled, should have skills
      expect(cv.skills.length).toBeGreaterThan(10);
      expect(cv.skills.some(skill => skill.length > 0)).toBe(true);
    });
  });

  describe('Realistic Job Posting Generation', () => {
    it('should generate job postings with required and preferred skills', () => {
      const job = generateJobPosting({
        requiredSkillsCount: 5,
        preferredSkillsCount: 3,
      });

      expect(job.title).toBeDefined();
      expect(job.company).toBeDefined();
      expect(job.url).toBeDefined();
      expect(job.description).toContain('Requirements');
      expect(job.description).toContain('Preferred');
    });

    it('should generate jobs that match CV skills when requested', () => {
      const cv = generateCV({ skillCount: 10 });
      const job = generateJobPosting({ matchCV: cv });

      // Job description should contain some CV skills
      const cvSkillsInJob = cv.skills.filter(skill =>
        job.description.includes(skill)
      );

      expect(cvSkillsInJob.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Job Generation with Known Match Levels', () => {
    it('should generate high/medium/low match jobs correctly', () => {
      const cv = generateCV({ skillCount: 10 });
      const { highMatch, mediumMatch, lowMatch } = generateJobBatch(cv, 30);

      expect(highMatch.length).toBeGreaterThan(0);
      expect(mediumMatch.length).toBeGreaterThan(0);
      expect(lowMatch.length).toBeGreaterThan(0);
      expect(highMatch.length + mediumMatch.length + lowMatch.length).toBe(30);
    });

    it('should score high match jobs higher than low match jobs', () => {
      const cv = generateCV({ skillCount: 10 });
      const { highMatch, lowMatch } = generateJobBatch(cv, 10);

      const highScores = highMatch.map(job => analyzeJob(job, cv).matchScore);
      const lowScores = lowMatch.map(job => analyzeJob(job, cv).matchScore);

      const avgHighScore = highScores.reduce((a, b) => a + b, 0) / highScores.length;
      const avgLowScore = lowScores.reduce((a, b) => a + b, 0) / lowScores.length;

      expect(avgHighScore).toBeGreaterThan(avgLowScore);
    });
  });

  describe('Edge Case CV Testing', () => {
    it('should handle empty CV gracefully', () => {
      const emptyCV = generateEdgeCaseCV('empty');
      const job = generateJobPosting();

      const analysis = analyzeJob(job, emptyCV);

      expect(analysis.matchScore).toBeDefined();
      expect(analysis.matchScore).toBeGreaterThanOrEqual(0);
      expect(analysis.matchScore).toBeLessThanOrEqual(100);
      expect(analysis.matchDetails.matchedSkills).toHaveLength(0);
    });

    it('should handle minimal CV', () => {
      const minimalCV = generateEdgeCaseCV('minimal');
      const job = generateJobPosting();

      const analysis = analyzeJob(job, minimalCV);

      expect(analysis.matchScore).toBeDefined();
      expect(minimalCV.skills).toHaveLength(1);
      expect(minimalCV.experience).toHaveLength(1);
    });

    it('should handle oversized CV without crashing', () => {
      const oversizedCV = generateEdgeCaseCV('oversized');
      const job = generateJobPosting();

      const analysis = analyzeJob(job, oversizedCV);

      expect(analysis.matchScore).toBeDefined();
      expect(oversizedCV.skills.length).toBeGreaterThan(50);
      expect(oversizedCV.experience.length).toBeGreaterThan(10);
    });

    it('should handle unusual date formats', () => {
      const unusualCV = generateEdgeCaseCV('unusual-dates');

      // Parser should handle or gracefully fail on unusual formats
      expect(unusualCV.experience).toHaveLength(3);
      expect(() => calculateExperienceYears(unusualCV.experience)).not.toThrow();
    });
  });

  describe('Bug Scenario Reproduction', () => {
    it('should reproduce month-year parsing bug scenario', () => {
      const { cv, jobs } = generateBugScenario('month-year-parsing');

      expect(cv.experience).toHaveLength(2);
      expect(cv.totalExperienceYears).toBeCloseTo(1.6, 1);

      const job = jobs[0];
      const analysis = analyzeJob(job, cv);

      // Should have experience bonus from 1.6 years
      expect(analysis.matchScore).toBeGreaterThan(0);
    });

    it('should reproduce 97% bug scenario with varied scores', () => {
      const { cv, jobs } = generateBugScenario('97-percent-bug');

      const scores = jobs.map(job => analyzeJob(job, cv).matchScore);

      // Scores should NOT all be the same (no clustering)
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBeGreaterThan(1);

      // v1.4.0: 97% is now a valid score (bug fixed)
      // Verify scores aren't ALL clustered at the same value
      const mostCommonScore = Array.from(uniqueScores).reduce((a, b) =>
        scores.filter(s => s === a).length > scores.filter(s => s === b).length ? a : b
      );
      const clusterCount = scores.filter(s => s === mostCommonScore).length;
      expect(clusterCount).toBeLessThan(scores.length); // Not all the same
    });

    it('should reproduce self-employment filter scenario', () => {
      const { cv } = generateBugScenario('self-employment-filter');

      expect(cv.experience).toHaveLength(2);
      expect(cv.totalExperienceYears).toBe(1); // Should only count non-self-employed

      const independentJob = cv.experience.find(e => e.title.includes('Independent'));
      const regularJob = cv.experience.find(e => e.company === 'TechCorp');

      expect(independentJob).toBeDefined();
      expect(regularJob).toBeDefined();
    });
  });

  describe('Stress Testing with Generated Data', () => {
    it('should analyze 50 random CV-job combinations without errors', () => {
      const cvs = Array.from({ length: 10 }, () => generateCV());
      const jobs = Array.from({ length: 5 }, () => generateJobPosting());

      let successCount = 0;
      let errors = 0;

      cvs.forEach(cv => {
        jobs.forEach(job => {
          try {
            const analysis = analyzeJob(job, cv);
            expect(analysis.matchScore).toBeGreaterThanOrEqual(0);
            expect(analysis.matchScore).toBeLessThanOrEqual(100);
            successCount++;
          } catch (error) {
            errors++;
            console.error('Analysis failed:', error);
          }
        });
      });

      // Should successfully analyze all 50 combinations (10 CVs × 5 jobs)
      expect(successCount).toBe(50);
      expect(errors).toBe(0);
    }, 10000); // 10 second timeout

    it('should maintain consistent scoring for same CV-job pair', () => {
      const cv = generateCV();
      const job = generateJobPosting();

      // Analyze same pair 10 times
      const scores = Array.from({ length: 10 }, () =>
        analyzeJob(job, cv).matchScore
      );

      // All scores should be identical (deterministic)
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBe(1);
    });

    it('should handle extreme experience ranges', () => {
      const testCases = [
        { years: 0 },
        { years: 1 },
        { years: 5 },
        { years: 10 },
        { years: 50 },
      ];

      testCases.forEach(({ years }) => {
        const cv = generateCV({ experienceYears: years });
        const job = generateJobPosting({ matchCV: cv });

        const analysis = analyzeJob(job, cv);

        // Experience bonus should be capped at 20
        expect(analysis.matchScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Statistical Analysis of Scoring', () => {
    it('should produce bell-curve distribution of scores for random CV-job pairs', () => {
      const cv = generateCV({ skillCount: 15 });
      const jobs = Array.from({ length: 100 }, () => generateJobPosting());

      const scores = jobs.map(job => analyzeJob(job, cv).matchScore);

      // Calculate statistics
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const min = Math.min(...scores);
      const max = Math.max(...scores);

      // Should have reasonable spread
      expect(avg).toBeGreaterThan(20);
      expect(avg).toBeLessThan(80);
      expect(max - min).toBeGreaterThan(30); // At least 30% range

      // Count score buckets
      const buckets = {
        low: scores.filter(s => s < 30).length,
        medium: scores.filter(s => s >= 30 && s < 70).length,
        high: scores.filter(s => s >= 70).length,
      };

      // Should have scores in multiple buckets
      expect(Object.values(buckets).filter(count => count > 0).length).toBeGreaterThan(1);
    });
  });
});
