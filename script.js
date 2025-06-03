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

    const placeholderFileContent = (fileName, componentName = fileName.replace(/\.(tsx|ts|js)$/, '')) => 
`// Placeholder for ${fileName}
// Content not provided or simplified for this environment.
import React from 'react';
import { View, Text } from 'react-native-web';

export default function ${componentName}(props) {
  console.warn("${fileName} is a placeholder component.");
  // Simple render to show it's a placeholder
  return (
    <View style={{padding: 8, margin: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.02)'}}>
      <Text style={{fontWeight: 'bold', fontSize: 12}}>${componentName} (Placeholder)</Text>
      {/* <Text style={{fontSize: 10, color: 'gray'}}>Props: {JSON.stringify(Object.keys(props))}</Text> */}
    </View>
  );
};
`;

    const correctImagePickerContent = `
import React from 'react';
import { View, Image, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

interface ImagePickerProps {
  images: string[]; 
  onAddImage: () => void; 
  onRemoveImage: (index: number) => void; 
}

export function ImagePicker({ images, onAddImage, onRemoveImage }: ImagePickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} onError={() => console.log('Error loading image in picker:', uri)} />
            <Pressable style={styles.removeButton} onPress={() => onRemoveImage(index)}>
              <MaterialCommunityIcons name="close-circle" size={24} color="rgba(0,0,0,0.7)" />
            </Pressable>
          </View>
        ))}
        {images.length < 4 && ( 
          <Pressable style={styles.addButton} onPress={onAddImage}>
            <MaterialCommunityIcons name="image-plus" size={30} color="#6366f1" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 10, 
  },
  imageContainer: {
    position: 'relative',
    width: 80, 
    height: 80,
  },
  image: {
    width: '100%', 
    height: '100%', 
    borderRadius: 4, 
  },
  removeButton: {
    position: 'absolute',
    top: -8, 
    right: -8, 
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12, 
    padding: 2, 
  },
  addButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db', 
    borderStyle: 'dashed',
    borderRadius: 4,
    backgroundColor: '#f9fafb', 
  },
  addButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6366f1', 
  },
});
`;

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
                                { name: 'ImagePicker.tsx', path: 'src/components/Feed/ImagePicker.tsx', type: 'file', content: correctImagePickerContent },
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
        
        function findItem(structure, path) {
            for (const item of structure) {
                if (item.path === path) return item;
                if (item.children) {
                    const found = findItem(item.children, path);
                    if (found) return found;
                }
            }
            return null;
        }
        const item = findItem(currentProjectStructure, filePath); // Check current structure for already loaded/modified content
        if (item && typeof item.content === 'string') { 
            fileContentCache.set(filePath, item.content);
            return item.content;
        }
        // If not in current, check initial (for original placeholders etc.)
        const initialItem = findItem(initialProjectStructure, filePath);
         if (initialItem && typeof initialItem.content === 'string') { 
            fileContentCache.set(filePath, initialItem.content);
            return initialItem.content;
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

            let codeToDisplay = await fetchFileContent(filePath);
            
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

    // --- Actual Build Logic ---

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
    
    async function findCanonicalPath(importPath, currentFilePath, allProjectFiles) {
        const resolvedBase = resolveProjectPath(importPath, currentFilePath);
        const extensionsToTry = ['.ts', '.tsx', '.js', '.json']; 
        for (const ext of extensionsToTry) {
            if (allProjectFiles.has(resolvedBase + ext)) return resolvedBase + ext;
        }
        if (allProjectFiles.has(resolvedBase)) return resolvedBase; 
        
        for (const ext of extensionsToTry) {
             if (allProjectFiles.has(resolvedBase + '/index' + ext)) return resolvedBase + '/index' + ext;
        }
        return null; 
    }

    const mockExpoIconsContent = `
export const MaterialCommunityIcons = (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px', verticalAlign: 'middle'} }, props.name ? props.name.substring(0,3) : 'ICO');
export const Ionicons = MaterialCommunityIcons; 
    `;
    const mockLucideIconsContent = `
const createIcon = (name) => (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px', verticalAlign: 'middle'} }, name.substring(0,3));
export const Home = createIcon('Home');
export const Users = createIcon('Users');
export const MessageCircle = createIcon('MessageCircle');
    `;
    const mockExpoRouterContent = `
import React from 'react';

const createMockComponent = (displayName) => {
  const Comp = (props) => {
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
    return React.createElement('a', { ...rest, href, onClick: (e) => { e.preventDefault(); console.log('Mock Link to', href); alert('Mock link navigation to: ' + href); } }, children);
};

export function useRouter() {
  return {
    push: (path) => console.log(\`Mock useRouter.push to: \${path}\`),
    replace: (path) => console.log(\`Mock useRouter.replace with: \${path}\`),
    back: () => console.log('Mock useRouter.back()'),
  };
}
// Default export for cases like import ExpoRouter from 'expo-router';
export default { Stack, Tabs, SplashScreen, Link, useRouter };
`;
    const mockExpoContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';

export function registerRootComponent(App) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Simple check if already rendered, to avoid multiple roots on same element.
    // This is a very basic check.
    if (!rootElement._reactRootContainer) { 
        const root = ReactDOM.createRoot(rootElement);
        rootElement._reactRootContainer = root; 
        root.render(React.createElement(App));
    } else {
        console.warn("registerRootComponent called multiple times or root already initialized.");
        // Optionally, re-render if HMR or similar is intended.
        // rootElement._reactRootContainer.render(React.createElement(App));
    }
  } else {
    console.error('Root element #root not found for registerRootComponent');
  }
}

export const StatusBar = (props) => { console.log('Mock StatusBar:', props); return null; };
export const Constants = { expoVersion: 'mocked-expo-version', platform: {}, manifest: { web: {} }, };
export const Linking = { openURL: (url) => { console.log(\`Mock Linking.openURL: \${url}\`); return Promise.resolve(); }, addEventListener: () => ({ remove: () => {} }), };
`;


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
        const allProjectFilePaths = new Set();

        function collectSourceFiles(structure) {
            for (const item of structure) {
                if (item.type === 'file' && (item.path.endsWith('.ts') || item.path.endsWith('.tsx') || item.path.endsWith('.js'))) {
                    sourceFiles.push(item); // Store the whole item
                    allProjectFilePaths.add(item.path);
                }
                if (item.children) {
                    collectSourceFiles(item.children);
                }
            }
        }
        collectSourceFiles(initialProjectStructure); 
        logToBuildOutput(`Found ${sourceFiles.length} source files to process.`);

        const importMapEntries = {
            "imports": {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom": "https://esm.sh/react-dom@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
                "react-native": "https://esm.sh/react-native-web@0.19.9",
                "react-native-web": "https://esm.sh/react-native-web@0.19.9",
                "@react-navigation/native": "https://esm.sh/@react-navigation/native@6.1.9",
                "@react-navigation/native-stack": "https://esm.sh/@react-navigation/native-stack@6.9.17",
                "react-native-safe-area-context": "https://esm.sh/react-native-safe-area-context@4.7.4",
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
                const originalCode = await fetchFileContent(file.path); // Fetches potentially placeholder/corrected content
                babelOptions.filename = file.path; 
                
                let { code: transpiledCode } = Babel.transform(originalCode, babelOptions);
                transpiledCode = transpiledCode.replace(/from\s+['"]react-native['"]/g, 'from "react-native-web"');
                
                const importRegex = /(from\s+['"])(\.\/[^'"]+|\.\.\/[^'"]+)(['"])/g;
                let match;
                let tempCode = transpiledCode;
                const replacements = [];

                while((match = importRegex.exec(tempCode)) !== null) {
                    const relativeImportPath = match[2];
                    const canonicalPath = await findCanonicalPath(relativeImportPath, file.path, allProjectFilePaths);
                    if (canonicalPath) {
                        const moduleId = `project_/${canonicalPath.replace(/\.(ts|tsx|js)$/, '')}`;
                        // Replace only the path part of the import statement
                        replacements.push({startIndex: match.index + match[1].length, endIndex: match.index + match[1].length + relativeImportPath.length, newImportPath: moduleId});
                    } else {
                        logToBuildOutput(`Could not resolve import '${relativeImportPath}' in ${file.path}`, "WARN");
                    }
                }
                
                let offset = 0;
                for(const r of replacements.sort((a,b) => a.startIndex - b.startIndex)) { // Apply in order
                    transpiledCode = transpiledCode.substring(0, r.startIndex + offset) + r.newImportPath + transpiledCode.substring(r.endIndex + offset);
                    offset += r.newImportPath.length - (r.endIndex - r.startIndex);
                }

                const projectModuleId = `project_/${file.path.replace(/\.(ts|tsx|js)$/, '')}`;
                // Ensure UTF-8 characters are handled correctly for btoa
                const dataUrl = `data:text/javascript;base64,${btoa(unescape(encodeURIComponent(transpiledCode)))}`;
                importMapEntries.imports[projectModuleId] = dataUrl;

            } catch (error) {
                logToBuildOutput(`Error processing ${file.path}: ${error.message}`, "ERROR");
                console.error(`Error processing ${file.path}:`, error, error.stack);
            }
        }
        
        const mocksToEmbed = [
            { key: "@expo/vector-icons", content: mockExpoIconsContent },
            { key: "lucide-react-native", content: mockLucideIconsContent },
            { key: "expo-router", content: mockExpoRouterContent },
            { key: "expo", content: mockExpoContent },
        ];

        for (const mock of mocksToEmbed) {
            logToBuildOutput(`Embedding mock for ${mock.key}...`);
            const dataUrl = `data:text/javascript;base64,${btoa(unescape(encodeURIComponent(mock.content)))}`;
            importMapEntries.imports[mock.key] = dataUrl;
        }
        
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
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; font-family: sans-serif; }
        #root { display: flex; flex-direction: column; height: 100%; width: 100%; }
        /* Basic RNW style normalization */
        div[style*="flex-direction:row"] { box-sizing: border-box; }
        div[style*="flex-direction:column"] { box-sizing: border-box; }
    </style>
    <script type="importmap">
${JSON.stringify(importMapEntries, null, 2)}
    </script>
</head>
<body>
    <div id="root">Loading application...</div>
    <script type="module">
        import React from 'react';
        window.React = React; 

        // The main entry point for the app
        try {
            await import('${entryPointModuleId}');
            console.log("App entry point imported successfully.");
        } catch (e) {
            console.error("Error importing app entry point:", e);
            document.getElementById('root').innerHTML = '<pre style="color:red; padding:10px;">Error loading application. Check console for details.\\n' + e.message + '\\n' + (e.stack || '') + '</pre>';
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
                    ]
                }
            ]
        };
        currentProjectStructure.push(buildFolder);
        
        fileContentCache.set('build/web-client/index.html', clientIndexHtmlContent);
        
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
         buildLogElement.textContent = 'Click "Build Project" to start the actual web client build.\n';
    }

    const defaultFileToShow = currentProjectStructure.find(f => f.path === 'index.js') || currentProjectStructure.find(f => f.path === 'App.tsx');
    if (defaultFileToShow) {
       loadFileContent(defaultFileToShow).then(() => {
           const items = fileTreeElement.querySelectorAll('.file-name');
           for (let item of items) {
               // Check if the text content *exactly* matches or *includes* if the name might have prefixes/suffixes from display
               if (item.textContent === defaultFileToShow.name || item.textContent.includes(defaultFileToShow.name)) { 
                   if (item.parentElement) {
                       item.parentElement.classList.add('selected');
                       currentSelectedElement = item.parentElement;
                   }
                   break;
               }
           }
       });
    }
});