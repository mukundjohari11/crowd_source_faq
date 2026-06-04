import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Define the absolute JSON fallback database path
const LOCAL_DB_PATH = path.join(process.cwd(), 'db.json');

// Interface structures matching the frontend FAQItem / Comment
export interface Author {
  id?: string;
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
  likedBy?: string[]; // Array of user e-mails
  replies?: any[]; // Re-nested comments
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
  upvotedBy?: string[];
  downvotedBy?: string[];
  views: string;
  commentsCount: number;
  comments: Comment[];
  relatedQuestions?: string[];
}

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  bookmarks?: string[];
}

// Curated Seed Data
const SEED_POSTS: FAQItem[] = [
  {
    id: 'lit-review-structure',
    category: 'RESEARCH',
    title: 'How do I structure a literature review for a technical stipend application?',
    timestamp: '2 days ago',
    author: {
      id: 'arnab_chatterjee',
      name: 'Senior Research Advisor',
      title: 'Senior Research Mentor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
    },
    intro: 'The literature review is more than just a list of references. It serves as the intellectual foundation of your entire proposal, signaling to reviewers that you are addressing a real gap in current state-of-the-art methodology.',
    structuredApproach: {
      title: 'The Structured Approach',
      description: "When applying for a technical stipend at Vicharanashala, the literature review isn't just a list of books you've read. It's a strategic demonstration of your understanding of the current technological gap.",
      bullets: [
        {
          title: 'The Landscape Survey',
          content: "Identify the 5-7 core papers or projects that define your field of interest. Don't just summarize; contrast their methodologies."
        },
        {
          title: 'The Critical Gap',
          content: 'This is the most important part. Explicitly state what is missing or suboptimal in the current body of work.'
        },
        {
          title: 'Alignment',
          content: 'Explain how your proposed project directly addresses this gap.'
        }
      ],
      proTip: 'Use a thematic organization rather than a chronological one. This shows you have synthesized information rather than just recorded it.'
    },
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'A clean, minimalist high-tech workspace',
    upvotes: 124,
    views: '4.5k',
    commentsCount: 2,
    comments: [
      {
        id: 'c1',
        authorName: 'Riya Sharma',
        authorTitle: 'Undergraduate Fellow',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
        content: "This is exactly what I needed. I was struggling with the 'Critical Gap' section. Does this apply to PhD stipends as well?",
        timestamp: '5h ago',
        likes: 24,
        replies: [
          {
            id: 'c1-r1',
            authorName: 'Senior Research Advisor',
            authorTitle: 'Senior Research Mentor',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
            content: 'Yes, Riya. In fact, for PhD levels, the gap should be even more granular. You should ideally cite a specific limitation in a recent top-tier conference paper.',
            timestamp: '3h ago',
            likes: 12
          }
        ]
      }
    ],
    relatedQuestions: ['cgpa-requirements', 'find-mentor']
  },
  {
    id: 'cgpa-requirements',
    category: 'STIPENDS',
    title: 'Minimum CGPA required for the Research Excellence Stipend?',
    timestamp: '4 days ago',
    author: {
      id: 'admin_sys',
      name: 'Academic Office',
      title: 'Registrar & Funding Cell',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120'
    },
    intro: 'The Research Excellence Stipend targets top academic achievers who are also working on high-impact engineering projects.',
    structuredApproach: {
      title: 'The Eligibility Matrix',
      description: 'Review the minimum academic benchmarks and flexible waivers that are considered for application selection:',
      bullets: [
        {
          title: 'Primary Cutoff',
          content: 'A minimum CGPA of 8.5/10 is generally expected for undergraduate students, and 8.0/10 for postgraduate candidates.'
        },
        {
          title: 'Special Waivers',
          content: 'If you have an accepted paper at a Tier-1 conference or a significant contribution to a major open source library, the CGPA threshold is waived to 7.5.'
        }
      ],
      proTip: 'If your CGPA is between 7.5 and 8.5, ensure your letters of recommendation and repository codebase links are prominent.'
    },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Data science dashboard',
    upvotes: 41,
    views: '1.1k',
    commentsCount: 0,
    comments: [],
    relatedQuestions: ['lit-review-structure']
  }
];

// Connection variables
let isMongo = false;

// Initialize Cloudinary if CLOUDINARY_URL is set
if (process.env.CLOUDINARY_URL) {
  try {
    const configUrl = process.env.CLOUDINARY_URL;
    // Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const parts = configUrl.replace('cloudinary://', '').split('@');
    if (parts.length === 2) {
      const creds = parts[0].split(':');
      const cloudName = parts[1];
      cloudinary.config({
        cloud_name: cloudName,
        api_key: creds[0],
        api_secret: creds[1],
        secure: true
      });
      console.log('Cloudinary storage initialized successfully.');
    }
  } catch (err) {
    console.warn('Failed to parse CLOUDINARY_URL:', err);
  }
}

// Schemas when MongoDB is connected
let MongoUserModel: any;
let MongoPostModel: any;

const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI provided. Fallback JSON database local-mode is active.');
    return;
  }

  try {
    await mongoose.connect(uri);
    isMongo = true;
    console.log('Successfully connected to MongoDB Atlas database!');

    // Initialize Schemas
    const userSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, required: true },
      title: { type: String, required: true },
      bio: { type: String, default: '' },
      bookmarks: { type: [String], default: [] }
    }, { timestamps: true });

    const postSchema = new mongoose.Schema({
      id: { type: String, required: true, unique: true },
      category: { type: String, required: true },
      title: { type: String, required: true },
      author: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        title: { type: String, required: true },
        avatar: { type: String, required: true }
      },
      timestamp: { type: String, default: 'Just now' },
      intro: { type: String, required: true },
      structuredApproach: {
        title: { type: String, required: true },
        description: { type: String, required: true },
        bullets: { type: Array, default: [] },
        proTip: { type: String, default: '' }
      },
      image: { type: String, default: '' },
      imageAlt: { type: String, default: '' },
      upvotes: { type: Number, default: 0 },
      views: { type: String, default: '1' },
      commentsCount: { type: Number, default: 0 },
      comments: { type: Array, default: [] },
      upvotedBy: { type: [String], default: [] },
      downvotedBy: { type: [String], default: [] }
    }, { timestamps: true });

    MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);
    MongoPostModel = mongoose.models.Post || mongoose.model('Post', postSchema);

    // Initial seeding for MongoDB if empty
    const count = await MongoPostModel.countDocuments();
    if (count === 0) {
      await MongoPostModel.insertMany(SEED_POSTS);
      console.log('Pre-populated MongoDB database with base peer-review discussions!');
    }

  } catch (error) {
    console.error('MongoDB Connection Error. Falling back to local db.json:', error);
    isMongo = false;
  }
};

// Local JSON File Helper
const loadLocalDb = (): { users: DbUser[]; posts: FAQItem[] } => {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const freshDb = { users: [], posts: SEED_POSTS };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(freshDb, null, 2));
    return freshDb;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local db.json, returning empty', e);
    return { users: [], posts: SEED_POSTS };
  }
};

const saveLocalDb = (data: { users: DbUser[]; posts: FAQItem[] }) => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing local db.json', e);
  }
};

// Launch connect
connectMongo();

// EXPORT DATABASE DRIVER FUNCTIONS
export const db = {
  isMongoActive: () => isMongo,

  // Users Management
  findUserByEmail: async (email: string): Promise<DbUser | null> => {
    if (isMongo && MongoUserModel) {
      const user = await MongoUserModel.findOne({ email: email.toLowerCase() });
      return user ? user.toObject() : null;
    } else {
      const local = loadLocalDb();
      const user = local.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return user || null;
    }
  },

  findUserById: async (id: string): Promise<DbUser | null> => {
    if (isMongo && MongoUserModel) {
      const user = await MongoUserModel.findOne({ id });
      return user ? user.toObject() : null;
    } else {
      const local = loadLocalDb();
      const user = local.users.find(u => u.id === id);
      return user || null;
    }
  },

  saveUser: async (user: DbUser): Promise<DbUser> => {
    if (isMongo && MongoUserModel) {
      const newUser = new MongoUserModel(user);
      await newUser.save();
      return user;
    } else {
      const local = loadLocalDb();
      local.users.push(user);
      saveLocalDb(local);
      return user;
    }
  },

  updateUser: async (id: string, updates: Partial<DbUser>): Promise<DbUser | null> => {
    if (isMongo && MongoUserModel) {
      const updated = await MongoUserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      return updated ? updated.toObject() : null;
    } else {
      const local = loadLocalDb();
      const idx = local.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      local.users[idx] = { ...local.users[idx], ...updates };
      saveLocalDb(local);
      return local.users[idx];
    }
  },

  // Posts Methods
  getPosts: async (): Promise<FAQItem[]> => {
    if (isMongo && MongoPostModel) {
      const posts = await MongoPostModel.find({}).sort({ createdAt: -1 });
      return posts.map((p: any) => p.toObject());
    } else {
      const local = loadLocalDb();
      return local.posts;
    }
  },

  getPostById: async (id: string): Promise<FAQItem | null> => {
    if (isMongo && MongoPostModel) {
      const post = await MongoPostModel.findOne({ id });
      return post ? post.toObject() : null;
    } else {
      const local = loadLocalDb();
      const post = local.posts.find(p => p.id === id);
      return post || null;
    }
  },

  createPost: async (post: FAQItem): Promise<FAQItem> => {
    if (isMongo && MongoPostModel) {
      const newPost = new MongoPostModel({
        ...post,
        upvotedBy: [post.author.id || ''],
        downvotedBy: []
      });
      await newPost.save();
      return post;
    } else {
      const local = loadLocalDb();
      const freshPost = {
        ...post,
        upvotedBy: [post.author.id || ''],
        downvotedBy: []
      };
      local.posts.unshift(freshPost);
      saveLocalDb(local);
      return freshPost;
    }
  },

  updatePost: async (id: string, updates: Partial<FAQItem>): Promise<FAQItem | null> => {
    if (isMongo && MongoPostModel) {
      const updated = await MongoPostModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
      return updated ? updated.toObject() : null;
    } else {
      const local = loadLocalDb();
      const idx = local.posts.findIndex(p => p.id === id);
      if (idx === -1) return null;
      local.posts[idx] = { ...local.posts[idx], ...updates };
      saveLocalDb(local);
      return local.posts[idx];
    }
  },

  deletePost: async (id: string, authorId: string): Promise<boolean> => {
    if (isMongo && MongoPostModel) {
      const res = await MongoPostModel.deleteOne({ id, 'author.id': authorId });
      return res.deletedCount > 0;
    } else {
      const local = loadLocalDb();
      const origLength = local.posts.length;
      local.posts = local.posts.filter(p => !(p.id === id && p.author.id === authorId));
      saveLocalDb(local);
      return local.posts.length < origLength;
    }
  },

  // Cloudinary Upload Image helper or return direct URL
  uploadImage: async (base64Image: string): Promise<string> => {
    if (process.env.CLOUDINARY_URL && base64Image.startsWith('data:image')) {
      try {
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: 'vicharanashala'
        });
        return result.secure_url;
      } catch (err) {
        console.error('Cloudinary error, fallback to base64 string:', err);
      }
    }
    // Return direct base64 image or generic sample image on error/offline
    return base64Image;
  }
};
