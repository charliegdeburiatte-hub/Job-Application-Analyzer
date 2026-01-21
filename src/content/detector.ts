import { JobData, ExtensionMessage } from '../shared/types';

// ============================================================================
// Inlined isJobPage - NO EXTERNAL IMPORTS to avoid code splitting in Firefox
// ============================================================================

const JOB_PATTERNS_INLINE = {
  linkedin: /linkedin\.com\/jobs\/view\/\d+/i,
  indeed: /indeed\.(com|co\.uk)\/viewjob/i,
  reed: /reed\.co\.uk\/jobs\//i,
};

type JobSource = 'linkedin' | 'indeed' | 'reed';
type DetectionResult = {
  isJob: boolean;
  confidence: number;
  method: string;
  site?: JobSource;
};

function isJobPage(url: string): DetectionResult {
  for (const [site, pattern] of Object.entries(JOB_PATTERNS_INLINE)) {
    if (pattern.test(url)) {
      return {
        isJob: true,
        confidence: 1,
        method: 'url-pattern',
        site: site as JobSource,
      };
    }
  }

  return {
    isJob: false,
    confidence: 0,
    method: 'url-pattern',
  };
}

// ============================================================================
// Job Page Detection
// ============================================================================

/**
 * Check if current page is a job posting
 */
function detectJobPage(): boolean {
  const url = window.location.href;
  const detection = isJobPage(url);

  if (detection.isJob) {
    console.log('[Job Analyzer] Job page detected:', detection.site);
    return true;
  }

  return false;
}

// ============================================================================
// Job Data Extraction
// ============================================================================

/**
 * Extract job data from LinkedIn
 */
function extractLinkedInJob(): Partial<JobData> {
  const titleElement = document.querySelector('.job-details-jobs-unified-top-card__job-title');
  const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name');
  const locationElement = document.querySelector('.job-details-jobs-unified-top-card__bullet');
  const descriptionElement = document.querySelector('.jobs-description__content');

  return {
    title: titleElement?.textContent?.trim() || 'Unknown Title',
    company: companyElement?.textContent?.trim() || 'Unknown Company',
    location: locationElement?.textContent?.trim(),
    description: descriptionElement?.textContent?.trim() || '',
    source: 'linkedin',
  };
}

/**
 * Extract job data from Indeed
 */
function extractIndeedJob(): Partial<JobData> {
  const titleElement = document.querySelector('.jobsearch-JobInfoHeader-title');
  const companyElement = document.querySelector('[data-company-name="true"]');
  const locationElement = document.querySelector('[data-testid="jobsearch-JobInfoHeader-companyLocation"]');
  const descriptionElement = document.querySelector('#jobDescriptionText');

  return {
    title: titleElement?.textContent?.trim() || 'Unknown Title',
    company: companyElement?.textContent?.trim() || 'Unknown Company',
    location: locationElement?.textContent?.trim(),
    description: descriptionElement?.textContent?.trim() || '',
    source: 'indeed',
  };
}

/**
 * Extract job data from Reed
 */
function extractReedJob(): Partial<JobData> {
  const titleElement = document.querySelector('h1[itemprop="title"]');
  const companyElement = document.querySelector('[itemprop="hiringOrganization"]');
  const locationElement = document.querySelector('[itemprop="jobLocation"]');
  const descriptionElement = document.querySelector('[itemprop="description"]');

  return {
    title: titleElement?.textContent?.trim() || 'Unknown Title',
    company: companyElement?.textContent?.trim() || 'Unknown Company',
    location: locationElement?.textContent?.trim(),
    description: descriptionElement?.textContent?.trim() || '',
    source: 'reed',
  };
}

/**
 * Generic job extraction - tries to extract from any page
 */
function extractGenericJob(): Partial<JobData> {
  // Try to find job title
  let title = '';
  const titleSelectors = [
    'h1',
    '[class*="job-title" i]',
    '[class*="jobtitle" i]',
    '[id*="job-title" i]',
    '[data-testid*="title" i]',
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      title = element.textContent.trim();
      break;
    }
  }

  // Try to find company name
  let company = '';
  const companySelectors = [
    '[class*="company" i]',
    '[data-company-name]',
    '[class*="employer" i]',
    '[itemprop="hiringOrganization"]',
  ];

  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim()) {
      company = element.textContent.trim();
      break;
    }
  }

  // Try to find job description
  let description = '';
  const descriptionSelectors = [
    '[class*="job-description" i]',
    '[class*="description" i]',
    '[id*="description" i]',
    '[itemprop="description"]',
    'main',
    'article',
  ];

  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element?.textContent?.trim() && element.textContent.trim().length > 100) {
      description = element.textContent.trim();
      break;
    }
  }

  // If no description found, try to get all visible text as fallback
  if (!description) {
    description = document.body.innerText;
  }

  return {
    title: title || document.title || 'Unknown Title',
    company: company || 'Unknown Company',
    description: description || '',
    source: 'linkedin', // Default to linkedin for now
  };
}

/**
 * Extract job data based on current site
 */
function extractJobData(): JobData | null {
  const url = window.location.href;
  const detection = isJobPage(url);

  if (!detection.isJob || !detection.site) {
    return null;
  }

  let jobData: Partial<JobData>;

  switch (detection.site) {
    case 'linkedin':
      jobData = extractLinkedInJob();
      break;
    case 'indeed':
      jobData = extractIndeedJob();
      break;
    case 'reed':
      jobData = extractReedJob();
      break;
    default:
      return null;
  }

  // Validate required fields
  if (!jobData.title || !jobData.description || jobData.description.length < 50) {
    console.warn('[Job Analyzer] Incomplete job data extracted');
    return null;
  }

  // Build complete job data
  const completeJobData: JobData = {
    url,
    title: jobData.title,
    company: jobData.company || 'Unknown Company',
    location: jobData.location,
    description: jobData.description,
    source: detection.site,
  };

  return completeJobData;
}

/**
 * Manually extract job data from current page (for non-detected sites)
 */
function extractManualJobData(): JobData | null {
  const url = window.location.href;
  const jobData = extractGenericJob();

  // Validate required fields
  if (!jobData.title || !jobData.description || jobData.description.length < 50) {
    console.warn('[Job Analyzer] Could not extract enough data from page');
    return null;
  }

  const completeJobData: JobData = {
    url,
    title: jobData.title,
    company: jobData.company || 'Unknown Company',
    location: jobData.location,
    description: jobData.description,
    source: jobData.source as any,
  };

  return completeJobData;
}

// ============================================================================
// Message Passing
// ============================================================================

/**
 * Send message to background script
 */
async function sendToBackground(message: ExtensionMessage): Promise<any> {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (error) {
    console.error('[Job Analyzer] Error sending message:', error);
    return null;
  }
}

// ============================================================================
// Main Detection Logic
// ============================================================================

let lastAnalyzedUrl: string | null = null;

/**
 * Analyze current job page
 */
async function analyzeCurrentPage() {
  const url = window.location.href;

  // Don't re-analyze same URL
  if (url === lastAnalyzedUrl) {
    return;
  }

  // Check if this is a job page
  if (!detectJobPage()) {
    return;
  }

  // Wait a bit for page to load completely
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Extract job data
  const jobData = extractJobData();

  if (!jobData) {
    console.warn('[Job Analyzer] Could not extract job data');
    return;
  }

  console.log('[Job Analyzer] Extracted job data:', jobData);

  // Send to background for analysis
  const message: ExtensionMessage = {
    type: 'ANALYZE_JOB',
    payload: { jobData },
  };

  const response = await sendToBackground(message);

  if (response && response.success) {
    console.log('[Job Analyzer] Job analysis complete');
    lastAnalyzedUrl = url;

    // Update extension badge
    await browser.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      payload: { score: response.analysis.matchScore },
    });
  }
}

// ============================================================================
// Initialize Content Script
// ============================================================================

console.log('[Job Analyzer] Content script loaded');

// ============================================================================
// CRITICAL: Register message listener FIRST before any other code
// This ensures the popup can always communicate even if other code fails
// ============================================================================

browser.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'GET_CURRENT_JOB') {
    try {
      // Try to extract job data from current page
      const jobData = extractManualJobData();

      if (jobData) {
        console.log('[Job Analyzer] Manual extraction successful:', jobData);
        sendResponse({ success: true, jobData });
      } else {
        console.warn('[Job Analyzer] Manual extraction failed');
        sendResponse({ success: false, error: 'Could not extract job data from this page' });
      }
    } catch (error) {
      console.error('[Job Analyzer] Manual extraction error:', error);
      sendResponse({ success: false, error: 'Failed to extract job data' });
    }

    return true; // Keep message channel open for async response
  }
});

// ============================================================================
// Auto-Analysis Setup
// ============================================================================

// Run initial analysis
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', analyzeCurrentPage);
} else {
  analyzeCurrentPage();
}

// Watch for URL changes (SPA navigation) - only if document.body exists
if (document.body) {
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      lastAnalyzedUrl = null; // Reset so we can analyze new page
      analyzeCurrentPage();
    }
  });

  try {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.warn('[Job Analyzer] Could not set up MutationObserver:', error);
  }
}

// Also listen for popstate events
window.addEventListener('popstate', () => {
  lastAnalyzedUrl = null;
  analyzeCurrentPage();
});
