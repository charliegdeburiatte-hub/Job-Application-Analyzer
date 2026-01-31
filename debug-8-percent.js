// Debug script to understand why Support Specialist job scored 8%
import { analyzeJob } from './src/shared/utils/analysis.js';
import { extractSkills, extractRequiredSkills, extractPreferredSkills } from './src/shared/utils/analysis.js';

const userCV = {
  personalInfo: { name: 'User', email: '', phone: '', location: '' },
  skills: [
    'AD', 'Account Management', 'Active Directory', 'Bash',
    'Communication', 'Customer Service', 'DHCP', 'DNS',
    'Documentation', 'Freshdesk', 'Hardware', 'IT Support', 'ITSM',
    'Linux', 'Microsoft 365', 'Microsoft Teams', 'Networking', 'Outlook',
    'PowerShell', 'Restore', 'Service Desk', 'Slack', 'TCP/IP',
    'TeamViewer', 'Technical Support', 'Ticketing', 'Tier 1',
    'Troubleshooting', 'User Management', 'VM', 'Wi-Fi', 'Windows',
    'Windows 10', 'Windows Server', 'Zoom'
  ],
  experience: [
    {
      title: 'IT Support Technician',
      company: 'Tech Corp',
      duration: 'Sep 2021 – Mar 2023',
      description: 'IT Support'
    }
  ],
  education: [],
  certifications: [],
  totalExperienceYears: 1.6
};

const jobDescription = `
About the job

We are looking for a talented Support Specialist to join our Customer Support team.

You will provide support on a range of NMI software products to our live customers via online tickets. You will carry out the on-boarding process with new customers, ensuring a high level of customer service at all times.

If you are a natural problem-solver with high levels of customer service and attention to detail, you will excel in this role. The primary function of the role will be to work as part of the general support team, reporting directly to the Support Manager.

What will I be doing?

    Onboarding new and existing customer accounts
    Training customers on our onboarding & reporting tools
    Supporting internal colleagues with general queries relating to our products
    Updating/creating knowledge garden content (our external help desk portal with information for customers)
    Updating/creating internal documentation
    Working with acquirers/other teams to ensure customer solutions are compliant
    Providing general support for customers using our products/services
    Internal projects to help improve the customer experience
    Building out internal training programs

Essential Skills And Experience

    Excellent customer service skills
    Excellent all round IT knowledge
    Excellent attention to detail
    Proven problem solving ability
    Proactive, shows initiative and creativity in solving issues
    Ability to handle complex data sets
    Ability to prioritise tickets and workload
    Excellent written & verbal communication skills
    Positive, 'can do' attitude
    Organised and able to work without close supervision
    Show curiosity

Preferred Skills & Experience

    Experience of using a customer ticketing system
    Experience in an IT Helpdesk or Support role
    Experience of the payments industry is a great plus but not required
`;

const job = {
  url: 'https://example.com/support-specialist',
  title: 'Support Specialist',
  company: 'NMI',
  description: jobDescription,
  source: 'linkedin'
};

console.log('=== DEBUGGING 8% SCORE ===\n');

// Extract skills
const allSkills = extractSkills(jobDescription);
console.log('All skills found in job:', allSkills);
console.log('Count:', allSkills.length);
console.log('');

const requiredSkills = extractRequiredSkills(jobDescription);
console.log('Required skills:', requiredSkills);
console.log('Count:', requiredSkills.length);
console.log('');

const preferredSkills = extractPreferredSkills(jobDescription);
console.log('Preferred skills:', preferredSkills);
console.log('Count:', preferredSkills.length);
console.log('');

console.log('User CV skills:', userCV.skills);
console.log('Count:', userCV.skills.length);
console.log('');

// Run analysis
const analysis = analyzeJob(job, userCV);

console.log('=== ANALYSIS RESULT ===');
console.log('Match Score:', analysis.matchScore + '%');
console.log('Base Score:', analysis.baseScore);
console.log('Experience Bonus:', analysis.bonusPoints);
console.log('Matched Skills:', analysis.matchDetails.matchedSkills);
console.log('Missing Skills:', analysis.matchDetails.missingSkills);
console.log('');

console.log('=== PROBLEM ANALYSIS ===');
console.log('The job description uses DESCRIPTIVE language:');
console.log('  - "Excellent customer service skills" instead of "Customer Service"');
console.log('  - "Excellent all round IT knowledge" instead of specific tech skills');
console.log('  - "Experience in an IT Helpdesk or Support role" instead of "IT Support"');
console.log('');
console.log('Our skill extractor only matches exact skill names from COMMON_SKILLS.');
console.log('It cannot understand descriptive phrases like "customer service skills".');
console.log('');
console.log('This causes very few skills to be detected, resulting in an 8% score');
console.log('even though the user is a perfect match!');
