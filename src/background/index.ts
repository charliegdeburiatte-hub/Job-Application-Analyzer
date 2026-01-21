import {
  ExtensionMessage,
  JobData,
  Analysis,
  AnalyzedJob,
} from '../shared/types';
import {
  getSyncStorage,
  saveAnalyzedJob,
  analyzeJob,
  isJobPage,
} from '../shared';

// ============================================================================
// Background Service Worker
// ============================================================================

console.log('[Job Analyzer] Background service worker initialized');

// ============================================================================
// Message Handler
// ============================================================================

browser.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender: any, sendResponse: any) => {
    console.log('[Job Analyzer] Received message:', message.type);

    // Handle different message types
    switch (message.type) {
      case 'ANALYZE_JOB':
        handleAnalyzeJob(message.payload.jobData)
          .then((result) => sendResponse(result))
          .catch((error) => {
            console.error('[Job Analyzer] Error analyzing job:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep channel open for async response

      case 'UPDATE_BADGE':
        handleUpdateBadge(message.payload.score);
        sendResponse({ success: true });
        break;

      case 'GET_CURRENT_JOB':
        // Return current tab's job data (if any)
        sendResponse({ success: true, job: null });
        break;

      default:
        console.warn('[Job Analyzer] Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }

    return false;
  }
);

// ============================================================================
// Job Analysis Handler
// ============================================================================

async function handleAnalyzeJob(jobData: JobData): Promise<any> {
  try {
    console.log('[Job Analyzer] Analyzing job:', jobData.title);

    // Get CV profile from storage
    const { cvProfile } = await getSyncStorage();

    if (!cvProfile) {
      console.warn('[Job Analyzer] No CV profile found');
      return {
        success: false,
        error: 'No CV uploaded. Please upload your CV first.',
      };
    }

    // Validate CV has skills
    if (!cvProfile.skills || cvProfile.skills.length === 0) {
      return {
        success: false,
        error: 'Your CV has no skills extracted. Please upload a valid CV.',
      };
    }

    // Run analysis algorithm
    const analysis: Analysis = analyzeJob(jobData, cvProfile);

    console.log('[Job Analyzer] Analysis complete:', analysis);

    // Create analyzed job record
    const analyzedJob: AnalyzedJob = {
      jobId: analysis.jobId,
      url: jobData.url,
      title: jobData.title,
      company: jobData.company,
      analyzedDate: analysis.analyzedDate,
      matchScore: analysis.matchScore,
      status: 'analyzed',
      matchDetails: analysis.matchDetails,
      lastUpdated: analysis.analyzedDate,
    };

    // Save to storage
    await saveAnalyzedJob(analysis.jobId, analyzedJob);

    // Update badge with match score
    await updateBadge(analysis.matchScore);

    // Send notification (if enabled)
    const { settings } = await getSyncStorage();
    if (settings.showNotifications) {
      await showNotification(jobData.title, analysis);
    }

    return {
      success: true,
      analysis,
      job: analyzedJob,
    };
  } catch (error) {
    console.error('[Job Analyzer] Error in handleAnalyzeJob:', error);
    throw error;
  }
}

// ============================================================================
// Badge Management
// ============================================================================

function handleUpdateBadge(score: number) {
  updateBadge(score);
}

async function updateBadge(score: number) {
  try {
    // Set badge text
    await browser.action.setBadgeText({ text: `${score}%` });

    // Set badge color based on score
    let color: [number, number, number, number];

    if (score >= 70) {
      color = [16, 185, 129, 255]; // Green
    } else if (score >= 50) {
      color = [245, 158, 11, 255]; // Amber
    } else {
      color = [239, 68, 68, 255]; // Red
    }

    await browser.action.setBadgeBackgroundColor({ color });

    console.log('[Job Analyzer] Badge updated:', score);
  } catch (error) {
    console.error('[Job Analyzer] Error updating badge:', error);
  }
}

// ============================================================================
// Notifications
// ============================================================================

async function showNotification(jobTitle: string, analysis: Analysis) {
  try {
    const { recommendation, matchScore } = analysis;

    let message = '';
    if (recommendation === 'apply') {
      message = `✅ ${matchScore}% match - Great fit!`;
    } else if (recommendation === 'maybe') {
      message = `⚠️ ${matchScore}% match - Possible fit`;
    } else {
      message = `❌ ${matchScore}% match - Weak fit`;
    }

    await browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('icons/icon48.png'),
      title: 'Job Analysis Complete',
      message: `${jobTitle}\n${message}`,
    });
  } catch (error) {
    console.error('[Job Analyzer] Error showing notification:', error);
  }
}

// ============================================================================
// Extension Icon Click Handler
// ============================================================================

browser.action.onClicked.addListener(async (_tab: any) => {
  console.log('[Job Analyzer] Extension icon clicked');

  // Open popup (default behavior with default_popup in manifest)
  // This handler is only called if default_popup is not set
});

// ============================================================================
// Installation Handler
// ============================================================================

browser.runtime.onInstalled.addListener((details: any) => {
  console.log('[Job Analyzer] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time installation
    console.log('[Job Analyzer] First time installation');

    // Open onboarding page or show welcome notification
    browser.tabs.create({
      url: browser.runtime.getURL('popup/index.html'),
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[Job Analyzer] Extension updated');
  }
});

// ============================================================================
// Tab Update Listener (for URL changes)
// ============================================================================

browser.tabs.onUpdated.addListener((tabId: any, changeInfo: any, tab: any) => {
  // Reset badge when navigating to new page
  if (changeInfo.status === 'complete' && tab.url) {
    const { isJob } = isJobPage(tab.url);

    if (!isJob) {
      // Clear badge if not on job page
      browser.action.setBadgeText({ text: '', tabId });
    }
  }
});

export {};
