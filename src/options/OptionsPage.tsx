import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import mammoth from 'mammoth';
import '../popup/index.css';
import { getCVDocument, getCVProfile, saveCVDocument, saveCVProfile, getUserSettings, saveUserSettings } from '@/shared/utils/storage';
import { CVDocument, CVProfile, UserSettings } from '@/shared/types';
import { fileToBase64, formatDateShort } from '@/shared/utils/helpers';
import { COMMON_SKILLS, DEFAULT_SETTINGS } from '@/shared/constants';

function OptionsPage() {
  const [cvDocument, setCvDocument] = useState<CVDocument | null>(null);
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cv, profile, userSettings] = await Promise.all([
      getCVDocument(),
      getCVProfile(),
      getUserSettings(),
    ]);
    setCvDocument(cv);
    setCvProfile(profile);
    setSettings(userSettings || DEFAULT_SETTINGS);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate file type
    if (!file.name.endsWith('.docx')) {
      setError('Please upload a .docx file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Parse DOCX with mammoth.js
      const arrayBuffer = await file.arrayBuffer();
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const extractedText = textResult.value;

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('CV appears to be empty or too short');
      }

      // Create CV document
      const cvDoc: CVDocument = {
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        docxBase64: base64,
        extractedText,
        fileSize: file.size,
      };

      // Extract skills
      const skills = extractSkillsFromText(extractedText);

      // Create CV profile
      const cvProf: CVProfile = {
        personalInfo: {},
        skills,
        experience: [],
        education: [],
      };

      // Save to storage
      await saveCVDocument(cvDoc);
      await saveCVProfile(cvProf);

      setCvDocument(cvDoc);
      setCvProfile(cvProf);
      setSuccess('CV uploaded successfully!');

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading CV:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to upload CV. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const extractSkillsFromText = (text: string): string[] => {
    const skills = new Set<string>();

    for (const skill of COMMON_SKILLS) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        skills.add(skill);
      }
    }

    return Array.from(skills);
  };

  const handleSettingChange = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await saveUserSettings(newSettings);
    setSuccess('Settings saved!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Job Application Analyzer Settings
        </h1>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* CV Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your CV
          </h2>

          {!cvDocument ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your CV in .docx format to start analyzing jobs
              </p>

              {isUploading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sabbath-600"></div>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Parsing CV...</span>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="btn-primary cursor-pointer text-center inline-block">
                    📄 Choose DOCX File
                  </div>
                </label>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  📄 {cvDocument.fileName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Uploaded: {formatDateShort(cvDocument.uploadDate)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Size: {Math.round(cvDocument.fileSize / 1024)} KB
                </p>
              </div>

              {isUploading ? (
                <div className="flex items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sabbath-600"></div>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Uploading new CV...</span>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="btn-secondary cursor-pointer text-center inline-block">
                    Upload New CV
                  </div>
                </label>
              )}

              {/* Extracted Skills */}
              {cvProfile && cvProfile.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Extracted Skills ({cvProfile.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cvProfile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-tag skill-tag-matched"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    These skills were automatically extracted from your CV
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popup Size Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Popup Size
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose how large the extension popup appears
          </p>

          <div className="space-y-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <label key={size} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="popupSize"
                  value={size}
                  checked={settings.popupSize === size}
                  onChange={(e) => handleSettingChange('popupSize', e.target.value)}
                  className="w-4 h-4 text-sabbath-600 focus:ring-sabbath-500"
                />
                <span className="text-gray-700 dark:text-gray-300 capitalize">{size}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({size === 'small' ? '400px' : size === 'medium' ? '500px' : '600px'} wide)
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Other Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Other Settings
          </h2>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Color Theme
            </label>
            <select
              value={settings.colorTheme}
              onChange={(e) => handleSettingChange('colorTheme', e.target.value as 'sabbath' | 'professional')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="sabbath">Black Sabbath Purple 🤘</option>
              <option value="professional">Professional Purple 💼</option>
            </select>
          </div>

          {/* Dark Mode */}
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Theme Mode
            </label>
            <select
              value={settings.themeMode}
              onChange={(e) => handleSettingChange('themeMode', e.target.value as 'light' | 'dark')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Minimum Match Percentage */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Minimum Match Percentage for "Apply" Recommendation
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.minimumMatchPercentage}
              onChange={(e) => handleSettingChange('minimumMatchPercentage', parseInt(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <span className="ml-2 text-gray-600 dark:text-gray-400">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <OptionsPage />
);
