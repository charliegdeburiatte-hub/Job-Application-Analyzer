/**
 * Test Data Generator using Faker
 *
 * Generates realistic CVs, job postings, and test scenarios
 * for comprehensive testing of the Job Application Analyzer
 */

import { faker } from '@faker-js/faker';
import type { CVProfile, JobData } from '../../types';

// Common IT skills database for realistic generation
const TECHNICAL_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go',
  'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
  'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
];

const TOOLS_PLATFORMS = [
  'Windows', 'Linux', 'macOS', 'Windows Server', 'Active Directory',
  'Microsoft Office', 'Microsoft 365', 'SharePoint', 'Teams',
  'Jira', 'Confluence', 'Slack', 'Salesforce',
  'VS Code', 'IntelliJ', 'Eclipse', 'Visual Studio',
];

const SOFT_SKILLS = [
  'Communication', 'Teamwork', 'Problem Solving', 'Leadership',
  'Time Management', 'Customer Service', 'Project Management',
  'Analytical Thinking', 'Creativity', 'Adaptability',
  'Technical Support', 'IT Support', 'Troubleshooting',
  'Documentation', 'Training', 'Mentoring',
];

const JOB_TITLES_IT = [
  'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer',
  'IT Support Technician', 'IT Support Engineer', 'Systems Administrator',
  'Network Administrator', 'Database Administrator', 'Security Engineer',
  'QA Engineer', 'Test Automation Engineer', 'Data Analyst',
];

const COMPANIES = [
  'TechCorp', 'DataSystems Inc', 'CloudWorks', 'InnovateTech',
  'Digital Solutions', 'ByteWorks', 'CodeCraft', 'NetSphere',
  'InfoTech Ltd', 'CyberSolutions', 'DevHub', 'TechNova',
];

/**
 * Generate a realistic CV profile
 */
export function generateCV(options: {
  skillCount?: number;
  experienceYears?: number;
  jobCount?: number;
  includeITSkills?: boolean;
  includeSoftSkills?: boolean;
} = {}): CVProfile {
  const {
    skillCount = faker.number.int({ min: 5, max: 20 }),
    experienceYears = faker.number.float({ min: 0, max: 15, fractionDigits: 1 }),
    jobCount = faker.number.int({ min: 1, max: 5 }),
    includeITSkills = true,
    includeSoftSkills = true,
  } = options;

  // Generate skills
  const skills: string[] = [];
  if (includeITSkills) {
    skills.push(...faker.helpers.arrayElements(TECHNICAL_SKILLS, Math.floor(skillCount * 0.5)));
    skills.push(...faker.helpers.arrayElements(TOOLS_PLATFORMS, Math.floor(skillCount * 0.3)));
  }
  if (includeSoftSkills) {
    skills.push(...faker.helpers.arrayElements(SOFT_SKILLS, Math.floor(skillCount * 0.2)));
  }

  // Generate experience entries
  const experience = Array.from({ length: jobCount }, () => {
    const startDate = faker.date.past({ years: 10 });
    const endDate = faker.datatype.boolean()
      ? new Date() // Current job
      : faker.date.between({ from: startDate, to: new Date() });

    const isPresentJob = endDate.getTime() === new Date().setHours(0, 0, 0, 0);
    const formatDate = (date: Date) =>
      `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;

    return {
      title: faker.helpers.arrayElement(JOB_TITLES_IT),
      company: faker.helpers.arrayElement(COMPANIES),
      duration: `${formatDate(startDate)} – ${isPresentJob ? 'Present' : formatDate(endDate)}`,
      description: faker.lorem.sentences(3),
    };
  });

  // Generate education
  const education = [{
    degree: faker.helpers.arrayElement([
      'Bachelor of Science in Computer Science',
      'Bachelor of Engineering',
      'Master of Science in IT',
      'Associate Degree in Information Technology',
    ]),
    institution: faker.company.name() + ' University',
    year: faker.date.past({ years: 15 }).getFullYear().toString(),
  }];

  // Generate certifications
  const certifications = faker.datatype.boolean()
    ? faker.helpers.arrayElements([
        'CompTIA A+',
        'CompTIA Network+',
        'CompTIA Security+',
        'AWS Certified Solutions Architect',
        'Microsoft Certified: Azure Administrator',
        'ITIL Foundation',
      ], faker.number.int({ min: 0, max: 3 }))
    : [];

  return {
    personalInfo: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      location: `${faker.location.city()}, ${faker.location.country()}`,
    },
    summary: faker.lorem.paragraph(),
    skills,
    experience,
    education,
    certifications,
    totalExperienceYears: experienceYears,
  };
}

/**
 * Generate a realistic job posting
 */
export function generateJobPosting(options: {
  requiredSkillsCount?: number;
  preferredSkillsCount?: number;
  includeYearsRequired?: boolean;
  matchCV?: CVProfile;
} = {}): JobData {
  const {
    requiredSkillsCount = faker.number.int({ min: 3, max: 8 }),
    preferredSkillsCount = faker.number.int({ min: 2, max: 5 }),
    includeYearsRequired = faker.datatype.boolean(),
    matchCV,
  } = options;

  // If matching a CV, include some of their skills
  let requiredSkills: string[];
  let preferredSkills: string[];

  if (matchCV) {
    // Take 50% of skills from CV (good match)
    const cvSkillsToUse = faker.helpers.arrayElements(
      matchCV.skills,
      Math.min(requiredSkillsCount, Math.floor(matchCV.skills.length * 0.5))
    );
    // Add some random skills they don't have
    const additionalSkills = faker.helpers.arrayElements(
      TECHNICAL_SKILLS.filter(s => !matchCV.skills.includes(s)),
      requiredSkillsCount - cvSkillsToUse.length
    );
    requiredSkills = [...cvSkillsToUse, ...additionalSkills];
    preferredSkills = faker.helpers.arrayElements(SOFT_SKILLS, preferredSkillsCount);
  } else {
    requiredSkills = faker.helpers.arrayElements(
      [...TECHNICAL_SKILLS, ...TOOLS_PLATFORMS],
      requiredSkillsCount
    );
    preferredSkills = faker.helpers.arrayElements(SOFT_SKILLS, preferredSkillsCount);
  }

  const yearsRequired = includeYearsRequired
    ? faker.number.int({ min: 1, max: 10 })
    : null;

  const description = `
${faker.lorem.paragraph()}

Requirements:
${requiredSkills.map(s => `- ${s}`).join('\n')}
${yearsRequired ? `- ${yearsRequired}+ years of experience` : ''}

Preferred:
${preferredSkills.map(s => `- ${s}`).join('\n')}

${faker.lorem.paragraphs(2)}

Benefits:
- Competitive salary
- Health insurance
- Remote work options
- Professional development
`;

  return {
    url: faker.internet.url(),
    title: faker.helpers.arrayElement(JOB_TITLES_IT),
    company: faker.helpers.arrayElement(COMPANIES),
    description: description.trim(),
    source: 'linkedin',
  };
}

/**
 * Generate a batch of job postings with known match scores
 */
export function generateJobBatch(cv: CVProfile, count: number = 10): {
  highMatch: JobData[];
  mediumMatch: JobData[];
  lowMatch: JobData[];
} {
  const highMatch: JobData[] = [];
  const mediumMatch: JobData[] = [];
  const lowMatch: JobData[] = [];

  for (let i = 0; i < count; i++) {
    const category = faker.number.int({ min: 0, max: 2 });

    if (category === 0) {
      // High match - use mostly CV skills
      const requiredSkills = faker.helpers.arrayElements(cv.skills, Math.min(5, cv.skills.length));
      const job = generateJobPosting({ requiredSkillsCount: requiredSkills.length });
      // Override description to use CV skills
      job.description = `
Requirements:
${requiredSkills.join(', ')}

${job.description}
`;
      highMatch.push(job);
    } else if (category === 1) {
      // Medium match - use some CV skills
      const requiredSkills = faker.helpers.arrayElements(cv.skills, Math.min(2, cv.skills.length));
      const additionalSkills = faker.helpers.arrayElements(TECHNICAL_SKILLS, 3);
      const job = generateJobPosting();
      job.description = `
Requirements:
${[...requiredSkills, ...additionalSkills].join(', ')}

${job.description}
`;
      mediumMatch.push(job);
    } else {
      // Low match - use mostly different skills
      const differentSkills = faker.helpers.arrayElements(
        TECHNICAL_SKILLS.filter(s => !cv.skills.includes(s)),
        5
      );
      const job = generateJobPosting();
      job.description = `
Requirements:
${differentSkills.join(', ')}

${job.description}
`;
      lowMatch.push(job);
    }
  }

  return { highMatch, mediumMatch, lowMatch };
}

/**
 * Generate edge case CVs for testing
 */
export function generateEdgeCaseCV(type: 'empty' | 'minimal' | 'oversized' | 'unusual-dates'): CVProfile {
  const baseCV = generateCV();

  switch (type) {
    case 'empty':
      return {
        ...baseCV,
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        totalExperienceYears: 0,
      };

    case 'minimal':
      return {
        ...baseCV,
        skills: ['JavaScript'],
        experience: [{
          title: 'Developer',
          company: 'Company',
          duration: '2023 – Present',
          description: 'Coding',
        }],
        education: [],
        certifications: [],
        totalExperienceYears: 1,
      };

    case 'oversized':
      return {
        ...baseCV,
        skills: Array.from({ length: 100 }, () => faker.helpers.arrayElement(TECHNICAL_SKILLS)),
        experience: Array.from({ length: 20 }, () => ({
          title: faker.helpers.arrayElement(JOB_TITLES_IT),
          company: faker.company.name(),
          duration: `${faker.date.past().getFullYear()} – ${faker.date.recent().getFullYear()}`,
          description: faker.lorem.paragraphs(5),
        })),
        totalExperienceYears: 30,
      };

    case 'unusual-dates':
      return {
        ...baseCV,
        experience: [
          {
            title: 'Developer',
            company: 'Company A',
            duration: 'January 2020 – December 2020', // Full month names
            description: 'Work',
          },
          {
            title: 'Engineer',
            company: 'Company B',
            duration: '2019-2020', // Dash instead of en-dash
            description: 'Work',
          },
          {
            title: 'Consultant',
            company: 'Company C',
            duration: 'Q1 2018 - Q4 2018', // Quarter format
            description: 'Work',
          },
        ],
      };

    default:
      return baseCV;
  }
}

/**
 * Generate test scenarios for specific bug reproduction
 */
export function generateBugScenario(bugType: 'month-year-parsing' | '97-percent-bug' | 'self-employment-filter'): {
  cv: CVProfile;
  jobs: JobData[];
  expectedBehavior: string;
} {
  switch (bugType) {
    case 'month-year-parsing':
      return {
        cv: {
          ...generateCV(),
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
          totalExperienceYears: 1.6,
        },
        jobs: [generateJobPosting()],
        expectedBehavior: 'Should parse both jobs and calculate 1.6 years experience (6 + 13 months)',
      };

    case '97-percent-bug':
      const cv = generateCV({ skillCount: 10 });
      return {
        cv,
        jobs: [
          generateJobPosting({ matchCV: cv }), // Should be high match
          generateJobPosting(), // Should vary
          generateJobPosting(), // Should vary
        ],
        expectedBehavior: 'Scores should vary, not all be 97%',
      };

    case 'self-employment-filter':
      return {
        cv: {
          ...generateCV(),
          experience: [
            {
              title: 'Independent Development',
              company: 'Self',
              duration: '2022 – Present',
              description: 'Freelance work',
            },
            {
              title: 'Software Engineer',
              company: 'TechCorp',
              duration: '2020 – 2021',
              description: 'Full-time work',
            },
          ],
          totalExperienceYears: 1, // Should only count TechCorp
        },
        jobs: [generateJobPosting()],
        expectedBehavior: 'Should exclude Independent Development from experience calculation',
      };

    default:
      return {
        cv: generateCV(),
        jobs: [generateJobPosting()],
        expectedBehavior: 'Standard test scenario',
      };
  }
}
