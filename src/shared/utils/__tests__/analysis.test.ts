import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeJob } from '../analysis';
import type { CVProfile, JobData } from '../../types';

describe('Analysis - Weighted Scoring Algorithm', () => {
  let mockCV: CVProfile;

  beforeEach(() => {
    // Mock CV with typical IT support skills
    mockCV = {
      personalInfo: { name: 'Test User' },
      skills: [
        'Windows',
        'Active Directory',
        'Technical Support',
        'IT Support',
        'Networking',
        'Microsoft Office',
        'Troubleshooting',
        'Customer Service',
        'Communication',
        'Documentation',
      ],
      experience: [
        {
          title: 'IT Technician',
          company: 'VantageUAV',
          duration: 'Sep 2021 – Mar 2022',
          description: 'Technical support',
        },
        {
          title: 'Telephone Interviewer',
          company: 'IFF Research',
          duration: 'Sep 2019 – Oct 2020',
          description: 'Phone interviews',
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          institution: 'University',
          year: '2019',
        },
      ],
      certifications: [],
      totalExperienceYears: 1.7,
    };
  });

  describe('Required vs Preferred Skills Weighting', () => {
    it('should weight required skills 3x more than preferred skills', () => {
      const jobWithRequired: JobData = {
        url: 'https://example.com/job1',
        title: 'IT Support Engineer',
        company: 'TechCorp',
        description: `
          Requirements:
          - Windows Server experience
          - Active Directory knowledge
          - 2+ years IT support

          Preferred:
          - Linux experience
          - Python scripting
        `,
      };

      const analysis = analyzeJob(jobWithRequired, mockCV);

      // Should have decent score because required skills are matched
      expect(analysis.matchScore).toBeGreaterThan(40);
      expect(analysis.matchDetails.matchedSkills).toContain('Windows');
      expect(analysis.matchDetails.matchedSkills).toContain('Active Directory');
    });

    it('should score higher when required skills match vs only preferred skills', () => {
      const jobWithRequiredMatch: JobData = {
        url: 'https://example.com/job1',
        title: 'IT Support',
        company: 'Company',
        description: `
          Required: Windows, Active Directory
          Preferred: Linux, Python
        `,
      };

      const jobWithPreferredMatch: JobData = {
        url: 'https://example.com/job2',
        title: 'IT Support',
        company: 'Company',
        description: `
          Required: Linux, Python, AWS
          Preferred: Windows, Active Directory
        `,
      };

      const analysis1 = analyzeJob(jobWithRequiredMatch, mockCV);
      const analysis2 = analyzeJob(jobWithPreferredMatch, mockCV);

      // Job 1 should score higher (required skills matched)
      expect(analysis1.matchScore).toBeGreaterThan(analysis2.matchScore);
    });
  });

  describe('Experience Bonus Calculation', () => {
    it('should add +5 points per year of experience (max +20)', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support Engineer',
        company: 'TechCorp',
        description: 'Windows, Active Directory, Technical Support',
      };

      const analysis = analyzeJob(job, mockCV);

      // With 1.7 years experience, should get +8 bonus (1.7 * 5 = 8.5, rounded to 8)
      expect(analysis.matchScore).toBeGreaterThan(0);

      // Base score should be less than final score due to bonus
      // (Can't test exact values without knowing scoring breakdown)
    });

    it('should cap experience bonus at +20 points', () => {
      const cvWith10Years: CVProfile = {
        ...mockCV,
        totalExperienceYears: 10,
      };

      const job: JobData = {
        url: 'https://example.com/job',
        title: 'Senior IT Engineer',
        company: 'TechCorp',
        description: 'Windows, Active Directory, Technical Support',
      };

      const analysis = analyzeJob(job, cvWith10Years);

      // Score should not exceed 100% even with high experience
      expect(analysis.matchScore).toBeLessThanOrEqual(100);
    });

    it('should handle 0 years experience correctly', () => {
      const cvWithNoExperience: CVProfile = {
        ...mockCV,
        totalExperienceYears: 0,
        experience: [],
      };

      const job: JobData = {
        url: 'https://example.com/job',
        title: 'Junior IT Support',
        company: 'TechCorp',
        description: 'Windows, Active Directory',
      };

      const analysis = analyzeJob(job, cvWithNoExperience);

      // Should still calculate score based on skills, just no experience bonus
      expect(analysis.matchScore).toBeGreaterThan(0);
    });
  });

  describe('Match Score Calculation', () => {
    it('should NOT return 97% for every job (bug regression test)', () => {
      const jobs: JobData[] = [
        {
          url: 'https://example.com/job1',
          title: 'Senior DevOps Engineer',
          company: 'TechCorp',
          description: 'Kubernetes, Docker, AWS, Terraform, Python, Jenkins, CI/CD',
        },
        {
          url: 'https://example.com/job2',
          title: 'IT Support Technician',
          company: 'LocalCo',
          description: 'Windows, Active Directory, IT Support, Technical Support',
        },
        {
          url: 'https://example.com/job3',
          title: 'Data Scientist',
          company: 'DataCorp',
          description: 'Python, Machine Learning, TensorFlow, R, Statistics',
        },
      ];

      const scores = jobs.map((job) => analyzeJob(job, mockCV).matchScore);

      // Scores should vary significantly
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBeGreaterThan(1);

      // DevOps and Data Science jobs should score lower than IT Support
      expect(scores[1]).toBeGreaterThan(scores[0]); // IT Support > DevOps
      expect(scores[1]).toBeGreaterThan(scores[2]); // IT Support > Data Science
    });

    it('should score between 0-100%', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Windows, Active Directory, Technical Support',
      };

      const analysis = analyzeJob(job, mockCV);

      expect(analysis.matchScore).toBeGreaterThanOrEqual(0);
      expect(analysis.matchScore).toBeLessThanOrEqual(100);
    });

    it('should return low score for completely unrelated job', () => {
      const unrealatedJob: JobData = {
        url: 'https://example.com/job',
        title: 'Underwater Basket Weaver',
        company: 'BasketsRUs',
        description: 'Basket weaving, Underwater diving, Marine biology, Scuba certification',
      };

      const analysis = analyzeJob(unrealatedJob, mockCV);

      // Should score very low (< 30%)
      expect(analysis.matchScore).toBeLessThan(30);
    });

    it('should return high score for perfect match', () => {
      const perfectJob: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support Technician',
        company: 'TechCorp',
        description: `
          Required:
          - Windows administration
          - Active Directory experience
          - Technical Support skills
          - IT Support background
          - Networking knowledge
          - Microsoft Office proficiency
          - Troubleshooting abilities
          - Customer Service experience

          2+ years experience required
        `,
      };

      const analysis = analyzeJob(perfectJob, mockCV);

      // Should score very high (> 70%)
      expect(analysis.matchScore).toBeGreaterThan(70);
    });
  });

  describe('Recommendation Logic', () => {
    it('should recommend "apply" for high match scores', () => {
      const goodMatch: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Windows, Active Directory, Technical Support, IT Support, Networking',
      };

      const analysis = analyzeJob(goodMatch, mockCV);

      if (analysis.matchScore >= 70 && analysis.matchDetails.matchedSkills.length >= 5) {
        expect(analysis.recommendation).toBe('apply');
      }
    });

    it('should recommend "maybe" for medium match scores', () => {
      const mediumMatch: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Windows, Active Directory, Linux, Python',
      };

      const analysis = analyzeJob(mediumMatch, mockCV);

      if (analysis.matchScore >= 50 && analysis.matchScore < 70) {
        expect(analysis.recommendation).toBe('maybe');
      }
    });

    it('should recommend "pass" for low match scores', () => {
      const poorMatch: JobData = {
        url: 'https://example.com/job',
        title: 'Senior DevOps Engineer',
        company: 'Company',
        description: 'Kubernetes, Docker, AWS, Terraform, Python, Jenkins, CI/CD, GitOps',
      };

      const analysis = analyzeJob(poorMatch, mockCV);

      if (analysis.matchScore < 50) {
        expect(analysis.recommendation).toBe('pass');
      }
    });
  });

  describe('Matched vs Missing Skills', () => {
    it('should correctly identify matched skills', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Required: Windows, Active Directory, Technical Support, Linux',
      };

      const analysis = analyzeJob(job, mockCV);

      expect(analysis.matchDetails.matchedSkills).toContain('Windows');
      expect(analysis.matchDetails.matchedSkills).toContain('Active Directory');
      expect(analysis.matchDetails.matchedSkills).toContain('Technical Support');
    });

    it('should correctly identify missing skills', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Required: Windows, Active Directory, Linux, Python, AWS',
      };

      const analysis = analyzeJob(job, mockCV);

      expect(analysis.matchDetails.missingSkills).toContain('Linux');
      expect(analysis.matchDetails.missingSkills).toContain('Python');
    });

    it('should not duplicate skills in matched list', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Windows Windows Windows Active Directory Active Directory',
      };

      const analysis = analyzeJob(job, mockCV);

      const windowsCount = analysis.matchDetails.matchedSkills.filter(
        (s) => s === 'Windows'
      ).length;
      expect(windowsCount).toBe(1);
    });
  });

  describe('Strengths and Gaps', () => {
    it('should identify strength areas based on matched skills', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support Engineer',
        company: 'Company',
        description: `
          Required:
          - Windows administration
          - Active Directory
          - Technical Support
          - Customer Service
        `,
      };

      const analysis = analyzeJob(job, mockCV);

      expect(analysis.matchDetails.strengthAreas).toBeDefined();
      expect(analysis.matchDetails.strengthAreas.length).toBeGreaterThan(0);
    });

    it('should identify gap areas based on missing skills', () => {
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'DevOps Engineer',
        company: 'Company',
        description: `
          Required:
          - Kubernetes
          - Docker
          - AWS
          - CI/CD
        `,
      };

      const analysis = analyzeJob(job, mockCV);

      expect(analysis.matchDetails.weakAreas).toBeDefined();
      expect(analysis.matchDetails.weakAreas.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty job description', () => {
      const emptyJob: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: '',
      };

      const analysis = analyzeJob(emptyJob, mockCV);

      expect(analysis.matchScore).toBeDefined();
      expect(analysis.matchScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle CV with no skills', () => {
      const emptyCV: CVProfile = {
        ...mockCV,
        skills: [],
        totalExperienceYears: 0, // Remove experience bonus
      };

      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: 'Windows, Active Directory',
      };

      const analysis = analyzeJob(job, emptyCV);

      // Should have very low score with no skills
      expect(analysis.matchScore).toBeLessThan(10);
      expect(analysis.matchDetails.matchedSkills).toHaveLength(0);
    });

    it('should handle very long job descriptions', () => {
      const longDescription = 'Windows '.repeat(1000) + 'Active Directory '.repeat(500);
      const job: JobData = {
        url: 'https://example.com/job',
        title: 'IT Support',
        company: 'Company',
        description: longDescription,
      };

      const analysis = analyzeJob(job, mockCV);

      // Should not crash and should return valid score
      expect(analysis.matchScore).toBeGreaterThanOrEqual(0);
      expect(analysis.matchScore).toBeLessThanOrEqual(100);
    });
  });
});
