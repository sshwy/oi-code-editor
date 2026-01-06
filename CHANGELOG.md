## [0.5.0] - 2026-01-06

### 🚀 Features

- Add initialFold prop to CodeEditor for customizable folding options
- Add active lint range styling to color mode

### 🚜 Refactor

- Enhance CodeViewerBase and editor-view to support customizable folding options

## [0.4.0] - 2026-01-06

### 🚀 Features

- Add support for Python language
- Add style entry for CSS file in package.json
- Add no-status-panel prop to CodeEditor
- Add lint panel styles for smooth linter integration
- Add support for additional editor extensions in CodeEditor and CodeViewer components
- Combine i18n phrases if multiple objects are provided

### 🐛 Bug Fixes

- Correct spelling of 'I18nPhrases' across multiple components and files

### 🚜 Refactor

- Rename ExtMap to ExtensionMap for consistency across the codebase
- Implement better WatchUpdate ViewPlugin to enhance EditorView update handling
- Rename onBottomPanelMount to onStatusPanelMount for clarity and consistency
- Replace WatchUpdate ViewPlugin with a simpler update listener for improved readability and performance
- Simplify style management for status panel items
- Introduce wrap mode management for line wrapping functionality
- Streamline folding functionality by introducing foldTrans for better options handling
- Update createMergeView function to handle optional content parameter
- Replace tabsFacet with tabsField for improved state management in editor view
- Remove commonTabClassList and implement tabsPanelTheme for improved tab styling in CodeViewerBase
- Remove focus outline from the code editor compoment
- Move tab management logic from codemirror extension to CodeViewerBase
- Update CSS variables for header height and font styling in CodeViewerBase
- Extract tab management into a new TabsPanel component for improved code organization and reusability
- Move status panel logic to separated file
- Remove ConfigOptions
- Simplify status panel integration
- Update status panel type definitions for improved clarity
- Enhance fold gutter marker styles
- Update CodeViewerBase to use status panel options for improved flexibility
- Remove redundant EventHandlerSet type
- Simplify prop watching logic in CodeViewerBase and enhance merge view documentation

### ⚙️ Miscellaneous Tasks

- Add model value display in App.vue for enhanced user feedback
- Format code

## [0.3.2] - 2026-01-02

### 🐛 Bug Fixes

- Prevent unnecessary content updates in CodeViewerBase

### ⚙️ Miscellaneous Tasks

- Add git-cliff configuration for changelog generation

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
