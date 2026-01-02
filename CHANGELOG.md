## [0.3.1] - 2026-01-02

### 🐛 Bug Fixes

- Fix props type of components
- Make content optional

### ⚙️ Miscellaneous Tasks

- Add .cursor to .gitignore

## [0.3.0] - 2026-01-02

### 🚀 Features

- Introduce edit mode functionality in CodeEditor and CodeViewer

### 🐛 Bug Fixes

- Fix import path in output type declaration

### 🚜 Refactor

- Update import paths to use relative paths in index.ts and lib/index.ts
- Put color mode support to separated file

### ⚙️ Miscellaneous Tasks

- Update pnpm-lock.yaml
- Update type definitions and include paths in package.json and tsconfig.lib.json
- Reorganize dependencies in package.json and pnpm-lock.yaml, and add CodeMirror globals in vite.config.lib.ts
- Sync edit mode in demo page
- _(version)_ Bump to 0.3.0

## [0.2.1] - 2026-01-01

### 🚜 Refactor

- Streamline editor-view setup by extracting common extensions into a new file
- Rename compareContent to comparedContent for consistency in CodeViewer and App components

### 📚 Documentation

- Add CHANGELOG.md

### ⚙️ Miscellaneous Tasks

- Add code compare example
- Remove unused VSCode extensions configuration
- Update dependencies and improve theme imports in package.json and editor-view.ts
- _(version)_ Bump to 0.2.1

## [0.2.0] - 2026-01-01

### 🚀 Features

- Add multi-line define folding support and enhance preprocessor folding regex
- Add links to GitHub repository and NPM package in the demo page
- Implement internationalization support with i18n phrases in code editor components

### 🐛 Bug Fixes

- Ensure onUpdate callback is only called if defined in useEditorView

### 🚜 Refactor

- Move tabs extension to a new file and clean up editor-view.ts
- Extract language support and extension mapping into separate files
- Consolidate exports from editor-view into lib and update component imports

### 📚 Documentation

- Enhance README

### ⚙️ Miscellaneous Tasks

- Update GitHub Actions workflows to deploy documentation and publish to NPM on release branch
- Add LICENSE
- Rename package to @sshwy/oi-code-editor and update publish command in workflow
- Add homepage URL to package.json
- Add license information and include LICENSE file in package.json
- _(version)_ Bump to 0.2.0

## [0.1.0] - 2026-01-01

### 🚀 Features

- Add CodeViewer component and integrate CodeMirror
- Integrate Tailwind CSS and PostCSS, update styles and add new assets
- Enhance dark mode support and update dependencies
- Add CodeEditor component and integrate it into App.vue with example usage
- Implement code folding features in CodeViewer and integrate initial fold options
- Beautify fold icons
- Set default color mode to 'auto' and update component descriptions to English
- Add GitHub Actions workflow for deploying documentation to GitHub Pages

### 🚜 Refactor

- Rename panel mount events to bottomPanelMount for clarity
- Update CodeViewer styles and enhance tab class management
- Update imports to use new editor-view module and restructure related components

### 📚 Documentation

- Update README to reflect changes in CodeViewer component and demo usage

### ⚙️ Miscellaneous Tasks

- Init project
- Set up library structure and update documentation
- Update package configuration and enhance type definitions
- Update library entry point and restructure exports in components
- Format code
- _(ci)_ Update GitHub Actions workflow to install Node.js version 25 and adjust pnpm setup
- Update Vite configuration base path and format pnpm cache setting in GitHub Actions workflow
- Add .gitattributes file to mark assets as vendored
- Add GitHub Actions workflow for publishing NPM library on release branch
- Update package version to 0.1.0 and add repository information
