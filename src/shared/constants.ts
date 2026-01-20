import { UserSettings } from './types';

// ============================================================================
// Job Site URL Patterns
// ============================================================================

export const JOB_PATTERNS = {
  linkedin: /linkedin\.com\/jobs\/(view|collections)\/\d+/,
  indeed: /indeed\.com\/viewjob/,
  reed: /reed\.co\.uk\/jobs\/[^\/]+\/\d+/,
} as const;

// ============================================================================
// Common Skills Database
// ============================================================================

export const COMMON_SKILLS = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Rust',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'Scala',
  'R',
  'SQL',

  // Frontend
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'Next.js',
  'Nuxt.js',
  'HTML',
  'CSS',
  'Sass',
  'LESS',
  'Tailwind CSS',
  'Bootstrap',
  'Material UI',
  'Chakra UI',
  'Redux',
  'MobX',
  'Zustand',
  'Webpack',
  'Vite',
  'Rollup',

  // Backend
  'Node.js',
  'Express',
  'Fastify',
  'NestJS',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'ASP.NET',
  'Ruby on Rails',
  'Laravel',

  // Databases
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'DynamoDB',
  'Cassandra',
  'Oracle',
  'SQL Server',
  'SQLite',
  'Firebase',
  'Supabase',

  // Cloud & DevOps
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Terraform',
  'Ansible',
  'Jenkins',
  'GitLab CI',
  'GitHub Actions',
  'CircleCI',
  'Travis CI',

  // APIs & Protocols
  'REST API',
  'GraphQL',
  'gRPC',
  'WebSocket',
  'WebRTC',
  'OAuth',
  'JWT',
  'OpenAPI',

  // Tools & Methodologies
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jira',
  'Confluence',
  'Agile',
  'Scrum',
  'Kanban',
  'CI/CD',
  'TDD',
  'BDD',

  // Testing
  'Jest',
  'Vitest',
  'Mocha',
  'Chai',
  'Cypress',
  'Playwright',
  'Selenium',
  'Testing Library',
  'JUnit',
  'pytest',

  // Mobile
  'React Native',
  'Flutter',
  'iOS',
  'Android',
  'Xcode',
  'Android Studio',

  // Data & ML
  'TensorFlow',
  'PyTorch',
  'Scikit-learn',
  'Pandas',
  'NumPy',
  'Jupyter',
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'Computer Vision',
  'Data Analysis',
  'Data Science',

  // Other
  'Linux',
  'Unix',
  'Bash',
  'PowerShell',
  'Microservices',
  'Serverless',
  'Lambda',
  'API Gateway',
  'Load Balancing',
  'Caching',
  'Message Queue',
  'RabbitMQ',
  'Kafka',
  'WebAssembly',
  'Progressive Web Apps',
  'Accessibility',
  'Performance Optimization',
  'Security',
  'Authentication',
  'Authorization',
] as const;

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_SETTINGS: UserSettings = {
  autoDetect: true,
  minimumMatchPercentage: 70,
  enabledJobSites: ['linkedin', 'indeed', 'reed'],
  popupBehavior: 'auto-popup',
  analysisDetail: 'detailed',
  showNotifications: true,
  retentionDays: 90,
  themeMode: 'light',
  popupSize: 'medium',
};

// ============================================================================
// Match Score Thresholds
// ============================================================================

export const MATCH_THRESHOLDS = {
  APPLY: 70,
  MAYBE: 50,
  PASS: 0,
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  CV_DOCUMENT: 'cvDocument',
  CV_PROFILE: 'cvProfile',
  ANALYZED_JOBS: 'analyzedJobs',
  SETTINGS: 'settings',
} as const;

// ============================================================================
// UI Constants
// ============================================================================

export const POPUP_DIMENSIONS = {
  WIDTH: 400,
  HEIGHT: 600,
} as const;

export const COLORS = {
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#3B82F6',
} as const;

// ============================================================================
// Job Detection Constants
// ============================================================================

export const JOB_INDICATORS = [
  '[data-job-id]',
  '.job-description',
  '.job-title',
  'h1[class*="job"]',
  'div[class*="posting"]',
  'meta[property="og:type"][content="job"]',
  'script[type="application/ld+json"]',
] as const;

// ============================================================================
// Experience Level Keywords
// ============================================================================

export const EXPERIENCE_LEVELS = {
  JUNIOR: ['junior', 'entry level', 'graduate', '0-2 years', 'associate'],
  MID: ['mid-level', 'intermediate', '2-5 years', '3-5 years'],
  SENIOR: ['senior', 'sr.', '5+ years', '5-8 years', 'lead'],
  STAFF: ['staff', 'principal', 'architect', '8+ years', '10+ years'],
} as const;

// ============================================================================
// Requirement Keywords
// ============================================================================

export const REQUIREMENT_KEYWORDS = {
  REQUIRED: [
    'required',
    'must have',
    'must-have',
    'essential',
    'mandatory',
    'necessary',
  ],
  PREFERRED: [
    'preferred',
    'nice to have',
    'nice-to-have',
    'bonus',
    'plus',
    'desirable',
    'would be great',
  ],
} as const;
