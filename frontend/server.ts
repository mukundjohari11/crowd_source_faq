import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './server/db';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'vicharanashala_jwt_super_secret_key';

// Lazy initialize Gemini AI client if key is present
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

// Middleware to authenticate JWT Token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==================== AUTHENTICATION ENDPOINTS ====================

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, name, title, avatar } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const existing = await db.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'u' + Date.now().toString() + Math.random().toString(36).slice(-3);

      const newUser = {
        id: userId,
        email: email.toLowerCase(),
        passwordHash,
        name,
        title: title || 'Undergraduate Scholar',
        avatar: avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`,
        bio: 'Honorable scholar of the forum.',
        bookmarks: []
      };

      const saved = await db.saveUser(newUser);
      const token = jwt.sign({ id: saved.id, email: saved.email, name: saved.name }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: {
          id: saved.id,
          email: saved.email,
          name: saved.name,
          title: saved.title,
          avatar: saved.avatar,
          bio: saved.bio,
          bookmarks: saved.bookmarks
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      if (!matches) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          title: user.title,
          avatar: user.avatar,
          bio: user.bio || '',
          bookmarks: user.bookmarks || []
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          title: user.title,
          avatar: user.avatar,
          bio: user.bio || '',
          bookmarks: user.bookmarks || []
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    try {
      const { name, title, avatar, bio } = req.body;
      const updated = await db.updateUser(req.user.id, { name, title, avatar, bio });
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          title: updated.title,
          avatar: updated.avatar,
          bio: updated.bio || '',
          bookmarks: updated.bookmarks || []
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DISCUSSION POSTS ENDPOINTS ====================

  app.get('/api/posts', async (req, res) => {
    try {
      let posts = await db.getPosts();
      const { category, search, authorId, bookmarked, myQuestions, sort } = req.query;

      if (category) {
        posts = posts.filter(p => p.category.toUpperCase() === (category as string).toUpperCase());
      }
      if (search) {
        const q = (search as string).toLowerCase();
        posts = posts.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.intro.toLowerCase().includes(q)
        );
      }
      if (authorId) {
        posts = posts.filter(p => p.author.id === authorId);
      }

      // Optional Auth Parsing
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      let currentUser: any = null;
      if (token) {
        try {
          currentUser = jwt.verify(token, JWT_SECRET);
        } catch (e) {}
      }

      if (currentUser) {
        const dbUser = await db.findUserById(currentUser.id);
        if (myQuestions) {
          posts = posts.filter(p => p.author.id === currentUser.id);
        }
        if (bookmarked && dbUser) {
          const bookmarks = dbUser.bookmarks || [];
          posts = posts.filter(p => bookmarks.includes(p.id));
        }

        // Highlight custom voted/bookmarked state
        posts = posts.map(p => {
          let voted: 'up' | 'down' | null = null;
          if (p.upvotedBy?.includes(currentUser.id)) voted = 'up';
          if (p.downvotedBy?.includes(currentUser.id)) voted = 'down';
          return {
            ...p,
            voted,
            bookmarked: dbUser?.bookmarks?.includes(p.id) || false
          };
        });
      }

      // Reddit-style sorting
      if (sort === 'new') {
        // Chronological order (implicitly newer ids/timestamps)
        posts.sort((a, b) => b.id.localeCompare(a.id));
      } else if (sort === 'views') {
        posts.sort((a, b) => {
          const vA = parseInt(a.views.replace(/[^\d]/g, '')) || 0;
          const vB = parseInt(b.views.replace(/[^\d]/g, '')) || 0;
          return vB - vA;
        });
      } else {
        // Primary 'hot' sorting based on upvotes count
        posts.sort((a, b) => b.upvotes - a.upvotes);
      }

      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const post = await db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post thread not found' });
      }

      // Check auth client state
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      let currentUser: any = null;
      if (token) {
        try {
          currentUser = jwt.verify(token, JWT_SECRET);
        } catch (e) {}
      }

      let voted: 'up' | 'down' | null = null;
      let isBookmarked = false;
      if (currentUser) {
        const dbUser = await db.findUserById(currentUser.id);
        if (post.upvotedBy?.includes(currentUser.id)) voted = 'up';
        if (post.downvotedBy?.includes(currentUser.id)) voted = 'down';
        isBookmarked = dbUser?.bookmarks?.includes(post.id) || false;
      }

      // Increment views count
      let viewNum = parseInt(post.views.replace(/[^\d]/g, '')) || 0;
      viewNum += 1;
      const views = viewNum >= 1000 ? `${(viewNum / 1000).toFixed(1)}k` : `${viewNum}`;
      await db.updatePost(post.id, { views });

      res.json({
        ...post,
        views,
        voted,
        bookmarked: isBookmarked
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts', authenticateToken, async (req: any, res) => {
    try {
      const { category, title, intro, structuredApproach, image, imageAlt } = req.body;
      if (!category || !title || !intro || !structuredApproach) {
        return res.status(400).json({ error: 'Primary text and structure fields are required' });
      }

      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Process image upload
      let finalImgUrl = '';
      if (image) {
        finalImgUrl = await db.uploadImage(image);
      }

      const postId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

      const newPost = {
        id: postId,
        category: category.toUpperCase(),
        title,
        author: {
          id: user.id,
          name: user.name,
          title: user.title,
          avatar: user.avatar
        },
        timestamp: 'Just now',
        intro,
        structuredApproach: {
          title: structuredApproach.title || 'The Structured Approach',
          description: structuredApproach.description || '',
          bullets: structuredApproach.bullets || [],
          proTip: structuredApproach.proTip || ''
        },
        image: finalImgUrl,
        imageAlt: imageAlt || title,
        upvotes: 1,
        views: '1',
        commentsCount: 0,
        comments: [],
        upvotedBy: [user.id],
        downvotedBy: [],
        relatedQuestions: []
      };

      const saved = await db.createPost(newPost);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts/:id/vote', authenticateToken, async (req: any, res) => {
    try {
      const { dir } = req.body; // 'up' | 'down' | null
      const post = await db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post thread not found' });
      }

      const userId = req.user.id;
      let upvotedBy = post.upvotedBy || [];
      let downvotedBy = post.downvotedBy || [];

      // Cleanse array records
      upvotedBy = upvotedBy.filter(id => id !== userId);
      downvotedBy = downvotedBy.filter(id => id !== userId);

      if (dir === 'up') {
        upvotedBy.push(userId);
      } else if (dir === 'down') {
        downvotedBy.push(userId);
      }

      const upvotes = upvotedBy.length - downvotedBy.length;
      await db.updatePost(post.id, {
        upvotes,
        upvotedBy,
        downvotedBy
      });

      res.json({ upvotes, voted: dir });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts/:id/comments', authenticateToken, async (req: any, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const post = await db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post thread not found' });
      }

      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User credentials offline' });
      }

      const newComment = {
        id: 'c-' + Date.now().toString(),
        authorName: user.name,
        authorTitle: user.title,
        authorAvatar: user.avatar,
        content,
        timestamp: 'Just now',
        likes: 0,
        likedBy: [],
        replies: []
      };

      const comments = post.comments || [];
      comments.push(newComment);

      const totalCommentsCount = comments.length + comments.reduce((acc, current) => acc + (current.replies?.length || 0), 0);

      await db.updatePost(post.id, {
        comments,
        commentsCount: totalCommentsCount
      });

      res.status(201).json(newComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts/:id/comments/:commentId/replies', authenticateToken, async (req: any, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Reply content is required' });
      }

      const post = await db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post thread not found' });
      }

      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Author offline' });
      }

      const newReply = {
        id: 'r-' + Date.now().toString(),
        authorName: user.name,
        authorTitle: user.title,
        authorAvatar: user.avatar,
        content,
        timestamp: 'Just now',
        likes: 0,
        likedBy: []
      };

      const comments = post.comments || [];
      const parentIdx = comments.findIndex(c => c.id === req.params.commentId);
      if (parentIdx === -1) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }

      comments[parentIdx].replies = comments[parentIdx].replies || [];
      comments[parentIdx].replies!.push(newReply);

      const totalCommentsCount = comments.length + comments.reduce((acc, current) => acc + (current.replies?.length || 0), 0);

      await db.updatePost(post.id, {
        comments,
        commentsCount: totalCommentsCount
      });

      res.status(201).json(newReply);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts/:id/comments/:commentId/like', authenticateToken, async (req: any, res) => {
    try {
      const post = await db.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post thread not found' });
      }

      const userEmail = req.user.email;
      const comments = post.comments || [];
      const commentIdx = comments.findIndex(c => c.id === req.params.commentId);

      if (commentIdx === -1) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      let likedBy = comments[commentIdx].likedBy || [];
      if (likedBy.includes(userEmail)) {
        likedBy = likedBy.filter(email => email !== userEmail);
      } else {
        likedBy.push(userEmail);
      }

      comments[commentIdx].likedBy = likedBy;
      comments[commentIdx].likes = likedBy.length;

      await db.updatePost(post.id, { comments });
      res.json({ likes: comments[commentIdx].likes, likedByMe: likedBy.includes(userEmail) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts/:id/bookmark', authenticateToken, async (req: any, res) => {
    try {
      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let bookmarks = user.bookmarks || [];
      const postId = req.params.id;
      let isBookmarked = false;

      if (bookmarks.includes(postId)) {
        bookmarks = bookmarks.filter(id => id !== postId);
      } else {
        bookmarks.push(postId);
        isBookmarked = true;
      }

      await db.updateUser(user.id, { bookmarks });
      res.json({ bookmarked: isBookmarked });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/posts/:id', authenticateToken, async (req: any, res) => {
    try {
      const success = await db.deletePost(req.params.id, req.user.id);
      if (!success) {
        return res.status(403).json({ error: 'Unpermitted authorization, or post does not exist' });
      }
      res.json({ success: true, message: 'Post thread deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CHATBOT DISCUSSIONS ENDPOINT ====================

  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // ── Try AI-agents service first (RAG-powered via LangGraph + Groq) ──
      try {
        const aiResponse = await fetch(`${AI_SERVICE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: prompt }),
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          // Format the response with source attribution
          let text = aiData.answer || 'No answer generated.';

          // Append source info if available
          if (aiData.sources && aiData.sources.length > 0) {
            text += '\n\n---\n📚 **Sources:** ';
            text += aiData.sources
              .map((s: any) => `[${s.source_type}]`)
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
              .join(', ');
          }

          if (aiData.confidence !== undefined) {
            text += `\n🎯 **Confidence:** ${(aiData.confidence * 100).toFixed(0)}%`;
          }

          return res.json({ text, source: 'ai_agents', confidence: aiData.confidence });
        }
        console.warn('AI-agents service returned non-OK status:', aiResponse.status);
      } catch (aiErr: any) {
        console.warn('AI-agents service unavailable, falling back to Gemini:', aiErr.message);
      }

      // ── Fallback to Gemini if AI-agents is unavailable ──
      try {
        const client = getGeminiClient();

        const systemInstruction = `
          You are "Vicharanashala AI Advisor" - an intelligent, high-fidelity academic mentor and stipend consultant on the Vicharanashala forum.
          You possess deep academic knowledge of:
          - Literature reviews & technical proposal structures.
          - Research stipend applications, academic CGPA eligibility, and wavers.
          - Open Source contributions (GitHub, open source methodology, engineering standards).
          - Finding prospective academic mentors.
          - Drafting high-intent Statements of Purpose (SOP).

          Respond in a helpful, structured, polished academic tone. Use markdown list items, bold headings, code highlights, and concise language.
          Always align your advice with the spirit of the custom design theme of Vicharanashala (scholarly, focus-centric, developer-supportive).
          If the user provides a context about a specific forum FAQ, use that context to make your advice extremely tailored.
        `;

        const contents = context 
          ? `Forum FAQ Context: ${JSON.stringify(context)}\n\nUser Question: ${prompt}`
          : prompt;

        const response = await client.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        return res.json({ text: response.text, source: 'gemini' });
      } catch (geminiErr: any) {
        console.error('Gemini fallback also failed:', geminiErr.message);
      }

      // ── Both services unavailable ──
      res.status(503).json({ 
        error: 'Both AI services are unavailable',
        details: 'Ensure AI-agents service (port 8000) is running, or configure GEMINI_API_KEY.'
      });
    } catch (error: any) {
      console.error('Chat endpoint error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to generate response from Vicharanashala AI'
      });
    }
  });

  // ==================== AI-AGENTS PROXY ENDPOINTS ====================

  // Upload FAQ CSV to AI-agents service
  app.post('/api/ai/upload-faq', async (req: any, res) => {
    try {
      // For file uploads, we need to pipe the request directly
      const response = await fetch(`${AI_SERVICE_URL}/upload-faq`, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(
            Object.entries(req.headers)
              .filter(([k]) => k.startsWith('content-'))
          )
        },
        body: req, // pipe the raw request
        // @ts-ignore
        duplex: 'half'
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error('Upload FAQ proxy error:', error);
      res.status(502).json({ error: 'Cannot reach AI agents service' });
    }
  });

  // Upload PDF to AI-agents service
  app.post('/api/ai/upload-pdf', async (req: any, res) => {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/upload-pdf`, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(
            Object.entries(req.headers)
              .filter(([k]) => k.startsWith('content-'))
          )
        },
        body: req,
        // @ts-ignore
        duplex: 'half'
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error('Upload PDF proxy error:', error);
      res.status(502).json({ error: 'Cannot reach AI agents service' });
    }
  });

  // Get unanswered questions from AI-agents
  app.get('/api/ai/unanswered', async (req, res) => {
    try {
      const limit = req.query.limit || 50;
      const skip = req.query.skip || 0;
      const response = await fetch(`${AI_SERVICE_URL}/unanswered-questions?limit=${limit}&skip=${skip}`);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error('Unanswered proxy error:', error);
      res.status(502).json({ error: 'Cannot reach AI agents service' });
    }
  });

  // AI-agents health check
  app.get('/api/ai/health', async (req, res) => {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/health`);
      const data = await response.json();
      res.json({ frontend: 'healthy', ai_service: data, ai_service_url: AI_SERVICE_URL });
    } catch (error: any) {
      res.json({ frontend: 'healthy', ai_service: { status: 'unreachable', error: error.message }, ai_service_url: AI_SERVICE_URL });
    }
  });

  app.get('/api/health', async (req, res) => {
    let aiStatus = 'unknown';
    try {
      const aiRes = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
      if (aiRes.ok) aiStatus = 'connected';
      else aiStatus = 'error';
    } catch {
      aiStatus = 'unreachable';
    }

    res.json({ 
      status: 'ok', 
      dbActive: db.isMongoActive() ? 'mongodb_atlas' : 'local_json_db',
      aiService: aiStatus,
      aiServiceUrl: AI_SERVICE_URL,
      time: new Date().toISOString() 
    });
  });

  // Serve static assets or boot Vite dev middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vicharanashala Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
