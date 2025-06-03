document.addEventListener('DOMContentLoaded', () => {
    const fileTreeElement = document.getElementById('file-tree');
    const selectedFileNameElement = document.getElementById('selected-file-name');
    const codeDisplayElement = document.getElementById('code-display');
    const codeDisplayContainer = document.getElementById('code-display-container');
    const iframeClientViewer = document.getElementById('iframe-client-viewer');
    const exportedMembersElement = document.getElementById('exported-members');
    let currentSelectedElement = null;

    const buildProjectButton = document.getElementById('build-project-button');
    const buildOutputContainer = document.getElementById('build-output-container');
    const buildLogElement = document.getElementById('build-log');

    const initialProjectStructure = [
        { name: 'App.tsx', path: 'App.tsx', type: 'file' },
        { name: 'global.d.ts', path: 'global.d.ts', type: 'file' },
        { name: 'index.js', path: 'index.js', type: 'file' },
        {
            name: 'app', type: 'folder', children: [
                { name: '_layout.tsx', path: 'app/_layout.tsx', type: 'file' },
                {
                    name: '(tabs)', type: 'folder', children: [
                        { name: '_layout.tsx', path: 'app/(tabs)/_layout.tsx', type: 'file' },
                        { name: 'events.tsx', path: 'app/(tabs)/events.tsx', type: 'file' },
                        { name: 'index.tsx', path: 'app/(tabs)/index.tsx', type: 'file' },
                        { name: 'messages.tsx', path: 'app/(tabs)/messages.tsx', type: 'file' },
                    ]
                }
            ]
        },
        {
            name: 'hooks', type: 'folder', children: [
                { name: 'useFrameworkReady.ts', path: 'hooks/useFrameworkReady.ts', type: 'file' }
            ]
        },
        {
            name: 'src', type: 'folder', children: [
                {
                    name: 'components', type: 'folder', children: [
                        {
                            name: 'Feed', type: 'folder', children: [
                                { name: 'CreatePost.tsx', path: 'src/components/Feed/CreatePost.tsx', type: 'file', missing: true }, // Mark as potentially missing if not provided
                                { name: 'FeedHeader.tsx', path: 'src/components/Feed/FeedHeader.tsx', type: 'file' },
                                { name: 'FeedScreen.tsx', path: 'src/components/Feed/FeedScreen.tsx', type: 'file' },
                                { name: 'ImagePicker.tsx', path: 'src/components/Feed/ImagePicker.tsx', type: 'file' },
                                { name: 'PostDetail.tsx', path: 'src/components/Feed/PostDetail.tsx', type: 'file' },
                                { name: 'PostList.tsx', path: 'src/components/Feed/PostList.tsx', type: 'file' },
                                { name: 'ShareModal.tsx', path: 'src/components/Feed/ShareModal.tsx', type: 'file' },
                            ]
                        }
                    ]
                },
                {
                    name: 'navigation', type: 'folder', children: [
                         { name: 'AuthStack.tsx', path: 'src/navigation/AuthStack.tsx', type: 'file', missing: true }, // Mark as potentially missing
                         { name: 'MainStack.tsx', path: 'src/navigation/MainStack.tsx', type: 'file', missing: true }, // Mark as potentially missing
                    ]
                },
                {
                    name: 'types', type: 'folder', children: [
                        { name: 'post.ts', path: 'src/types/post.ts', type: 'file' }
                    ]
                }
            ]
        }
    ];

    let currentProjectStructure = JSON.parse(JSON.stringify(initialProjectStructure));

    function renderFileTree(parentElement, structure) {
        structure.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('tree-item');
            if (item.missing) { // Visually indicate missing files if desired
                li.style.opacity = "0.6";
                li.title = "File content not provided in initial setup";
            }

            const span = document.createElement('span');
            span.textContent = item.name;

            if (item.type === 'folder') {
                span.classList.add('folder-name');
                if (item.name === 'build') { // Special icon for build folder
                    span.textContent = '📦 ' + item.name;
                } else {
                     span.textContent = '📁 ' + item.name;
                }
                li.appendChild(span);
                const subUl = document.createElement('ul');
                if (item.children) {
                    renderFileTree(subUl, item.children);
                }
                li.appendChild(subUl);
                // Basic folder collapse/expand
                span.addEventListener('click', () => {
                    subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                });

            } else {
                span.classList.add('file-name');
                const extension = item.name.split('.').pop();
                span.classList.add(extension); // for specific file type icons via CSS
                li.appendChild(span);
                li.addEventListener('click', async (event) => {
                    event.stopPropagation(); 
                    if (currentSelectedElement) {
                        currentSelectedElement.classList.remove('selected');
                    }
                    li.classList.add('selected');
                    currentSelectedElement = li;
                    await loadFileContent(item); // Pass the whole item
                });
            }
            parentElement.appendChild(li);
        });
    }

    async function loadFileContent(item) {
        const fileName = item.name;
        const filePath = item.path;

        try {
            selectedFileNameElement.textContent = `Loading ${fileName}...`;
            exportedMembersElement.innerHTML = '';
            codeDisplayElement.textContent = '';
            iframeClientViewer.srcdoc = ''; // Clear iframe
            iframeClientViewer.style.display = 'none';
            codeDisplayContainer.style.display = 'none'; // Hide code view initially

            if (item.isClientIndex && item.content) {
                selectedFileNameElement.textContent = `${fileName} (Live Preview)`;
                iframeClientViewer.srcdoc = item.content;
                iframeClientViewer.style.display = 'block';
                exportedMembersElement.innerHTML = '<em>Displaying simulated client application.</em>';
            } else if (item.content) { // For build artifacts with content (like bundles)
                selectedFileNameElement.textContent = fileName;
                codeDisplayElement.textContent = item.content;
                codeDisplayContainer.style.display = 'flex'; // Show code view as flex
                const extension = fileName.split('.').pop();
                let language = 'plaintext';
                if (['ts', 'tsx', 'js', 'jsx'].includes(extension)) language = 'javascript';
                else if (extension === 'html') language = 'html';
                else if (extension === 'css') language = 'css';
                else if (extension === 'json') language = 'json';
                
                codeDisplayElement.className = `language-${language}`;
                Prism.highlightElement(codeDisplayElement);
                extractExportedMembers(item.content, extension);
            } else if (item.missing) {
                 selectedFileNameElement.textContent = fileName;
                 codeDisplayElement.textContent = `// File: ${fileName}\n// Content for this file was not provided in the initial setup.`;
                 codeDisplayContainer.style.display = 'flex';
                 codeDisplayElement.className = 'language-typescript'; // Default
                 Prism.highlightElement(codeDisplayElement);
                 exportedMembersElement.innerHTML = '<em>File content placeholder.</em>';
            } else { // For regular project files to be fetched
                selectedFileNameElement.textContent = fileName;
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
                }
                const code = await response.text();
                codeDisplayElement.textContent = code;
                codeDisplayContainer.style.display = 'flex';
                
                const extension = fileName.split('.').pop();
                let language = 'markup'; 
                if (['ts', 'tsx'].includes(extension)) language = 'typescript';
                else if (['js', 'jsx'].includes(extension)) language = 'javascript';
                else if (extension === 'css') language = 'css';
                else if (extension === 'json') language = 'json';
                
                codeDisplayElement.className = `language-${language}`;
                Prism.highlightElement(codeDisplayElement);
                extractExportedMembers(code, extension);
            }

        } catch (error) {
            selectedFileNameElement.textContent = `Error loading ${fileName}`;
            codeDisplayElement.textContent = `Could not load file: ${error.message}\nPath: ${filePath}`;
            codeDisplayContainer.style.display = 'flex';
            console.error('Error loading file:', error);
            exportedMembersElement.innerHTML = '<em>Error loading file.</em>';
        }
    }

    function extractExportedMembers(code, extension) {
        if (!['ts', 'tsx', 'js'].includes(extension)) {
            exportedMembersElement.innerHTML = '';
            return;
        }

        let html = '';
        const defaultExportRegex = /export default function (\w+)|export default class (\w+)|export default (\w+)/g;
        const namedFunctionExportRegex = /export function (\w+)/g;
        const namedConstExportRegex = /export const (\w+)/g;
        const namedInterfaceExportRegex = /export interface (\w+)/g;
        const namedTypeExportRegex = /export type (\w+)/g;

        let match;
        
        const defaults = [];
        while ((match = defaultExportRegex.exec(code)) !== null) {
            defaults.push(match[1] || match[2] || match[3]);
        }
        if (defaults.length > 0) {
            html += `<strong>Default Export:</strong> ${defaults.join(', ')}<br>`;
        }

        const named = [];
        const regexes = [namedFunctionExportRegex, namedConstExportRegex, namedInterfaceExportRegex, namedTypeExportRegex];
        regexes.forEach(regex => {
            while ((match = regex.exec(code)) !== null) {
                named.push(match[1]);
            }
        });

        if (named.length > 0) {
            html += `<strong>Named Exports:</strong> ${named.join(', ')}`;
        }
        
        exportedMembersElement.innerHTML = html || '<em>No explicit exports found or file type not analyzed.</em>';
    }

    renderFileTree(fileTreeElement, currentProjectStructure);

    // --- Build Simulation Logic ---
    const baseMockBuildLogs = [
        "[INFO] Build process started...",
        "[INFO] Cleaning previous build artifacts...",
        "[SUCCESS] Clean complete.",
        "[INFO] Resolving project dependencies (simulated)...",
        "[INFO] Found 55 dependencies to check.",
        "[SUCCESS] All dependencies resolved.",
        "[INFO] Linting TypeScript and JSX files...",
        "[SUCCESS] Linting complete. 0 errors, 2 warnings.",
        "[INFO] Starting Metro bundler (simulated)...",
        "[INFO] Metro bundler ready on port 8081 (simulated).",
    ];

    const artifactGenerationLogs = [
        "[INFO] Generating web client at build/output/web-client/index.html...",
        "[PROGRESS] Web client generation: 50% complete...",
        "[SUCCESS] Web client (build/output/web-client/index.html) generated.",
        "[INFO] Generating web client assets (build/output/web-client/app.js)...",
        "[SUCCESS] Web client assets generated.",
        "[INFO] Bundling JavaScript for Android platform (build/output/android/main.jsbundle)...",
        "[PROGRESS] Android Bundling: 25% complete...",
        "[PROGRESS] Android Bundling: 75% complete...",
        "[SUCCESS] Android JS bundle complete: build/output/android/main.jsbundle",
        "[INFO] Bundling JavaScript for iOS platform (build/output/ios/main.jsbundle)...",
        "[PROGRESS] iOS Bundling: 25% complete...",
        "[PROGRESS] iOS Bundling: 75% complete...",
        "[SUCCESS] iOS JS bundle complete: build/output/ios/main.jsbundle",
        "[INFO] Compiling native Android modules (simulated)...",
        "[SUCCESS] Android native modules compiled.",
        "[INFO] Generating Android APK (debug)...",
        "[SUCCESS] Android APK generated: build/output/apk/debug/app-debug.apk (simulated file, not browsable)",
        "[INFO] Compiling native iOS modules (simulated)...",
        "[SUCCESS] iOS native modules compiled.",
        "[INFO] Generating iOS App (debug, simulator)...",
        "[SUCCESS] iOS App generated: build/output/app/debug/MyApp.app (simulated file, not browsable)",
        "[INFO] Build process finished successfully.",
        "[INFO] Total build time: 15.3s (simulated)."
    ];


    let currentLogIndex = 0;
    let buildInProgress = false;
    let currentLogsArray = [];

    function appendLogEntry() {
        if (currentLogIndex < currentLogsArray.length) {
            const timestamp = new Date().toLocaleTimeString();
            buildLogElement.textContent += `[${timestamp}] ${currentLogsArray[currentLogIndex]}\n`;
            buildLogElement.scrollTop = buildLogElement.scrollHeight; 
            currentLogIndex++;
            setTimeout(appendLogEntry, Math.random() * 200 + 50); 
        } else {
            buildLogElement.textContent += `\nBuild simulation complete. You can now browse the 'build' folder in the file tree.\n`;
            buildLogElement.scrollTop = buildLogElement.scrollHeight;
            buildInProgress = false;
            buildProjectButton.disabled = false;
            buildProjectButton.textContent = 'Build Project';
        }
    }

    function generateMockFileContent() {
        const mockClientHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulated Built Client</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #282c34; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .app-header { background-color: #61dafb; padding: 20px; width: 100%; box-sizing: border-box; }
        .app-header img { height: 40px; vertical-align: middle; margin-right: 10px; animation: spin 2s linear infinite; }
        .app-header h1 { display: inline; margin: 0; font-size: 1.8em; color: #20232a; }
        .app-content { padding: 30px; }
        .app-content p { font-size: 1.1em; line-height: 1.6; }
        .app-content button { background-color: #61dafb; color: #20232a; border: none; padding: 10px 20px; font-size: 1em; border-radius: 5px; cursor: pointer; margin-top: 20px; transition: background-color 0.3s; }
        .app-content button:hover { background-color: #52c2e0; }
        .client-log { margin-top: 20px; padding: 15px; background-color: rgba(255,255,255,0.1); border-radius: 5px; font-family: 'Courier New', Courier, monospace; font-size: 0.9em; text-align: left; max-height: 150px; overflow-y: auto; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <header class="app-header">
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" alt="React Logo">
        <h1>Simulated React Native Web Client</h1>
    </header>
    <main class="app-content">
        <p>Welcome to your built application! This is a simplified representation.</p>
        <button id="actionButton">Click Me!</button>
        <div class="client-log" id="clientLogOutput"></div>
    </main>
    <script>
        const logOutput = document.getElementById('clientLogOutput');
        function logToClient(message) {
            const p = document.createElement('p');
            p.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            logOutput.appendChild(p);
            logOutput.scrollTop = logOutput.scrollHeight;
        }
        logToClient("Client application initialized.");
        logToClient("Simulated app.js (bundle) loaded.");

        document.getElementById('actionButton').addEventListener('click', () => {
            logToClient("Button clicked! Performing action...");
            alert("Action performed in simulated client!");
        });

        // Simulate some async operations or component loading
        setTimeout(() => {
            logToClient("Async data loaded (simulated).");
        }, 1500);
        setTimeout(() => {
            logToClient("UI components rendered (simulated).");
        }, 2500);
    </script>
</body>
</html>`;
        const mockJSBundle = `
// Simulated JavaScript Bundle (app.js / main.jsbundle)
// Version: 1.0.0
// Build Timestamp: ${new Date().toISOString()}

(function() {
"use strict";

console.log("[Bundle] Initializing application...");

// Simulate some module definitions
const AppConfig = {
  appName: "SimulatedApp",
  version: "1.0.0",
  apiEndpoint: "/api/v1",
};

function greet(name) {
  const message = \`Hello, \${name}! Welcome to \${AppConfig.appName} v\${AppConfig.version}.\`;
  console.log(\`[Bundle] \${message}\`);
  return message;
}

// Simulate some UI interactions or logic that might be in a real app
function setupUI() {
  console.log("[Bundle] Setting up UI components...");
  // In a real app, this would interact with the DOM or native views
  // For this simulation, we just log.
  if (typeof document !== 'undefined' && document.body) {
    const notice = document.createElement('div');
    notice.textContent = 'JavaScript Bundle Partially Executed (Simulated)';
    notice.style.cssText = 'background-color: yellow; color: black; padding: 5px; text-align: center; font-size: 0.8em;';
    // document.body.insertAdjacentElement('afterbegin', notice);
    // Note: Injecting DOM elements from a general bundle like this might not always reflect React Native's behavior, 
    // especially if this bundle is meant for native platforms. For web client, it's more plausible.
  }
}

// Simulate app startup
function main() {
  console.log("[Bundle] Main function started.");
  greet("Developer");
  setupUI();
  console.log("[Bundle] Application startup complete.");
}

// Execute main function
main();

// Expose some pseudo-module (not real ES modules in this simple string)
var MyApp = {
  config: AppConfig,
  greet: greet,
  run: main
};
// Attempt to make it available globally for extremely simple interaction if loaded directly in basic HTML
if (typeof window !== 'undefined') {
  window.SimulatedAppBundle = MyApp;
}

})();
`;
        return { mockClientHTML, mockJSBundle };
    }


    function simulateBuildProcess() {
        if (buildInProgress) return;

        buildInProgress = true;
        buildProjectButton.disabled = true;
        buildProjectButton.textContent = 'Building...';
        
        buildLogElement.textContent = ''; 
        currentLogIndex = 0;
        currentLogsArray = [...baseMockBuildLogs]; // Start with base logs

        // Simulate cleaning build folder from structure
        currentProjectStructure = currentProjectStructure.filter(item => item.name !== 'build');
        
        // Generate mock file content
        const { mockClientHTML, mockJSBundle } = generateMockFileContent();

        // Add specific artifact generation logs
        currentLogsArray.push(...artifactGenerationLogs);

        // Create build folder structure
        const buildFolder = {
            name: 'build',
            type: 'folder',
            children: [
                {
                    name: 'output',
                    type: 'folder',
                    children: [
                        {
                            name: 'web-client',
                            type: 'folder',
                            children: [
                                { name: 'index.html', type: 'file', path: 'build/output/web-client/index.html', content: mockClientHTML, isClientIndex: true },
                                { name: 'app.js', type: 'file', path: 'build/output/web-client/app.js', content: mockJSBundle }
                            ]
                        },
                        {
                            name: 'android',
                            type: 'folder',
                            children: [
                                { name: 'main.jsbundle', type: 'file', path: 'build/output/android/main.jsbundle', content: mockJSBundle }
                            ]
                        },
                        {
                            name: 'ios',
                            type: 'folder',
                            children: [
                                { name: 'main.jsbundle', type: 'file', path: 'build/output/ios/main.jsbundle', content: mockJSBundle }
                            ]
                        },
                        { // Placeholder for non-browsable compiled outputs
                            name: 'apk', type: 'folder', children: [
                                { name: 'debug', type: 'folder', children: [
                                     { name: 'app-debug.apk', type: 'file', path: 'build/output/apk/debug/app-debug.apk', content: "// Simulated APK binary data...\nThis is not a real APK file.", isBinary: true }
                                ]}
                            ]
                        },
                         {
                            name: 'app', type: 'folder', children: [
                                { name: 'debug', type: 'folder', children: [
                                     { name: 'MyApp.app', type: 'file', path: 'build/output/app/debug/MyApp.app', content: "// Simulated iOS App bundle data...\nThis is not a real .app bundle.", isBinary: true }
                                ]}
                            ]
                        }
                    ]
                }
            ]
        };
        currentProjectStructure.push(buildFolder);

        // Re-render file tree after a short delay to allow some logs to appear first
        setTimeout(() => {
            fileTreeElement.innerHTML = ''; // Clear old tree
            renderFileTree(fileTreeElement, currentProjectStructure);
        }, 500 * (baseMockBuildLogs.length / 2)); // Delay based on number of initial logs

        appendLogEntry();
    }

    if (buildProjectButton) {
        buildProjectButton.addEventListener('click', simulateBuildProcess);
    } else {
        console.error("Build project button not found.");
    }
    
    if (buildLogElement) {
         buildLogElement.textContent = 'Click "Build Project" to start a simulated build.\n';
    }

    // Load a default file if any (e.g. README or first file)
    // For now, let user click. If you want a default, find App.tsx or similar and call loadFileContent.
    // const readmeFile = currentProjectStructure.find(f => f.name.toLowerCase() === 'app.tsx');
    // if (readmeFile) {
    //    loadFileContent(readmeFile);
    //    const firstLi = fileTreeElement.querySelector('.file-name.tsx');
    //    if(firstLi && firstLi.parentElement) {
    //        firstLi.parentElement.classList.add('selected');
    //        currentSelectedElement = firstLi.parentElement;
    //    }
    // }
});