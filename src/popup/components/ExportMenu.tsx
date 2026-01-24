/**
 * ExportMenu Component
 *
 * Dropdown menu for exporting job analysis data in various formats
 */

import { useState, useRef, useEffect } from 'react';
import type { AnalyzedJob } from '../../shared/types';
import {
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  copyToClipboard,
  downloadAsFile,
  generateExportFilename
} from '../../shared/utils/exportAnalysis';

interface ExportMenuProps {
  jobs: AnalyzedJob[];
  onExportComplete: (message: string) => void;
  buttonText?: string;
}

export function ExportMenu({ jobs, onExportComplete, buttonText = 'Export' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExport = async (format: 'json' | 'csv' | 'markdown', action: 'copy' | 'download') => {
    try {
      if (jobs.length === 0) {
        onExportComplete('No jobs to export');
        setIsOpen(false);
        return;
      }

      let content: string;
      let mimeType: string;
      let fileExtension: 'json' | 'csv' | 'md';

      switch (format) {
        case 'json':
          content = exportToJSON(jobs);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'csv':
          content = exportToCSV(jobs);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'markdown':
          content = exportToMarkdown(jobs);
          mimeType = 'text/markdown';
          fileExtension = 'md';
          break;
      }

      if (action === 'copy') {
        await copyToClipboard(content);
        onExportComplete(`Copied ${jobs.length} job${jobs.length === 1 ? '' : 's'} as ${format.toUpperCase()} to clipboard!`);
      } else {
        const filename = generateExportFilename(fileExtension);
        downloadAsFile(content, filename, mimeType);
        onExportComplete(`Downloaded ${jobs.length} job${jobs.length === 1 ? '' : 's'} as ${filename}`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('[ExportMenu] Export failed:', error);
      onExportComplete('Export failed. Please try again.');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2"
        disabled={jobs.length === 0}
      >
        📤 {buttonText}
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* JSON options */}
            <button
              onClick={() => handleExport('json', 'copy')}
              className="export-menu-item"
            >
              <span>📋 Copy as JSON</span>
            </button>
            <button
              onClick={() => handleExport('json', 'download')}
              className="export-menu-item"
            >
              <span>💾 Download JSON</span>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* CSV options */}
            <button
              onClick={() => handleExport('csv', 'copy')}
              className="export-menu-item"
            >
              <span>📋 Copy as CSV</span>
            </button>
            <button
              onClick={() => handleExport('csv', 'download')}
              className="export-menu-item"
            >
              <span>📊 Download CSV</span>
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Markdown option */}
            <button
              onClick={() => handleExport('markdown', 'download')}
              className="export-menu-item"
            >
              <span>📄 Download Report (MD)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
