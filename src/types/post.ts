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

