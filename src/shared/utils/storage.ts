import { LocalStorage, SyncStorage, STORAGE_KEYS, DEFAULT_SETTINGS } from '../';

// ============================================================================
// Browser Storage Utilities
// ============================================================================

/**
 * Get data from local storage
 */
export async function getLocalStorage(): Promise<LocalStorage> {
  const result = await browser.storage.local.get([
    STORAGE_KEYS.CV_DOCUMENT,
    STORAGE_KEYS.ANALYZED_JOBS,
  ]);

  return {
    cvDocument: result[STORAGE_KEYS.CV_DOCUMENT] || null,
    analyzedJobs: result[STORAGE_KEYS.ANALYZED_JOBS] || {},
  };
}

/**
 * Get data from sync storage
 */
export async function getSyncStorage(): Promise<SyncStorage> {
  const result = await browser.storage.sync.get([
    STORAGE_KEYS.CV_PROFILE,
    STORAGE_KEYS.SETTINGS,
  ]);

  return {
    cvProfile: result[STORAGE_KEYS.CV_PROFILE] || null,
    settings: result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS,
  };
}

/**
 * Save CV document to local storage
 */
export async function saveCVDocument(cvDocument: LocalStorage['cvDocument']): Promise<void> {
  await browser.storage.local.set({
    [STORAGE_KEYS.CV_DOCUMENT]: cvDocument,
  });
}

/**
 * Save CV profile to sync storage
 */
export async function saveCVProfile(cvProfile: SyncStorage['cvProfile']): Promise<void> {
  await browser.storage.sync.set({
    [STORAGE_KEYS.CV_PROFILE]: cvProfile,
  });
}

/**
 * Save analyzed job to local storage
 */
export async function saveAnalyzedJob(
  jobId: string,
  job: LocalStorage['analyzedJobs'][string]
): Promise<void> {
  const { analyzedJobs } = await getLocalStorage();
  analyzedJobs[jobId] = job;

  await browser.storage.local.set({
    [STORAGE_KEYS.ANALYZED_JOBS]: analyzedJobs,
  });
}

/**
 * Get all analyzed jobs
 */
export async function getAnalyzedJobs(): Promise<LocalStorage['analyzedJobs']> {
  const { analyzedJobs } = await getLocalStorage();
  return analyzedJobs;
}

/**
 * Delete analyzed job
 */
export async function deleteAnalyzedJob(jobId: string): Promise<void> {
  const { analyzedJobs } = await getLocalStorage();
  delete analyzedJobs[jobId];

  await browser.storage.local.set({
    [STORAGE_KEYS.ANALYZED_JOBS]: analyzedJobs,
  });
}

/**
 * Update user settings
 */
export async function updateSettings(
  settings: Partial<SyncStorage['settings']>
): Promise<void> {
  const { settings: currentSettings } = await getSyncStorage();
  const newSettings = { ...currentSettings, ...settings };

  await browser.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: newSettings,
  });
}

/**
 * Clear all storage (for testing/reset)
 */
export async function clearAllStorage(): Promise<void> {
  await browser.storage.local.clear();
  await browser.storage.sync.clear();
}

/**
 * Get storage usage in bytes
 */
export async function getStorageUsage(): Promise<{ local: number; sync: number }> {
  // getBytesInUse might not be available in all browsers
  const localUsage = browser.storage.local.getBytesInUse
    ? await browser.storage.local.getBytesInUse()
    : 0;
  const syncUsage = browser.storage.sync.getBytesInUse
    ? await browser.storage.sync.getBytesInUse()
    : 0;

  return {
    local: localUsage,
    sync: syncUsage,
  };
}

/**
 * Clean old analyzed jobs based on retention days
 */
export async function cleanOldJobs(retentionDays: number): Promise<number> {
  const { analyzedJobs } = await getLocalStorage();
  const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  let deletedCount = 0;

  const updatedJobs: LocalStorage['analyzedJobs'] = {};
  for (const [jobId, job] of Object.entries(analyzedJobs)) {
    const jobDate = new Date(job.analyzedDate).getTime();
    if (jobDate > cutoffDate) {
      updatedJobs[jobId] = job;
    } else {
      deletedCount++;
    }
  }

  await browser.storage.local.set({
    [STORAGE_KEYS.ANALYZED_JOBS]: updatedJobs,
  });

  return deletedCount;
}

/**
 * Get CV document
 */
export async function getCVDocument(): Promise<LocalStorage['cvDocument'] | null> {
  const { cvDocument } = await getLocalStorage();
  return cvDocument || null;
}

/**
 * Get CV profile
 */
export async function getCVProfile(): Promise<SyncStorage['cvProfile'] | null> {
  const { cvProfile } = await getSyncStorage();
  return cvProfile || null;
}

/**
 * Get user settings
 */
export async function getUserSettings(): Promise<SyncStorage['settings'] | null> {
  const { settings } = await getSyncStorage();
  return settings || null;
}

/**
 * Save user settings
 */
export async function saveUserSettings(settings: SyncStorage['settings']): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
}
