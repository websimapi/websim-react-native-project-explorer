document.addEventListener('DOMContentLoaded', () => {
    const fileTreeElement = document.getElementById('file-tree');
    const selectedFileNameElement = document.getElementById('selected-file-name');
    const codeDisplayElement = document.getElementById('code-display');
    const codeDisplayContainer = document.getElementById('code-display-container');
    const iframeClientViewer = document.getElementById('iframe-client-viewer');
    const exportedMembersElement = document.getElementById('exported-members');
    let currentSelectedElement = null;
    let buildInProgress = false;

    const buildProjectButton = document.getElementById('build-project-button');
    const buildOutputContainer = document.getElementById('build-output-container');
    const buildLogElement = document.getElementById('build-log');

    const placeholderFileContent = (fileName, componentName) => `// Placeholder for ${fileName}
import React from 'react';
import { View, Text } from 'react-native-web'; // Using react-native-web for browser compatibility

export default function ${componentName}(props) {
  console.warn("${fileName} is a placeholder component. Props:", Object.keys(props));
  // Basic rendering for stack/tab navigators to show children if any
  if (props.children && (componentName.includes('Stack') || componentName.includes('Layout'))) {
    return React.createElement(View, { style: { flex: 1, borderWidth: 1, borderColor: 'gray', padding: 5 } }, 
      React.createElement(Text, null, componentName + " Placeholder"),
      props.children
    );
  }
  // Attempt to simulate onLogin/onLogout for AuthStack/MainStack
  if (componentName === 'AuthStack' && typeof props.onLogin === 'function') {
    return React.createElement(View, {style: {flex:1, alignItems:'center', justifyContent:'center'}}, 
      React.createElement(Text, null, "AuthStack Placeholder"), 
      React.createElement('button', {onClick: props.onLogin}, "Simulate Login")
    );
  }
  if (componentName === 'MainStack' && typeof props.onLogout === 'function') {
     return React.createElement(View, {style: {flex:1, borderWidth:1, borderColor:'blue'}}, 
      React.createElement(Text, null, "MainStack Placeholder (contains Tab Navigator)"),
      React.createElement('button', {onClick: props.onLogout, style:{position:'absolute', top:10, right:10}}, "Simulate Logout"),
      props.children // MainStack in App.tsx renders TabNavigator as children via component prop
    );
  }

  return React.createElement(View, {style: {padding:10, margin:5, borderWidth:1, borderColor:'lightgray'}}, 
    React.createElement(Text, null, componentName + " Placeholder")
  );
};`;


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
                                { name: 'CreatePost.tsx', path: 'src/components/Feed/CreatePost.tsx', type: 'file', content: placeholderFileContent('CreatePost.tsx', 'CreatePost'), isPlaceholder: true },
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
                         { name: 'AuthStack.tsx', path: 'src/navigation/AuthStack.tsx', type: 'file', content: placeholderFileContent('AuthStack.tsx', 'AuthStack'), isPlaceholder: true },
                         { name: 'MainStack.tsx', path: 'src/navigation/MainStack.tsx', type: 'file', content: placeholderFileContent('MainStack.tsx', 'MainStack'), isPlaceholder: true },
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
    const fileContentCache = new Map();

    function initializeCacheWithPlaceholders(structure) {
        for (const item of structure) {
            if (item.isPlaceholder && item.content) {
                fileContentCache.set(item.path, item.content);
            }
            if (item.children) {
                initializeCacheWithPlaceholders(item.children);
            }
        }
    }
    initializeCacheWithPlaceholders(currentProjectStructure);

    function renderFileTree(parentElement, structure) {
        structure.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('tree-item');
            if (item.isPlaceholder || item.missing) {
                li.style.opacity = "0.6";
                li.title = item.isPlaceholder ? "File content is a placeholder" : "File content not provided";
            }

            const span = document.createElement('span');
            span.textContent = item.name;

            if (item.type === 'folder') {
                span.classList.add('folder-name');
                if (item.name === 'build') { 
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
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                });

            } else {
                span.classList.add('file-name');
                const extension = item.name.split('.').pop();
                span.classList.add(extension); 
                li.appendChild(span);
                li.addEventListener('click', async (event) => {
                    event.stopPropagation(); 
                    if (currentSelectedElement) {
                        currentSelectedElement.classList.remove('selected');
                    }
                    li.classList.add('selected');
                    currentSelectedElement = li;
                    await loadFileContent(item);
                });
            }
            parentElement.appendChild(li);
        });
    }
    
    async function fetchFileContent(filePath) {
        if (fileContentCache.has(filePath)) {
            return fileContentCache.get(filePath);
        }
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            }
            const code = await response.text();
            fileContentCache.set(filePath, code);
            return code;
        } catch (error) {
            console.error(`Failed to fetch ${filePath}:`, error);
            throw error;
        }
    }


    async function loadFileContent(item) {
        const fileName = item.name;
        const filePath = item.path;

        try {
            selectedFileNameElement.textContent = `Loading ${fileName}...`;
            exportedMembersElement.innerHTML = '';
            codeDisplayElement.textContent = '';
            iframeClientViewer.srcdoc = ''; 
            iframeClientViewer.style.display = 'none';
            codeDisplayContainer.style.display = 'none';

            let codeToDisplay = await fetchFileContent(filePath); // Uses cache or fetches
            
            if (item.isClientIndex) { 
                selectedFileNameElement.textContent = `${fileName} (Live Preview from Build)`;
                iframeClientViewer.srcdoc = codeToDisplay;
                iframeClientViewer.style.display = 'block';
                exportedMembersElement.innerHTML = '<em>Displaying built client application.</em>';
            } else {
                selectedFileNameElement.textContent = fileName;
                codeDisplayElement.textContent = codeToDisplay;
                codeDisplayContainer.style.display = 'flex';
                
                const extension = fileName.split('.').pop();
                let language = 'markup'; 
                if (['ts', 'tsx'].includes(extension)) language = 'typescript';
                else if (['js', 'jsx'].includes(extension)) language = 'javascript';
                else if (extension === 'css') language = 'css';
                else if (extension === 'json') language = 'json';
                
                codeDisplayElement.className = `language-${language}`;
                Prism.highlightElement(codeDisplayElement);
                if (!item.isBinary && !item.isClientIndex) { 
                   extractExportedMembers(codeToDisplay, extension);
                } else if (item.isBinary) {
                    exportedMembersElement.innerHTML = '<em>Binary file content (simulated). Not analyzed.</em>';
                }
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
        const defaultExportRegex = /export default function (\w+)|export default class (\w+)|export default (?:const\s)?(\w+)/g;
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

    function logToBuildOutput(message, type = "INFO") {
        const timestamp = new Date().toLocaleTimeString();
        buildLogElement.textContent += `[${timestamp}] [${type}] ${message}\n`;
        buildLogElement.scrollTop = buildLogElement.scrollHeight;
    }
    
    function resolveProjectPath(relativePath, currentFilePath) {
        const currentDirSegments = currentFilePath.split('/').slice(0, -1);
        const pathSegments = relativePath.split('/');
        const resolvedSegments = [...currentDirSegments];

        for (const segment of pathSegments) {
            if (segment === '.') continue;
            if (segment === '..') {
                if (resolvedSegments.length > 0) resolvedSegments.pop();
            } else {
                resolvedSegments.push(segment);
            }
        }
        return resolvedSegments.join('/');
    }
    
    async function findCanonicalPath(importPath, currentFilePath, allProjectFilePathsSet) {
        const resolvedBase = resolveProjectPath(importPath, currentFilePath);
        const extensionsToTry = ['.js', '.ts', '.tsx', '.json']; // Order matters for JS vs TS preference if both exist (unlikely for same base)
        
        for (const ext of extensionsToTry) {
            if (allProjectFilePathsSet.has(resolvedBase + ext)) return resolvedBase + ext;
        }
        
        if (allProjectFilePathsSet.has(resolvedBase)) return resolvedBase;

        for (const ext of extensionsToTry) {
             if (allProjectFilePathsSet.has(resolvedBase + '/index' + ext)) return resolvedBase + '/index' + ext;
        }
        logToBuildOutput(`Could not resolve import '${importPath}' from '${currentFilePath}' to a canonical path. Tried base: '${resolvedBase}'`, "DEBUG");
        return null;
    }


    async function actualBuildProcess() {
        if (buildInProgress) return;
        buildInProgress = true;
        buildProjectButton.disabled = true;
        buildProjectButton.textContent = 'Building...';
        buildLogElement.textContent = '';
        logToBuildOutput("Build process started...");

        currentProjectStructure = currentProjectStructure.filter(item => item.name !== 'build');
        fileTreeElement.innerHTML = ''; 
        renderFileTree(fileTreeElement, currentProjectStructure); 

        const sourceFiles = [];
        const allProjectFilePathsSet = new Set();

        function collectSourceFiles(structure, currentPath = '') {
            for (const item of structure) {
                const itemPath = item.path; 
                allProjectFilePathsSet.add(itemPath); 
                if (item.type === 'file' && (itemPath.endsWith('.ts') || itemPath.endsWith('.tsx') || itemPath.endsWith('.js')) && !itemPath.endsWith('.d.ts')) {
                    sourceFiles.push(item);
                }
                if (item.children) {
                    collectSourceFiles(item.children, itemPath);
                }
            }
        }
        collectSourceFiles(currentProjectStructure);
        logToBuildOutput(`Found ${sourceFiles.length} source files to process.`);
        logToBuildOutput(`Known project files for resolution: ${Array.from(allProjectFilePathsSet).join(', ')}`, "DEBUG");

        const transpiledFiles = [];
        const importMapEntries = {
            "imports": {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom": "https://esm.sh/react-dom@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
                "react-native": "https://esm.sh/react-native-web@0.19.9",
                "react-native-web": "https://esm.sh/react-native-web@0.19.9",
                "@expo/vector-icons": "./mock_expo_vector_icons.js",
                "lucide-react-native": "./mock_lucide_react_native.js",
                "@react-navigation/native": "https://esm.sh/@react-navigation/native@6.1.9",
                "@react-navigation/native-stack": "https://esm.sh/@react-navigation/native-stack@6.9.17",
                "react-native-safe-area-context": "https://esm.sh/react-native-safe-area-context@4.7.4",
                "expo-router": "./mock_expo_router.js",
                "expo": "./mock_expo_core.js"
            }
        };

        const babelOptions = {
            presets: ['react', 'typescript'],
            filename: '', 
            sourceType: 'module',
        };

        for (const file of sourceFiles) {
            logToBuildOutput(`Processing ${file.path}...`);
            try {
                const originalCode = await fetchFileContent(file.path);
                babelOptions.filename = file.path; 
                
                let { code: transpiledCode } = Babel.transform(originalCode, babelOptions);

                transpiledCode = transpiledCode.replace(/from\s+['"]react-native['"]/g, 'from "react-native-web"');
                
                const importRegex = /(import\s+(?:{[^}]+}\s*from\s+|[^;]+\s*from\s+|\s*)['"])([^'"]+)(['"])/g;
                let match;
                let tempCode = transpiledCode;
                const replacements = [];

                while((match = importRegex.exec(tempCode)) !== null) {
                    const importPath = match[2];
                    if (importPath.startsWith('./') || importPath.startsWith('../')) {
                        const canonicalPath = await findCanonicalPath(importPath, file.path, allProjectFilePathsSet);
                        if (canonicalPath) {
                            const moduleId = `project_/${canonicalPath.replace(/\.(ts|tsx|js)$/, '')}`;
                            replacements.push({startIndex: match.index, endIndex: match.index + match[0].length, newImport: `${match[1]}${moduleId}${match[3]}`});
                            logToBuildOutput(`Rewrote '${importPath}' to '${moduleId}' in ${file.path}`, "DEBUG");
                        } else {
                            logToBuildOutput(`Could not resolve relative import '${importPath}' in ${file.path}`, "WARN");
                        }
                    } else if (importPath.startsWith('@/') || importPath.startsWith('src/') || importPath.startsWith('app/') || importPath.startsWith('hooks/')) { 
                         const canonicalPath = await findCanonicalPath(importPath, '', allProjectFilePathsSet); 
                         if (canonicalPath) {
                            const moduleId = `project_/${canonicalPath.replace(/\.(ts|tsx|js)$/, '')}`;
                            replacements.push({startIndex: match.index, endIndex: match.index + match[0].length, newImport: `${match[1]}${moduleId}${match[3]}`});
                            logToBuildOutput(`Rewrote '${importPath}' to '${moduleId}' in ${file.path}`, "DEBUG");
                         } else {
                            logToBuildOutput(`Could not resolve project-absolute import '${importPath}' in ${file.path}`, "WARN");
                         }
                    }
                }

                for(let i = replacements.length - 1; i >= 0; i--) {
                    const r = replacements[i];
                    transpiledCode = transpiledCode.substring(0, r.startIndex) + r.newImport + transpiledCode.substring(r.endIndex);
                }

                const flatName = file.path.replace(/\//g, '_').replace(/\.(ts|tsx|js)$/, '.js');
                const moduleId = `project_/${file.path.replace(/\.(ts|tsx|js)$/, '')}`;
                
                transpiledFiles.push({
                    name: flatName,
                    path: `build/web-client/${flatName}`,
                    content: transpiledCode,
                    type: 'file'
                });
                importMapEntries.imports[moduleId] = `./${flatName}`;
            } catch (error) {
                logToBuildOutput(`Error processing ${file.path}: ${error.message} \n ${error.stack}`, "ERROR");
                console.error(`Error processing ${file.path}:`, error);
            }
        }

        const mockExpoIconsContent = `
export const MaterialCommunityIcons = (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px'} }, props.name ? props.name.substring(0,3) : 'ICO');
export const Ionicons = MaterialCommunityIcons;
        `;
        transpiledFiles.push({ name: 'mock_expo_vector_icons.js', path: 'build/web-client/mock_expo_vector_icons.js', content: mockExpoIconsContent, type: 'file' });

        const mockLucideIconsContent = `
import React from 'react';
const createIcon = (name) => (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px'} }, name.substring(0,3));
export const Home = createIcon('Home');
export const Users = createIcon('Users');
export const MessageCircle = createIcon('MessageCircle');
        `;
        transpiledFiles.push({ name: 'mock_lucide_react_native.js', path: 'build/web-client/mock_lucide_react_native.js', content: mockLucideIconsContent, type: 'file' });

        const mockExpoRouterContent = `
import React from 'react';

const createMockComponent = (displayName) => {
  const Comp = (props) => {
    // console.log(\`Mock <\${displayName}> rendered with props:\`, props, "Children:", props.children);
    const style = props.screenOptions && props.screenOptions.headerShown === false ? {display: 'none'} : {};
    if (displayName === 'ExpoRouter.Stack' || displayName === 'ExpoRouter.Tabs') {
         // Pass navigator specific props like screenOptions down if children are Screens
        let childrenToRender = props.children;
        if (React.Children.count(props.children) > 0) {
            childrenToRender = React.Children.map(props.children, child => {
                if (React.isValidElement(child) && (child.type.displayName === 'ExpoRouter.Stack.Screen' || child.type.displayName === 'ExpoRouter.Tabs.Screen')) {
                    return React.cloneElement(child, { ...props.screenOptions, ...child.props.options });
                }
                return child;
            });
        }
        return React.createElement('div', { 'data-name': displayName, style }, childrenToRender);
    }
     if (displayName === 'ExpoRouter.Stack.Screen' || displayName === 'ExpoRouter.Tabs.Screen') {
        // Screens might not render directly, their component prop is used by navigator
        // For simplicity, if a component is passed, try to render it.
        if (props.component) return React.createElement(props.component);
        if (props.children) return React.createElement(React.Fragment, null, props.children);
        return React.createElement('div', {'data-name': displayName + " (empty)"});
     }
    return React.createElement(React.Fragment, null, props.children);
  };
  Comp.displayName = displayName;
  return Comp;
};

export const Stack = createMockComponent('ExpoRouter.Stack');
Stack.Screen = createMockComponent('ExpoRouter.Stack.Screen');

export const Tabs = createMockComponent('ExpoRouter.Tabs');
Tabs.Screen = createMockComponent('ExpoRouter.Tabs.Screen');


export const SplashScreen = {
    preventAutoHideAsync: () => { console.log('Mock SplashScreen.preventAutoHideAsync()'); return Promise.resolve(true); },
    hideAsync: () => { console.log('Mock SplashScreen.hideAsync()'); return Promise.resolve(true); }
};

export const Link = (props) => {
    const { href, children, ...rest } = props;
    return React.createElement('a', { ...rest, href: href || '#', onClick: (e) => { e.preventDefault(); console.log('Mock Link to', href); alert('Mock link navigation to: ' + href); } }, children);
};

export function useRouter() {
  return {
    push: (path) => console.log(\`Mock useRouter.push to: \${path}\`),
    replace: (path) => console.log(\`Mock useRouter.replace with: \${path}\`),
    back: () => console.log('Mock useRouter.back()'),
  };
}
export default Stack; 

`;
        transpiledFiles.push({ name: 'mock_expo_router.js', path: 'build/web-client/mock_expo_router.js', content: mockExpoRouterContent, type: 'file'});

        const mockExpoCoreContent = `
// Mock for 'expo' package
import { AppRegistry } from 'react-native-web'; // Use react-native-web's AppRegistry

export function registerRootComponent(component) {
  AppRegistry.registerComponent('main', () => component);
  AppRegistry.runApplication('main', { rootTag: document.getElementById('root') });
}
`;
        transpiledFiles.push({ name: 'mock_expo_core.js', path: 'build/web-client/mock_expo_core.js', content: mockExpoCoreContent, type: 'file' });


        const entryPointOriginalPath = 'index.js'; 
        const entryPointModuleId = `project_/${entryPointOriginalPath.replace(/\.js$/, '')}`;

        const clientIndexHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Built React Native Web App</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; background-color: #f0f2f5;}
        #root { display: flex; flex-direction: column; height: 100%; }
        div[style*="flex-direction:row"] { box-sizing: border-box; }
        div[style*="flex-direction:column"] { box-sizing: border-box; }
    </style>
    <script type="importmap">
${JSON.stringify(importMapEntries, null, 2)}
    </script>
</head>
<body>
    <div id="root" style="height: 100vh;"></div>
    <script type="module">
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        window.React = React; 
        
        import '${entryPointModuleId}';
    </script>
</body>
</html>`;

        const buildFolder = {
            name: 'build',
            type: 'folder',
            children: [
                {
                    name: 'web-client',
                    type: 'folder',
                    children: [
                        { name: 'index.html', path: 'build/web-client/index.html', content: clientIndexHtmlContent, type: 'file', isClientIndex: true },
                        ...transpiledFiles
                    ]
                }
            ]
        };
        currentProjectStructure.push(buildFolder);
        
        fileContentCache.set('build/web-client/index.html', clientIndexHtmlContent);
        transpiledFiles.forEach(f => fileContentCache.set(f.path, f.content));

        logToBuildOutput("Updating file tree with build artifacts...");
        fileTreeElement.innerHTML = ''; 
        renderFileTree(fileTreeElement, currentProjectStructure);
        
        logToBuildOutput("Build process finished successfully.", "SUCCESS");
        logToBuildOutput("You can now browse the 'build/web-client' folder and view 'index.html'.");

        buildInProgress = false;
        buildProjectButton.disabled = false;
        buildProjectButton.textContent = 'Build Project';
    }

    if (buildProjectButton) {
        buildProjectButton.addEventListener('click', actualBuildProcess);
    } else {
        console.error("Build project button not found.");
    }
    
    if (buildLogElement) {
         buildLogElement.textContent = 'Click "Build Project" to start the web client build.\n';
    }

    const defaultFileToShow = currentProjectStructure.find(f => f.path === 'index.js') || currentProjectStructure.find(f => f.path === 'App.tsx');
    if (defaultFileToShow) {
       loadFileContent(defaultFileToShow).then(() => {
           const items = fileTreeElement.querySelectorAll('.file-name');
           for (let item of items) {
               const treeItemElement = item.closest('.tree-item');
               if (treeItemElement && item.textContent.trim() === defaultFileToShow.name) {
                    if (!treeItemElement.classList.contains('selected')) {
                        if (currentSelectedElement) {
                            currentSelectedElement.classList.remove('selected');
                        }
                        treeItemElement.classList.add('selected');
                        currentSelectedElement = treeItemElement;
                    }
                   break;
               }
           }
       });
    }
});