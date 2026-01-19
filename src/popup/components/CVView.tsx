import { useState } from 'react';
import { usePopupStore } from '../store';
import mammoth from 'mammoth';
import { fileToBase64, formatDateShort } from '@/shared';
import { CVDocument, CVProfile } from '@/shared/types';
import LoadingSpinner from './LoadingSpinner';

export default function CVView() {
  const { cvDocument, cvProfile, saveCVData, setError } = usePopupStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
    setError(null);

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

      // Basic skill extraction (improved in Phase 2)
      const skills = extractSkillsFromText(extractedText);

      // Create basic CV profile
      const cvProf: CVProfile = {
        personalInfo: {},
        skills,
        experience: [],
        education: [],
      };

      // Save to storage
      await saveCVData(cvDoc, cvProf);

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

  // Basic skill extraction function
  const extractSkillsFromText = (text: string): string[] => {
    // Import the skills list
    const { COMMON_SKILLS } = require('@/shared/constants');
    const skills = new Set<string>();

    for (const skill of COMMON_SKILLS) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        skills.add(skill);
      }
    }

    return Array.from(skills);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your CV</h2>

      {/* Upload Section */}
      {!cvDocument ? (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Upload Your CV
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload your CV in .docx format to start analyzing jobs
          </p>

          {isUploading ? (
            <LoadingSpinner text="Parsing CV..." />
          ) : (
            <label className="block">
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="btn-primary cursor-pointer text-center">
                📄 Choose DOCX File
              </div>
            </label>
          )}
        </div>
      ) : (
        <>
          {/* Current CV */}
          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  📄 {cvDocument.fileName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Uploaded: {formatDateShort(cvDocument.uploadDate)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Size: {Math.round(cvDocument.fileSize / 1024)} KB
                </p>
              </div>
            </div>

            <div className="mt-4">
              {isUploading ? (
                <LoadingSpinner text="Uploading new CV..." />
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="btn-secondary cursor-pointer text-center w-full">
                    Upload New CV
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Extracted Skills */}
          {cvProfile && cvProfile.skills.length > 0 && (
            <div className="card">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                These skills were automatically extracted from your CV
              </p>
            </div>
          )}

          {/* CV Preview */}
          <div className="card max-h-64 overflow-y-auto scrollbar-thin">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              CV Preview
            </h3>
            <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {cvDocument.extractedText.slice(0, 1000)}
              {cvDocument.extractedText.length > 1000 && '...'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
