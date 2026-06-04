export interface Author {
  name: string;
  title: string;
  avatar: string;
}

export interface Comment {
  id: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  likedByMe?: boolean;
  replies?: Comment[];
}

export interface BulletPoint {
  title: string;
  content: string;
}

export interface StructuredApproach {
  title: string;
  description: string;
  bullets: BulletPoint[];
  proTip: string;
}

export interface FAQItem {
  id: string;
  category: string;
  title: string;
  author: Author;
  timestamp: string;
  intro: string;
  structuredApproach: StructuredApproach;
  image: string;
  imageAlt: string;
  upvotes: number;
  voted?: 'up' | 'down' | null;
  views: string;
  commentsCount: number;
  comments: Comment[];
  relatedQuestions?: string[]; // list of FAQItem IDs
}

export interface RelatedQuestionMeta {
  id: string;
  title: string;
  commentsCount: number;
  views: string;
}
