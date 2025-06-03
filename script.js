document.addEventListener('DOMContentLoaded', () => {
    const fileTreeElement = document.getElementById('file-tree');
    const selectedFileNameElement = document.getElementById('selected-file-name');
    const codeDisplayElement = document.getElementById('code-display');
    const codeDisplayContainer = document.getElementById('code-display-container');
    const iframeClientViewer = document.getElementById('iframe-client-viewer');
    const exportedMembersElement = document.getElementById('exported-members');
    let currentSelectedElement = null;
    let buildInProgress = false; // Declare buildInProgress here

    const buildProjectButton = document.getElementById('build-project-button');
    const buildOutputContainer = document.getElementById('build-output-container');
    const buildLogElement = document.getElementById('build-log');

    // Define known missing files that are part of the core structure
    const placeholderFileContent = (fileName) => `// Placeholder for ${fileName}\n// Content not provided in initial setup.\nexport default function ${fileName.replace('.tsx', '')}() { console.warn("${fileName} is a placeholder."); return null; };`;

    const correctImagePickerContent = `
import React from 'react';
import { View, Image, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assumed available

interface ImagePickerProps {
  images: string[]; // Array of image URIs
  onAddImage: () => void; // Callback for adding an image
  onRemoveImage: (index: number) => void; // Callback for removing an image
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
        {images.length < 4 && ( // Limit to 4 images, for example
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
    flexWrap: 'wrap', // Allow wrapping
    gap: 10, // Spacing between images
  },
  imageContainer: {
    position: 'relative',
    width: 80, // Smaller preview
    height: 80,
  },
  image: {
    width: '100%', // Fill the container
    height: '100%', // Fill the container
    borderRadius: 4, // Optional: for softer edges
  },
  removeButton: {
    position: 'absolute',
    top: -8, // Adjust for visibility
    right: -8, // Adjust for visibility
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12, // Make it circular
    padding: 2, // Small padding around icon
  },
  addButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db', // A light gray for the border
    borderStyle: 'dashed',
    borderRadius: 4,
    backgroundColor: '#f9fafb', // A very light gray background
  },
  addButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6366f1', // Theme color
  },
});
`;

    const initialProjectStructure = [
        { name: 'App.tsx', path: 'App.tsx', type: 'file' },
        { name: 'global.d.ts', path: 'global.d.ts', type: 'file' },
        { name: 'index.js', path: 'index.js', type: 'file' }, // Expo entry point
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
                                { name: 'CreatePost.tsx', path: 'src/components/Feed/CreatePost.tsx', type: 'file', content: placeholderFileContent('CreatePost.tsx'), isPlaceholder: true },
                                { name: 'FeedHeader.tsx', path: 'src/components/Feed/FeedHeader.tsx', type: 'file' },
                                { name: 'FeedScreen.tsx', path: 'src/components/Feed/FeedScreen.tsx', type: 'file' },
                                { name: 'ImagePicker.tsx', path: 'src/components/Feed/ImagePicker.tsx', type: 'file', content: correctImagePickerContent }, // Use correct content
                                { name: 'PostDetail.tsx', path: 'src/components/Feed/PostDetail.tsx', type: 'file' },
                                { name: 'PostList.tsx', path: 'src/components/Feed/PostList.tsx', type: 'file' },
                                { name: 'ShareModal.tsx', path: 'src/components/Feed/ShareModal.tsx', type: 'file' },
                            ]
                        }
                    ]
                },
                {
                    name: 'navigation', type: 'folder', children: [
                         { name: 'AuthStack.tsx', path: 'src/navigation/AuthStack.tsx', type: 'file', content: placeholderFileContent('AuthStack.tsx'), isPlaceholder: true },
                         { name: 'MainStack.tsx', path: 'src/navigation/MainStack.tsx', type: 'file', content: placeholderFileContent('MainStack.tsx'), isPlaceholder: true },
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
            if (item.isPlaceholder || item.missing) { // Visually indicate missing/placeholder files
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
        // Check if content is already in item (e.g., for placeholders, build artifacts, or corrected files)
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
        const item = findItem(currentProjectStructure, filePath);
        if (item && typeof item.content === 'string') { // item.content might be defined but not a string (e.g. children)
            fileContentCache.set(filePath, item.content);
            return item.content;
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
            
            if (item.isClientIndex) { // Special handling for the built client's index.html
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
                if (!item.isBinary && !item.isClientIndex) { // Don't analyze binary files or client index for exports
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

    // Helper function to resolve relative paths to project-absolute paths
    // Returns path without extension initially, caller should handle extension variants
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
    
    // Helper to find a file in the project structure and determine its canonical path (for module ID generation)
    // Tries common extensions.
    async function findCanonicalPath(importPath, currentFilePath, allProjectFiles) {
        const resolvedBase = resolveProjectPath(importPath, currentFilePath);
        const extensionsToTry = ['.ts', '.tsx', '.js', '.json']; // Order matters
        for (const ext of extensionsToTry) {
            if (allProjectFiles.has(resolvedBase + ext)) return resolvedBase + ext;
        }
        if (allProjectFiles.has(resolvedBase)) return resolvedBase; // If path already includes extension or is exact
        
        // Try index files for directory imports
        for (const ext of extensionsToTry) {
             if (allProjectFiles.has(resolvedBase + '/index' + ext)) return resolvedBase + '/index' + ext;
        }
        return null; // Not found
    }


    async function actualBuildProcess() {
        if (buildInProgress) return;
        buildInProgress = true;
        buildProjectButton.disabled = true;
        buildProjectButton.textContent = 'Building...';
        buildLogElement.textContent = '';
        logToBuildOutput("Build process started...");

        currentProjectStructure = currentProjectStructure.filter(item => item.name !== 'build');
        fileTreeElement.innerHTML = ''; // Clear old tree before re-rendering later
        renderFileTree(fileTreeElement, currentProjectStructure); // Render tree without build folder first

        const sourceFiles = [];
        const allProjectFilePaths = new Set();

        function collectSourceFiles(structure) {
            for (const item of structure) {
                if (item.type === 'file' && (item.name.endsWith('.ts') || item.name.endsWith('.tsx') || item.name.endsWith('.js'))) {
                    sourceFiles.push(item);
                    allProjectFilePaths.add(item.path);
                }
                if (item.children) {
                    collectSourceFiles(item.children);
                }
            }
        }
        collectSourceFiles(initialProjectStructure); // Collect from the original pristine structure
        logToBuildOutput(`Found ${sourceFiles.length} source files to process.`);

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
                "expo": "./mock_expo.js" // Added entry for expo itself
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
                const originalCode = await fetchFileContent(file.path); // Ensures correct content is used
                babelOptions.filename = file.path;
                
                let { code: transpiledCode } = Babel.transform(originalCode, babelOptions);

                transpiledCode = transpiledCode.replace(/from\s+['"]react-native['"]/g, 'from "react-native-web"');
                
                const importRegex = /(import\s+.*?from\s+['"])([^'"]+)(['"])/g;
                let match;
                let tempCode = transpiledCode;
                const replacements = [];

                while((match = importRegex.exec(tempCode)) !== null) {
                    const importPath = match[2];
                    if (importPath.startsWith('./') || importPath.startsWith('../')) {
                        const canonicalPath = await findCanonicalPath(importPath, file.path, allProjectFilePaths);
                        if (canonicalPath) {
                            const moduleId = `project_/${canonicalPath.replace(/\.(ts|tsx|js)$/, '')}`;
                            replacements.push({startIndex: match.index, endIndex: match.index + match[0].length, newImport: `${match[1]}${moduleId}${match[3]}`});
                        } else {
                            logToBuildOutput(`Could not resolve import '${importPath}' in ${file.path}`, "WARN");
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
                logToBuildOutput(`Error processing ${file.path}: ${error.message}`, "ERROR");
                console.error(`Error processing ${file.path}:`, error);
            }
        }

        // Add mock files
        const mockExpoIconsContent = `
export const MaterialCommunityIcons = (props) => React.createElement('span', { style: {display: 'inline-block', width: props.size || 24, height: props.size || 24, color: props.color, border:'1px dotted #ccc', textAlign:'center', lineHeight: (props.size || 24)+'px', fontSize: (props.size || 24)*0.5+'px', borderRadius: '3px', margin: '2px'} }, props.name ? props.name.substring(0,3) : 'ICO');
export const Ionicons = MaterialCommunityIcons; 
        `;
        transpiledFiles.push({ name: 'mock_expo_vector_icons.js', path: 'build/web-client/mock_expo_vector_icons.js', content: mockExpoIconsContent, type: 'file' });

        const mockLucideIconsContent = `
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
export default { Stack, Tabs, SplashScreen, Link, useRouter };
`;
        transpiledFiles.push({ name: 'mock_expo_router.js', path: 'build/web-client/mock_expo_router.js', content: mockExpoRouterContent, type: 'file'});

        const mockExpoContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';

export function registerRootComponent(App) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    if (rootElement._reactRootContainer) {
      console.log('Root already has a container, updating.')
      rootElement._reactRootContainer.render(React.createElement(App));
    } else {
      const root = ReactDOM.createRoot(rootElement);
      rootElement._reactRootContainer = root; // Store it for potential HMR or re-renders
      root.render(React.createElement(App));
    }
  } else {
    console.error('Root element #root not found for registerRootComponent');
    // Fallback: append to body if #root is missing (useful for some test environments)
    // const tempRoot = document.createElement('div');
    // tempRoot.id = 'root';
    // document.body.appendChild(tempRoot);
    // ReactDOM.createRoot(tempRoot).render(React.createElement(App));
  }
}

// Minimal mocks for other expo exports if they are used and cause errors
export const Constants = {
  expoVersion: 'mocked-expo-version',
  platform: {},
  manifest: { web: {} },
};

export const Linking = {
    openURL: (url) => { console.log(\`Mock Linking.openURL: \${url}\`); return Promise.resolve(); },
    addEventListener: () => ({ remove: () => {} }),
};

// Add other mocks as needed
`;
        transpiledFiles.push({ name: 'mock_expo.js', path: 'build/web-client/mock_expo.js', content: mockExpoContent, type: 'file'});


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
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: sans-serif; }
        #root { display: flex; flex-direction: column; height: 100%; }
        /* Basic RNW style normalization */
        div[style*="flex-direction:row"] { box-sizing: border-box; }
        div[style*="flex-direction:column"] { box-sizing: border-box; }
    </style>
    <script type="importmap">
${JSON.stringify(importMapEntries, null, 2)}
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module">
        import React from 'react';
        window.React = React; // Make React globally available for some libraries if needed

        // The main entry point for the app
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
         buildLogElement.textContent = 'Click "Build Project" to start the actual web client build.\n';
    }

    const defaultFileToShow = currentProjectStructure.find(f => f.path === 'index.js') || currentProjectStructure.find(f => f.path === 'App.tsx');
    if (defaultFileToShow) {
       loadFileContent(defaultFileToShow).then(() => {
           const items = fileTreeElement.querySelectorAll('.file-name');
           for (let item of items) {
               if (item.textContent.includes(defaultFileToShow.name)) {
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