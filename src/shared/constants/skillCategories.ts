/**
 * Skill Categories for Weighted Scoring
 *
 * Categorizes skills into Technical, Tools, and Soft Skills
 * for differential weighting in match score calculations.
 *
 * Weights:
 * - Technical Skills: 2x (programming languages, frameworks, core tech)
 * - Tools: 1x (development tools, platforms, methodologies)
 * - Soft Skills: 0.5x (communication, customer service, soft competencies)
 */

export type SkillCategory = 'technical' | 'tools' | 'soft';

export interface SkillWeight {
  category: SkillCategory;
  weight: number;
}

/**
 * Skill weight multipliers
 */
export const SKILL_WEIGHTS: Record<SkillCategory, number> = {
  technical: 2.0,
  tools: 1.0,
  soft: 0.5,
};

/**
 * Technical Skills (2x weight)
 * Core programming languages, frameworks, databases, and fundamental technologies
 */
export const TECHNICAL_SKILLS = new Set([
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

  // Frontend Frameworks & Libraries
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

  // Backend Frameworks
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

  // APIs & Protocols
  'REST API',
  'GraphQL',
  'gRPC',
  'WebSocket',
  'WebRTC',
  'OAuth',
  'JWT',
  'OpenAPI',

  // Cloud Platforms
  'AWS',
  'Azure',
  'GCP',
  'Lambda',
  'API Gateway',

  // Testing Frameworks
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

  // Mobile Development
  'React Native',
  'Flutter',
  'iOS',
  'Android',

  // Data Science & ML
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

  // Architecture & Patterns
  'Microservices',
  'Serverless',
  'Progressive Web Apps',
  'WebAssembly',

  // Networking & Systems
  'TCP/IP',
  'Networking',
  'VPN',
  'Firewall',
  'DNS',
  'DHCP',
  'Linux',
  'Unix',
  'Windows Server',
  'Active Directory',
  'AD',
  'Azure AD',

  // Security
  'Security',
  'Authentication',
  'Authorization',
  'BitLocker',
  'Antivirus',
]);

/**
 * Tools & Platforms (1x weight)
 * Development tools, platforms, methodologies, and support technologies
 */
export const TOOL_SKILLS = new Set([
  // Version Control & CI/CD
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jenkins',
  'GitLab CI',
  'GitHub Actions',
  'CircleCI',
  'Travis CI',
  'CI/CD',

  // Build Tools
  'Webpack',
  'Vite',
  'Rollup',

  // Containerization & Orchestration
  'Docker',
  'Kubernetes',
  'Terraform',
  'Ansible',

  // Project Management & Collaboration
  'Jira',
  'Confluence',
  'ServiceNow',
  'Zendesk',
  'Freshdesk',

  // Methodologies
  'Agile',
  'Scrum',
  'Kanban',
  'TDD',
  'BDD',
  'ITIL',

  // Development Tools
  'Xcode',
  'Android Studio',
  'Bash',
  'PowerShell',

  // Operating Systems
  'Windows',
  'Windows 10',
  'Windows 11',

  // Communication Tools
  'Microsoft Teams',
  'Slack',
  'Zoom',
  'Skype',

  // Microsoft Suite
  'Office 365',
  'Microsoft 365',
  'Exchange',
  'Outlook',
  'OneDrive',
  'SharePoint',

  // IT Management
  'Group Policy',
  'Intune',
  'SCCM',
  'Patch Management',
  'Software Deployment',

  // Remote Support
  'Remote Desktop',
  'RDP',
  'TeamViewer',
  'AnyDesk',
  'VNC',

  // Infrastructure
  'Load Balancing',
  'Caching',
  'Message Queue',
  'RabbitMQ',
  'Kafka',

  // Virtualization
  'Virtual Machine',
  'VM',
  'VMware',
  'Hyper-V',
  'VirtualBox',

  // Hardware & Networking
  'Hardware',
  'Printer',
  'Scanner',
  'Network Printer',
  'Wi-Fi',
  'Wireless',
  'Ethernet',
  'Switch',
  'Router',
  'Modem',
  'IP Address',
  'MAC Address',
  'Subnet',
  'Gateway',
  'VLAN',
  'VoIP',

  // Backup & Recovery
  'Backup',
  'Restore',
  'Imaging',
  'Cloning',

  // Storage & File Management
  'File Sharing',
  'Network Drive',
  'Mapped Drive',

  // Certifications (tools for career advancement)
  'CompTIA A+',
  'CompTIA Network+',
  'CompTIA Security+',
  'MCSA',
  'MCSE',
  'CCNA',

  // Processes
  'Incident Management',
  'Problem Management',
  'Change Management',
  'Inventory Management',
  'Asset Management',
  'User Management',
  'Account Management',
  'Password Reset',
  'Permission Management',
  'Ticketing',
  'ITSM',

  // Optimization
  'Performance Optimization',
  'Accessibility',
]);

/**
 * Soft Skills (0.5x weight)
 * Communication, customer service, and interpersonal competencies
 */
export const SOFT_SKILLS = new Set([
  'Customer Service',
  'Communication',
  'Documentation',
  'Knowledge Base',
  'Help Desk',
  'Helpdesk',
  'Service Desk',
  'Technical Support',
  'IT Support',
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Troubleshooting',
  'Diagnostics',
  'SLA',
  'Malware', // Contextual (malware removal is support work)
]);

/**
 * Get the category and weight for a skill
 */
export function getSkillWeight(skill: string): SkillWeight {
  if (TECHNICAL_SKILLS.has(skill)) {
    return { category: 'technical', weight: SKILL_WEIGHTS.technical };
  }

  if (SOFT_SKILLS.has(skill)) {
    return { category: 'soft', weight: SKILL_WEIGHTS.soft };
  }

  // Default to tools
  return { category: 'tools', weight: SKILL_WEIGHTS.tools };
}

/**
 * Calculate weighted score for a list of skills
 */
export function calculateWeightedTotal(skills: string[]): number {
  return skills.reduce((total, skill) => {
    const { weight } = getSkillWeight(skill);
    return total + weight;
  }, 0);
}

/**
 * Get skills breakdown by category
 */
export function categorizeSkills(skills: string[]): Record<SkillCategory, string[]> {
  const categorized: Record<SkillCategory, string[]> = {
    technical: [],
    tools: [],
    soft: [],
  };

  for (const skill of skills) {
    const { category } = getSkillWeight(skill);
    categorized[category].push(skill);
  }

  return categorized;
}
