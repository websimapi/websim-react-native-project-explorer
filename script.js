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
    // Add virtual module paths to initialProjectStructure for consistency if needed, or handle them separately.
    const virtualModuleDefinitions = {
        'virtual_modules/expo_vector_icons.js': `
            import React from 'react';
            export const MaterialCommunityIcons = (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px'} }, props.name ? props.name.substring(0,3) : 'ICO');
            export const Ionicons = MaterialCommunityIcons;
        `,
        'virtual_modules/lucide_react_native.js': `
            import React from 'react';
            const createIcon = (name) => (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px'} }, name.substring(0,3));
            export const Home = createIcon('Home');
            export const Users = createIcon('Users');
            export const MessageCircle = createIcon('MessageCircle');
        `,
        'virtual_modules/expo_router.js': `
            import React from 'react';
            const createMockComponent = (displayName) => {
              const Comp = (props) => {
                const style = props.screenOptions && props.screenOptions.headerShown === false ? {display: 'none'} : { border: '1px dashed #eee', padding: '5px', margin: '2px', flexGrow: 1};
                let childrenToRender = props.children;
                if (displayName === 'ExpoRouter.Stack' || displayName === 'ExpoRouter.Tabs') {
                    if (React.Children.count(props.children) > 0) {
                        childrenToRender = React.Children.map(props.children, child => {
                            if (React.isValidElement(child) && (child.type.displayName === 'ExpoRouter.Stack.Screen' || child.type.displayName === 'ExpoRouter.Tabs.Screen')) {
                                // For a tab navigator, only one child screen is typically active.
                                // This simplified mock will render all, which is not ideal but shows structure.
                                // A real tab navigator would handle visibility.
                                const screenComponent = child.props.component || (() => child.props.children); // Support component prop or children
                                const options = {...props.screenOptions, ...child.props.options};
                                // If screen has a component prop, render that, apply options for title etc.
                                if(child.props.name === 'index' && displayName === 'ExpoRouter.Tabs'){ // crude active tab
                                   return React.createElement('div', {'data-name': `${displayName}-Screen-${child.props.name}`, style: {flexGrow:1}}, React.createElement(screenComponent, options));
                                } else if (displayName === 'ExpoRouter.Stack') { // Stacks render one at a time too.
                                   return React.createElement('div', {'data-name': `${displayName}-Screen-${child.props.name}`, style: {flexGrow:1}}, React.createElement(screenComponent, options));
                                }
                                return React.createElement('div', {'data-name': `${displayName}-Screen-${child.props.name} (inactive)`});
                            }
                            return child;
                        });
                    }
                     return React.createElement('div', { 'data-name': displayName, style }, childrenToRender);
                }
                 if (displayName === 'ExpoRouter.Stack.Screen' || displayName === 'ExpoRouter.Tabs.Screen') {
                    // Screens are not rendered directly by themselves but by their navigator parent.
                    // The logic above in Stack/Tabs handles rendering their 'component'.
                    return null; 
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

            export function useRouter() { return { push: (path) => console.log(`Mock useRouter.push to: ${path}`), replace: (path) => console.log(`Mock useRouter.replace with: ${path}`), back: () => console.log('Mock useRouter.back()'), };}
            export default Stack; 
        `,
        'virtual_modules/expo_core.js': `
            export function registerRootComponent(component) {
              const App = component;
              const rootTag = document.getElementById('root');
              if (rootTag) {
                 const root = ReactDOMClient.createRoot(rootTag);
                 root.render(React.createElement(App));
              } else {
                console.error("Root element #root not found for Expo's registerRootComponent mock.");
              }
            }
        `
    };


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

        const sourceFileItems = [];
        const allProjectFilePathsSet = new Set();

        function collectSourceFilesRecursive(structure) {
            for (const item of structure) {
                const itemPath = item.path; 
                allProjectFilePathsSet.add(itemPath); 
                if (item.type === 'file' && (itemPath.endsWith('.ts') || itemPath.endsWith('.tsx') || itemPath.endsWith('.js')) && !itemPath.endsWith('.d.ts')) {
                    sourceFileItems.push(item);
                }
                if (item.children) {
                    collectSourceFilesRecursive(item.children);
                }
            }
        }
        collectSourceFilesRecursive(currentProjectStructure);
        
        // Add virtual modules to the processing list and path set
        Object.keys(virtualModuleDefinitions).forEach(virtualPath => {
            sourceFileItems.push({
                name: virtualPath.split('/').pop(),
                path: virtualPath, // Use this as the canonical path/ID
                content: virtualModuleDefinitions[virtualPath],
                type: 'file',
                isVirtual: true
            });
            allProjectFilePathsSet.add(virtualPath);
        });


        logToBuildOutput(`Found ${sourceFileItems.length} source files (including virtual) to process.`);

        const transpiledModuleFunctions = [];
        
        const specialImportToVirtualPath = {
            '@expo/vector-icons': 'virtual_modules/expo_vector_icons.js',
            'lucide-react-native': 'virtual_modules/lucide_react_native.js',
            'expo-router': 'virtual_modules/expo_router.js',
            'expo': 'virtual_modules/expo_core.js'
        };

        const babelOptions = {
            presets: [
                ['env', { modules: 'commonjs' }], // Transpile to CommonJS
                'react',
                'typescript'
            ],
            filename: '', // Will be set per file
            sourceType: 'module', 
        };

        for (const fileItem of sourceFileItems) {
            logToBuildOutput(`Processing ${fileItem.path}...`);
            try {
                const originalCode = fileItem.isVirtual ? fileItem.content : await fetchFileContent(fileItem.path);
                babelOptions.filename = fileItem.path;
                
                let { code: transpiledCode } = Babel.transform(originalCode, babelOptions);
                
                // Replace require statements
                transpiledCode = transpiledCode.replace(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g, (match, originalRequirePath) => {
                    if (['react', 'react-dom', 'react-dom/client', 'react-native-web'].includes(originalRequirePath) || 
                        originalRequirePath.startsWith('@react-navigation/') || 
                        originalRequirePath === 'react-native-safe-area-context') {
                        // These are external CDNs, __requireCDN will handle them
                        return `__requireCDN('${originalRequirePath}')`;
                    } else if (specialImportToVirtualPath[originalRequirePath]) {
                        const virtualPath = specialImportToVirtualPath[originalRequirePath];
                        const moduleId = `project_/${virtualPath.replace(/\.(ts|tsx|js)$/, '')}`;
                        return `__requireInternal('${moduleId}')`;
                    } else { // Project local file
                        const canonicalPath = await findCanonicalPath(originalRequirePath, fileItem.path, allProjectFilePathsSet);
                        if (canonicalPath) {
                            const moduleId = `project_/${canonicalPath.replace(/\.(ts|tsx|js)$/, '')}`;
                            return `__requireInternal('${moduleId}')`;
                        } else {
                            logToBuildOutput(`Could not resolve require ('${originalRequirePath}') in ${fileItem.path}. Leaving as is.`, "WARN");
                            return match; // Leave it, might error at runtime but better than breaking build
                        }
                    }
                });
                
                // CommonJS module ID for our system
                const projectModuleId = `project_/${fileItem.path.replace(/\.(ts|tsx|js)$/, '')}`;

                const wrappedModule = `
window.__projectModules['${projectModuleId}'] = function(module, exports, __requireInternal, __requireCDN) {
try {
${transpiledCode}
} catch(e) {
  console.error("Error executing module ${projectModuleId}:", e);
  throw e;
}
};`;
                transpiledModuleFunctions.push(wrappedModule);
                fileContentCache.set(`transpiled/${projectModuleId}`, wrappedModule); // Cache the wrapped module string

            } catch (error) {
                logToBuildOutput(`Error processing ${fileItem.path}: ${error.message} \n ${error.stack}`, "ERROR");
                console.error(`Error processing ${fileItem.path}:`, error);
            }
        }
        
        const entryPointOriginalPath = 'index.js'; // Your main entry file
        const entryPointModuleId = `project_/${entryPointOriginalPath.replace(/\.js$/, '')}`;

        const clientIndexHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Built React Native Web App</title>
    <style> body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; background-color: #FFF;} #root { display: flex; flex-direction: column; height: 100%; box-sizing: border-box;} </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script> 
        // Make ReactDOM.createRoot available via a consistent name, similar to older examples if needed.
        var ReactDOMClient = ReactDOM; 
        var ReactNativeWeb = { /* Minimal stub, real RNW UMD is complex or use ESM */ 
          StyleSheet: { create: (obj) => obj },
          View: 'div', Text: 'span', Pressable: 'button', Image: 'img', ScrollView: 'div', TextInput: 'input',
          AppRegistry: { 
            registerComponent: (appKey, getComponentFunc) => { 
              window._rnwAppRegistry = window._rnwAppRegistry || {};
              window._rnwAppRegistry[appKey] = getComponentFunc;
            },
            runApplication: (appKey, appParameters) => {
                if(window._rnwAppRegistry && window._rnwAppRegistry[appKey]){
                    const AppComponent = window._rnwAppRegistry[appKey]();
                    const root = ReactDOMClient.createRoot(appParameters.rootTag);
                    root.render(React.createElement(AppComponent));
                }
            }
          }
        }; 
        // Mock global for @react-navigation
        var ReactNavigationNative = { NavigationContainer: (props) => React.createElement('div', {'data-name': 'NavigationContainer'}, props.children) };
        var ReactNavigationNativeStack = { createNativeStackNavigator: () => ({ Navigator: (props) => React.createElement('div', {'data-name': 'StackNavigator'}, props.children), Screen: (props) => null /* Screen components are declarative */ }) };
        var ReactNativeSafeAreaContext = { SafeAreaProvider: (props) => React.createElement(React.Fragment, null, props.children), useSafeAreaInsets: () => ({top:0, bottom:0, left:0, right:0}) };

    </script>
</head>
<body>
    <div id="root" style="height: 100vh;"></div>
    <script type="text/javascript">
        window.__projectModules = {};
        window.__initializedModules = {}; // To track initialized modules and prevent re-initialization loops

        function __requireCDN(moduleId) {
            // console.log('CDN require:', moduleId);
            switch(moduleId) {
                case 'react': return window.React;
                case 'react-dom': return window.ReactDOM;
                case 'react-dom/client': return window.ReactDOMClient;
                case 'react-native-web': return window.ReactNativeWeb; // Using our basic mock
                case '@expo/vector-icons': return window.__projectModules['project_/virtual_modules/expo_vector_icons']; // Handled by internal require now
                case 'lucide-react-native': return window.__projectModules['project_/virtual_modules/lucide_react_native'];
                case '@react-navigation/native': return ReactNavigationNative;
                case '@react-navigation/native-stack': return ReactNavigationNativeStack;
                case 'react-native-safe-area-context': return ReactNativeSafeAreaContext;
                case 'expo-router': return window.__projectModules['project_/virtual_modules/expo_router'];
                case 'expo': return window.__projectModules['project_/virtual_modules/expo_core'];
                default:
                    console.warn('Unknown CDN module required:', moduleId);
                    throw new Error('Unknown CDN module: ' + moduleId);
            }
        }

        function __requireInternal(moduleId) {
            // console.log('Internal require:', moduleId);
            if (window.__initializedModules[moduleId]) {
                // console.log('Returning cached module:', moduleId);
                return window.__initializedModules[moduleId].exports;
            }

            if (!window.__projectModules[moduleId]) {
                console.error('Module not found (not defined):', moduleId, 'Available:', Object.keys(window.__projectModules));
                throw new Error('Module not found: ' + moduleId);
            }

            const moduleFactory = window.__projectModules[moduleId];
            const module = { exports: {} };
            window.__initializedModules[moduleId] = module; // Cache before execution for circular deps

            try {
                 // console.log('Initializing module:', moduleId);
                moduleFactory(module, module.exports, __requireInternal, __requireCDN);
            } catch(e) {
                console.error(`Error initializing module ${moduleId}:`, e, e.stack);
                delete window.__initializedModules[moduleId]; // Remove from cache on error
                throw e;
            }
            // console.log('Finished initializing module:', moduleId, module.exports);
            return module.exports;
        }

        // --- All transpiled and wrapped module functions will be inserted below ---
        ${transpiledModuleFunctions.join('\n\n')}
        // --- End of module definitions ---

        // Run the entry point
        try {
            console.log('Executing entry point: ${entryPointModuleId}');
            __requireInternal('${entryPointModuleId}');
        } catch (e) {
            console.error("Error running application entry point:", e);
            const rootDiv = document.getElementById('root');
            if (rootDiv) {
                rootDiv.innerHTML = '<div style="color:red; padding: 20px;"><h1>Application Error</h1><p>Failed to start. Check console for details.</p><pre>' + e.stack + '</pre></div>';
            }
        }
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
                        // No other JS files here as they are all bundled into index.html's script tag
                    ]
                }
            ]
        };
        currentProjectStructure.push(buildFolder);
        
        fileContentCache.set('build/web-client/index.html', clientIndexHtmlContent);
        // No individual transpiled files to cache here for the build output, they are bundled.

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