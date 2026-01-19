// web-ext configuration for Firefox extension development
export default {
  // Automatically reload the extension when files change
  run: {
    startUrl: [
      'about:debugging#/runtime/this-firefox',
    ],
    browserConsole: true,
  },
  // Ignore source files and only watch the dist folder
  ignoreFiles: [
    'src/**',
    'node_modules/**',
    'package*.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    '*.md',
    '.git/**',
  ],
};
