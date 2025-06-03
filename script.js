document.addEventListener('DOMContentLoaded', () => {
    const fileTreeElement = document.getElementById('file-tree');
    const selectedFileNameElement = document.getElementById('selected-file-name');
    const codeDisplayElement = document.getElementById('code-display');
    const exportedMembersElement = document.getElementById('exported-members');
    let currentSelectedElement = null;

    const buildProjectButton = document.getElementById('build-project-button');
    const buildOutputContainer = document.getElementById('build-output-container');
    const buildLogElement = document.getElementById('build-log');

    const projectStructure = [
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
                                { name: 'CreatePost.tsx', path: 'src/components/Feed/CreatePost.tsx', type: 'file' },
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
                        { name: 'AuthStack.tsx', path: 'src/navigation/AuthStack.tsx', type: 'file' },
                        { name: 'MainStack.tsx', path: 'src/navigation/MainStack.tsx', type: 'file' },
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

    function renderFileTree(parentElement, structure) {
        structure.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('tree-item');

            const span = document.createElement('span');
            span.textContent = item.name;

            if (item.type === 'folder') {
                span.classList.add('folder-name');
                li.appendChild(span);
                const subUl = document.createElement('ul');
                renderFileTree(subUl, item.children);
                li.appendChild(subUl);
            } else {
                span.classList.add('file-name');
                const extension = item.name.split('.').pop();
                span.classList.add(extension); // for specific file type icons via CSS
                li.appendChild(span);
                li.addEventListener('click', async (event) => {
                    event.stopPropagation(); // Prevent parent folders from collapsing/expanding
                    if (currentSelectedElement) {
                        currentSelectedElement.classList.remove('selected');
                    }
                    li.classList.add('selected');
                    currentSelectedElement = li;
                    await loadFileContent(item.path, item.name);
                });
            }
            parentElement.appendChild(li);
        });
    }

    async function loadFileContent(filePath, fileName) {
        try {
            selectedFileNameElement.textContent = `Loading ${fileName}...`;
            exportedMembersElement.innerHTML = '';
            codeDisplayElement.textContent = '';

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const code = await response.text();

            selectedFileNameElement.textContent = fileName;
            codeDisplayElement.textContent = code;
            
            const extension = fileName.split('.').pop();
            let language = 'markup'; // Default
            if (['ts', 'tsx'].includes(extension)) language = 'typescript';
            else if (extension === 'js') language = 'javascript';
            else if (extension === 'css') language = 'css';
            else if (extension === 'json') language = 'json';
            
            codeDisplayElement.className = `language-${language}`;
            Prism.highlightElement(codeDisplayElement);

            extractExportedMembers(code, extension);

        } catch (error) {
            selectedFileNameElement.textContent = `Error loading ${fileName}`;
            codeDisplayElement.textContent = `Could not load file: ${error.message}`;
            console.error('Error loading file:', error);
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

    renderFileTree(fileTreeElement, projectStructure);

    // --- Build Simulation Logic ---
    const mockBuildLogs = [
        "[INFO] Build process started...",
        "[INFO] Cleaning previous build artifacts (simulated)...",
        "[SUCCESS] Clean complete.",
        "[INFO] Resolving project dependencies (simulated)...",
        "[INFO] Found 55 dependencies to check.",
        "[SUCCESS] All dependencies resolved.",
        "[INFO] Linting TypeScript and JSX files...",
        "[SUCCESS] Linting complete. 0 errors, 2 warnings.",
        "[INFO] Starting Metro bundler (simulated)...",
        "[INFO] Metro bundler ready on port 8081 (simulated).",
        "[INFO] Bundling JavaScript for Android platform...",
        "[PROGRESS] Bundling: 25% complete...",
        "[PROGRESS] Bundling: 50% complete...",
        "[PROGRESS] Bundling: 75% complete...",
        "[SUCCESS] Android JS bundle complete: /build/outputs/android/main.jsbundle",
        "[INFO] Bundling JavaScript for iOS platform...",
        "[PROGRESS] Bundling: 25% complete...",
        "[PROGRESS] Bundling: 50% complete...",
        "[PROGRESS] Bundling: 75% complete...",
        "[SUCCESS] iOS JS bundle complete: /build/outputs/ios/main.jsbundle",
        "[INFO] Compiling native Android modules (simulated)...",
        "[SUCCESS] Android native modules compiled.",
        "[INFO] Generating Android APK (debug)...",
        "[SUCCESS] Android APK generated: /build/outputs/apk/debug/app-debug.apk",
        "[INFO] Compiling native iOS modules (simulated)...",
        "[SUCCESS] iOS native modules compiled.",
        "[INFO] Generating iOS App (debug, simulator)...",
        "[SUCCESS] iOS App generated: /build/outputs/ios/debug/MyApp.app",
        "[INFO] Build process finished successfully.",
        "[INFO] Total build time: 35.7s (simulated)."
    ];

    let currentLogIndex = 0;
    let buildInProgress = false;

    function appendLogEntry() {
        if (currentLogIndex < mockBuildLogs.length) {
            const timestamp = new Date().toLocaleTimeString();
            buildLogElement.textContent += `[${timestamp}] ${mockBuildLogs[currentLogIndex]}\n`;
            buildLogElement.scrollTop = buildLogElement.scrollHeight; // Auto-scroll
            currentLogIndex++;
            setTimeout(appendLogEntry, Math.random() * 500 + 200); // Random delay
        } else {
            buildLogElement.textContent += `\nBuild simulation complete.\n`;
            buildLogElement.scrollTop = buildLogElement.scrollHeight;
            buildInProgress = false;
            buildProjectButton.disabled = false;
            buildProjectButton.textContent = 'Build Project';
        }
    }

    function simulateBuildProcess() {
        if (buildInProgress) return;

        buildInProgress = true;
        buildProjectButton.disabled = true;
        buildProjectButton.textContent = 'Building...';
        
        buildLogElement.textContent = ''; // Clear previous logs
        currentLogIndex = 0;
        
        // Ensure the container is visible (it should be by default based on CSS)
        // buildOutputContainer.style.display = 'block'; 

        appendLogEntry();
    }

    if (buildProjectButton) {
        buildProjectButton.addEventListener('click', simulateBuildProcess);
    } else {
        console.error("Build project button not found.");
    }
    // Initialize build output as empty but visible
    if (buildLogElement) {
         buildLogElement.textContent = 'Click "Build Project" to start a simulated build.\n';
    }

});