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

