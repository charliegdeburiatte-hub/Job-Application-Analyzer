import { JobData, ExtensionMessage } from '../shared/types';
import { isJobPage } from '../shared/utils/helpers';

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

// Run initial analysis
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', analyzeCurrentPage);
} else {
  analyzeCurrentPage();
}

// Watch for URL changes (SPA navigation)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    lastAnalyzedUrl = null; // Reset so we can analyze new page
    analyzeCurrentPage();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Also listen for popstate events
window.addEventListener('popstate', () => {
  lastAnalyzedUrl = null;
  analyzeCurrentPage();
});
