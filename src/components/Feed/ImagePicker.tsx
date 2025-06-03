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

