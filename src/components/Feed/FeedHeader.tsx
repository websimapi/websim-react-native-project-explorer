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

