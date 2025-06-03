``` index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Native Project Explorer</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css">
    <script>
        // Import map is not strictly needed for Prism.js if loaded globally,
        // but demonstrates capability for other libraries if desired.
        // For Prism, we'll use direct script tags below.
    </script>
</head>
<body>
    <div id="app-container">
        <aside id="file-sidebar">
            <h2>Project Files</h2>
            <ul id="file-tree"></ul>
            <button id="build-project-button">Build Project</button>
        </aside>
        <main id="content-viewer">
            <div id="file-info">
                <h3 id="selected-file-name">Select a file to view its content</h3>
                <div id="exported-members"></div>
            </div>
            <div id="code-display-container">
                <pre><code id="code-display" class="language-typescript"></code></pre>
            </div>
            <iframe id="iframe-client-viewer"></iframe>

            <div id="build-output-container">
                <h4>Build Output</h4>
                <pre id="build-log"></pre>
            </div>
        </main>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script>
        Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
    </script>
    <script src="script.js"></script>
</body>
</html>
```

``` app/(tabs)/messages.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold', // Assuming Inter-Bold is loaded
    fontSize: 24,
    color: '#111827',
  },
});


```

``` src/components/Feed/FeedHeader.tsx
import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assumed available
import { SortOption } from '../../types/post'; // Corrected import for SortOption

interface FeedHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption; // Use SortOption type
  onSortChange: (sort: SortOption) => void; // Use SortOption type
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function FeedHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  // selectedTag and onTagSelect are declared but not used in the original JSX
  // Adding them back if they were intended for future use or if UI elements were omitted.
}: FeedHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search posts..."
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Pressable
          style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
          onPress={() => onSortChange('newest')}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color={sortBy === 'newest' ? '#6366f1' : 'gray'}
          />
          <Text style={[styles.sortText, sortBy === 'newest' && styles.sortTextActive]}>
            Newest
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortBy === 'top' && styles.sortButtonActive]}
          onPress={() => onSortChange('top')}
        >
          <MaterialCommunityIcons
            name="fire"
            size={16}
            color={sortBy === 'top' ? '#6366f1' : 'gray'}
          />
          <Text style={[styles.sortText, sortBy === 'top' && styles.sortTextActive]}>
            Top
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortBy === 'trending' && styles.sortButtonActive]}
          onPress={() => onSortChange('trending')}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={16}
            color={sortBy === 'trending' ? '#6366f1' : 'gray'}
          />
          <Text style={[styles.sortText, sortBy === 'trending' && styles.sortTextActive]}>
            Trending
          </Text>
        </Pressable>
      </View>
      {/* Placeholder for Tag selection UI if onTagSelect and selectedTag are to be used */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 5,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  sortButtonActive: {
    backgroundColor: '#f0f1ff',
  },
  sortText: {
    marginLeft: 5,
    color: 'gray',
    fontSize: 14,
  },
  sortTextActive: {
    color: '#6366f1',
  },
});


```

``` src/components/Feed/PostDetail.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assumed available
import { Post } from '../../types/post';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  const getEngagementRate = () => {
    if (!post.views || post.views === 0) return 'N/A'; // Avoid division by zero
    const totalVotes = (post.upvotes || 0) + (post.downvotes || 0);
    const totalInteractions = totalVotes + (post.comments?.length || 0);
    return ((totalInteractions / post.views) * 100).toFixed(1);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Post Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Content</Text>
        <Text style={styles.content}>{post.content}</Text>
      </View>

      {/* Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="eye" size={20} color="#6366f1" />
          <Text style={styles.statLabel}>Views</Text>
          <Text style={styles.statValue}>{post.views || 0}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="arrow-up-bold" size={20} color="#6366f1" />
          <Text style={styles.statLabel}>Upvote Rate</Text>
          <Text style={styles.statValue}>
            {((post.upvotes || 0) + (post.downvotes || 0)) > 0 
              ? (((post.upvotes || 0) / ((post.upvotes || 0) + (post.downvotes || 0))) * 100).toFixed(1) + '%' 
              : 'N/A'}
          </Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="comment-multiple" size={20} color="#6366f1" />
          <Text style={styles.statLabel}>Comments</Text>
          <Text style={styles.statValue}>{post.comments?.length || 0}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="chart-line" size={20} color="#6366f1" />
          <Text style={styles.statLabel}>Engagement Rate</Text>
          <Text style={styles.statValue}>{getEngagementRate()}%</Text>
        </View>
      </View>

      {/* Interaction Timeline */}
      {post.interactions && post.interactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction Timeline</Text>
          {post.interactions.map((interaction, index) => (
            <View key={index} style={styles.timelineItem}>
              <MaterialCommunityIcons
                name={
                  interaction.type === 'upvote' ? 'arrow-up-bold' :
                  interaction.type === 'downvote' ? 'arrow-down-bold' :
                  'comment'
                }
                size={16}
                color="#6366f1"
              />
              <Text style={styles.timelineText}>
                {interaction.type === 'comment' ? 'New comment' : `${interaction.type}`}
              </Text>
              <Text style={styles.timelineTime}>
                {new Date(interaction.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    marginLeft: 10,
    flex: 1,
    color: '#4B5563',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6366f1',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  timelineText: {
    marginLeft: 10,
    flex: 1,
  },
  timelineTime: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});


```

``` src/components/Feed/FeedScreen.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native'; // Using FlatList for performance
import { CreatePost } from './CreatePost';
import { PostList } from './PostList'; // PostList itself uses ScrollView, consider direct render or FlatList item
import { FeedHeader } from './FeedHeader';
import { Post, SortOption } from '../../types/post';

// Dummy initial posts for demonstration
const initialPosts: Post[] = [
  {
    id: '1', content: 'Welcome to the feed! This is the first post.', author: 'Admin', 
    timestamp: new Date(Date.now() - 3600000 * 2), upvotes: 10, downvotes: 1, 
    tags: ['Community', 'News'], comments: [], saved: false, views: 100,
    interactions: [{type: 'upvote', timestamp: new Date(Date.now() - 3600000 * 1)}]
  },
  {
    id: '2', content: 'Check out this cool event happening next week!', author: 'User123', 
    timestamp: new Date(Date.now() - 3600000 * 5), upvotes: 25, downvotes: 3, 
    tags: ['Events', 'Social'], comments: [{id: 'c1', author: 'Bot', content: 'Sounds fun!', timestamp: new Date(), upvotes: 1, downvotes: 0}], saved: true, views: 250,
    interactions: [{type: 'comment', timestamp: new Date(Date.now() - 3600000 * 3)}]
  },
];


export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Calculate trending score based on time and votes
  const getTrendingScore = (post: Post) => {
    const hoursOld = (new Date().getTime() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
    const score = (post.upvotes || 0) - (post.downvotes || 0);
    return score / Math.pow(hoursOld + 2, 1.8); // Similar to Reddit's algorithm
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }
    // Apply sorting
    switch (sortBy) {
      case 'top':
        return filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'trending':
        return filtered.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [posts, searchQuery, sortBy, selectedTag]);


  const handleCreatePost = useCallback((content: string, tags: string[], mediaUrls: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      content,
      author: 'Current User', // Replace with actual user
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      tags: tags || [],
      mediaUrls: mediaUrls || [],
      comments: [],
      saved: false,
      views: 0,
      interactions: []
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const handleUpvote = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, upvotes: (post.upvotes || 0) + 1 } : post
      )
    );
  }, []);

  const handleDownvote = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, downvotes: (post.downvotes || 0) + 1 } : post
      )
    );
  }, []);

  const handleSave = useCallback((postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      )
    );
  }, []);

  const handleComment = useCallback((postId: string, content: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: Date.now().toString(),
              content,
              author: 'Current User', // Replace with actual user
              timestamp: new Date(),
              upvotes: 0,
              downvotes: 0
            }
          ]
        } : post
      )
    );
  }, []);

  return (
    <View style={styles.container}>
      <FeedHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />
      <CreatePost onSubmit={handleCreatePost} />
      {/* PostList itself includes a ScrollView. If this FeedScreen is also scrollable,
          it might cause issues. For many posts, FlatList is preferred here.
          However, PostList is designed to show multiple posts.
          Wrapping PostList or using it as FlatList's renderItem would require refactoring PostList.
          For now, keeping it simple as it was structured.
      */}
      <PostList
        posts={filteredAndSortedPosts}
        onUpvote={handleUpvote}
        onDownvote={handleDownvote}
        onSave={handleSave}
        onComment={handleComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});


```

``` src/components/Feed/PostList.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assumed available
import { Post, Comment } from '../../types/post';
import { ShareModal } from './ShareModal';

interface PostListProps {
  posts: Post[];
  onUpvote: (postId: string) => void;
  onDownvote: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

export function PostList({ posts, onUpvote, onDownvote, onSave, onComment }: PostListProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedPostIdForShare, setSelectedPostIdForShare] = useState<string | null>(null);


  const formatTimestamp = (date: Date | string) => { // Allow string for flexibility
    const then = new Date(date);
    const now = new Date();
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSubmitComment = (postId: string) => {
    if (commentText.trim()) {
      onComment(postId, commentText);
      setCommentText('');
    }
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <MaterialCommunityIcons name="account-circle" size={24} color="#6366f1" />
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
        </View>
        <Pressable onPress={() => onSave(post.id)}>
          <MaterialCommunityIcons
            name={post.saved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={post.saved ? "#6366f1" : "gray"}
          />
        </Pressable>
      </View>

      {/* Post Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {post.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaContainer}>
          {post.mediaUrls.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.mediaImage} onError={() => console.log('Error loading image:', url)} />
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.votingContainer}>
          <Pressable style={styles.actionButton} onPress={() => onUpvote(post.id)}>
            <MaterialCommunityIcons name="arrow-up-bold" size={24} color="gray" />
            <Text style={styles.voteCount}>{post.upvotes}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => onDownvote(post.id)}>
            <MaterialCommunityIcons name="arrow-down-bold" size={24} color="gray" />
            <Text style={styles.voteCount}>{post.downvotes}</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.actionButton}
          onPress={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
        >
          <MaterialCommunityIcons name="comment-outline" size={24} color="gray" />
          <Text style={styles.commentCount}>{post.comments?.length || 0}</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => {
            setSelectedPostIdForShare(post.id);
            setShareModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="gray" />
        </Pressable>
      </View>

      {/* Comments Section */}
      {expandedPost === post.id && (
        <View style={styles.commentsSection}>
          {post.comments && post.comments.map((comment: Comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentTimestamp}>
                  {formatTimestamp(comment.timestamp)}
                </Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.input}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              multiline
            />
            <Pressable style={styles.sendButton} onPress={() => handleSubmitComment(post.id)}>
              <MaterialCommunityIcons name="send" size={24} color="#6366f1" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {posts.map(renderPost)}
      {selectedPostIdForShare && (
          <ShareModal
            visible={shareModalVisible}
            onClose={() => {
                setShareModalVisible(false);
                setSelectedPostIdForShare(null);
            }}
            onShare={(platform) => {
              // Handle share action based on platform
              console.log(`Sharing post ${selectedPostIdForShare} on ${platform}`);
              setShareModalVisible(false);
              setSelectedPostIdForShare(null);
            }}
          />
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 8,
  },
  timestamp: {
    color: 'gray',
    fontSize: 12,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  tagText: {
    color: '#4b5563',
    fontSize: 12,
  },
  mediaContainer: {
    marginBottom: 10,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#e0e0e0', // Placeholder color
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  votingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginRight: 15, // Ensure spacing for last button too
  },
  voteCount: {
    marginLeft: 5,
    color: 'gray',
  },
  commentCount: {
    marginLeft: 5,
    color: 'gray',
  },
  commentsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  comment: {
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentTimestamp: {
    color: 'gray',
    fontSize: 10,
  },
  commentContent: {
    fontSize: 14,
  },
  commentInputContainer: { // Changed from commentInput to avoid conflict
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: 'white',
    minHeight: 40, // Ensure decent height for multiline
  },
  sendButton: {
    padding: 5,
  }
});


```

``` global.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_KEY: string;
    }
  }
}
export {};


```

``` app/(tabs)/index.tsx
import { View, StyleSheet } from 'react-native';
import FeedScreen from '../../src/components/Feed/FeedScreen'; // Adjusted path

export default function TabFeedScreen() {
  return (
    <View style={styles.container}>
      <FeedScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});


```

``` src/components/Feed/ImagePicker.tsx
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
    width


```

``` hooks/useFrameworkReady.ts
import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization code
    console.log("Framework ready hook triggered.");
  }, []);
}


```

``` App.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthStack from './src/navigation/AuthStack';
import MainStack from './src/navigation/MainStack';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen
              name="Auth"
              component={(props) => (
                <AuthStack {...props} onLogin={() => setIsAuthenticated(true)} />
              )}
            />
          ) : (
            <Stack.Screen
              name="Main"
              component={(props) => (
                <MainStack {...props} onLogout={() => setIsAuthenticated(false)} />
              )}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}


```

``` index.js
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);


```

``` src/types/post.ts
export interface Post {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  tags: string[];
  mediaUrls?: string[];
  comments: Comment[];
  saved: boolean;
  views?: number; // Added from PostDetail.tsx usage
  interactions?: Interaction[]; // Added from PostDetail.tsx usage
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
}

// Added from PostDetail.tsx usage
export interface Interaction {
  type: 'upvote' | 'downvote' | 'comment';
  timestamp: Date;
}


export type SortOption = 'newest' | 'top' | 'trending';

export const AVAILABLE_TAGS = [
  'Community', 'Events', 'Support', 'Discussion', 'News', 'Resource', 'Question', 'Social'
];


```

``` src/components/Feed/ShareModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assumed available

type SharePlatform = 'copy' | 'twitter' | 'facebook' | 'whatsapp';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (platform: SharePlatform) => void;
}

export function ShareModal({ visible, onClose, onShare }: ShareModalProps) {
  const ShareOption = ({
    platform,
    icon,
    color,
    label,
  }: {
    platform: SharePlatform;
    icon: string; // MaterialCommunityIcons name
    color: string;
    label: string;
  }) => (
    <Pressable style={styles.shareOption} onPress={() => onShare(platform)}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color="white" />
      </View>
      <Text style={styles.shareLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Added onStartShouldSetResponder to prevent taps inside modal from closing it */}
          <View style={styles.handle} />
          <Text style={styles.title}>Share Post</Text>
          <View style={styles.optionsContainer}>
            <ShareOption platform="copy" icon="content-copy" color="#6B7280" label="Copy Link" />
            <ShareOption platform="twitter" icon="twitter" color="#1DA1F2" label="Twitter" />
            <ShareOption platform="facebook" icon="facebook" color="#4267B2" label="Facebook" />
            <ShareOption platform="whatsapp" icon="whatsapp" color="#25D366" label="WhatsApp" />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  shareOption: {
    alignItems: 'center',
    width: '25%', // Adjust based on gap and container width
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
});


```

``` app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Removed direct import of useFrameworkReady and fonts as they are not executable in this viewer context
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync(); // This would be for the actual app runtime

export default function RootLayout() {
  // useFrameworkReady(); // Call hook

  // const [fontsLoaded, fontError] = useFonts({
  //   'Inter-Regular': Inter_400Regular,
  //   'Inter-Bold': Inter_700Bold,
  // });

  // useEffect(() => {
  //   if (fontsLoaded || fontError) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, fontError]);

  // // Return null to keep splash screen visible while fonts load
  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }
  // Simplified for viewer: Assume fonts are handled by browser/OS or not critical for viewing code structure
  
  useEffect(() => {
    // Simulate hiding splash screen if it were a real app context
    SplashScreen.hideAsync?.().catch(() => {}); // Optional chaining for safety
  }, []);


  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}


```

``` app/(tabs)/events.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold', // Assuming Inter-Bold is loaded
    fontSize: 24,
    color: '#111827',
  },
});


```

``` app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Home, Users, MessageCircle } from 'lucide-react-native'; // Assuming lucide-react-native is available

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold', // Assuming Inter-Bold is loaded
          color: '#111827',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}


```

``` script.js
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
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K" alt="React Logo">
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
```

``` style.css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    background-color: #f0f2f5;
    color: #333;
    display: flex;
    height: 100vh;
    overflow: hidden;
}

#app-container {
    display: flex;
    width: 100%;
    height: 100%;
}

#file-sidebar {
    width: 280px;
    background-color: #2c3e50;
    color: #ecf0f1;
    padding: 20px;
    overflow-y: auto;
    height: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
}

#file-sidebar h2 {
    margin-top: 0;
    font-size: 1.4em;
    border-bottom: 1px solid #34495e;
    padding-bottom: 10px;
}

#file-tree {
    list-style-type: none;
    padding-left: 0;
}

#file-tree ul {
    list-style-type: none;
    padding-left: 20px;
}

.tree-item {
    padding: 6px 0;
    cursor: pointer;
    font-size: 0.95em;
}

.tree-item:hover {
    background-color: #34495e;
}

.tree-item.selected {
    background-color: #1abc9c;
    color: #fff;
    font-weight: bold;
}

.folder-name {
    font-weight: bold;
    color: #e0e0e0; /* Lighter color for folder names */
}

.file-name::before {
    content: "📄 "; /* Default icon */
    font-family: monospace;
}
.file-name.tsx::before { content: "⚛️ "; } /* React icon for tsx */
.file-name.ts::before { content: "📜 "; } /* TypeScript icon */
.file-name.js::before { content: "🔶 "; } /* JS icon */
.file-name.json::before { content: "⚙️ "; } /* JSON icon */


#content-viewer {
    flex-grow: 1;
    padding: 20px;
    background-color: #ffffff;
    overflow-y: auto;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

#file-info {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

#selected-file-name {
    margin-top: 0;
    font-size: 1.5em;
    color: #2c3e50;
}

#exported-members {
    font-size: 0.9em;
    color: #555;
    min-height: 1.2em; /* Ensure space even when empty */
}

#exported-members strong {
    color: #333;
}

/* Container for the code display area */
#code-display-container {
    flex-grow: 1; /* Allows code display to take available space */
    display: flex; /* Default visible state */
    flex-direction: column;
    min-height: 200px; /* Minimum height for code view */
    overflow: hidden; /* Prevent its children from overflowing it */
}

#code-display {
    font-size: 0.85em; /* Smaller font for code */
    line-height: 1.5;
    display: block;
    white-space: pre-wrap; /* Allow wrapping */
    word-wrap: break-word; /* Break long words */
    background-color: #2d2d2d; /* Okaidia theme background */
    border-radius: 5px;
    padding: 15px;
    flex-grow: 1; /* Allow pre/code to grow and scroll within container */
    overflow: auto; /* Allow scrolling for code content */
}

/* Iframe for displaying built client */
#iframe-client-viewer {
    flex-grow: 1; /* Allows iframe to take available space */
    width: 100%;
    height: 100%; /* Takes height from flex container */
    border: 1px solid #ccc;
    display: none; /* Hidden by default */
    min-height: 300px; /* Minimum height for client preview */
}

#build-project-button {
    background-color: #1abc9c;
    color: white;
    border: none;
    padding: 10px 15px;
    margin-top: 20px;
    width: 100%;
    cursor: pointer;
    font-size: 1em;
    border-radius: 4px;
    text-align: center;
}

#build-project-button:hover {
    background-color: #16a085;
}

#build-output-container {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    flex-grow: 1; /* Allow build output to take remaining space */
    display: flex;
    flex-direction: column;
    min-height: 150px; /* Minimum height for the build output section */
}

#build-output-container h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2em;
    color: #2c3e50;
}

#build-log {
    flex-grow: 1;
    background-color: #212121; /* Slightly different dark for logs */
    color: #c5c8c6; /* Light grey text for logs */
    padding: 10px;
    font-family: 'Menlo', 'Consolas', monospace;
    font-size: 0.8em;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-y: auto; /* Allow vertical scrolling */
    border: 1px solid #333;
}

/* For Prism.js line numbers if used */
pre[class*="language-"].line-numbers {
    position: relative;
    padding-left: 3.8em;
    counter-reset: linenumber;
}

pre[class*="language-"].line-numbers > code {
    position: relative;
    white-space: inherit;
}

.line-numbers .line-numbers-rows {
    position: absolute;
    pointer-events: none;
    top: 0;
    font-size: 100%;
    left: -3.8em;
    width: 3em; /* works for line-numbers below 1000 lines */
    letter-spacing: -1px;
    border-right: 1px solid #999;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
```

``` src/components/Feed/CreatePost.tsx
// Placeholder for CreatePost.tsx
// Content not provided in initial setup.
// This is a basic functional component to avoid breaking imports.
import React from 'react';
import { View, Text } from 'react-native-web'; // Use react-native-web for consistency if this gets built

export function CreatePost(props) {
  console.warn("CreatePost.tsx is a placeholder component.");
  return (
    <View style={{padding: 10, margin: 10, borderWidth: 1, borderColor: 'lightgray', borderRadius: 5}}>
      <Text>CreatePost Placeholder</Text>
      <Text style={{fontSize: 12, color: 'gray'}}>Props: {JSON.stringify(Object.keys(props))}</Text>
    </View>
  );
}

export default CreatePost;


```