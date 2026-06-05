const Post = require("../models/Post");

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        const post = await Post.create({
            title,
            description,
            category,
            author: req.user.id
        });

        res.status(201).json(post);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get all posts
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get a single post by ID
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name email");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.status(200).json(post);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { 
    createPost,
    getPosts,
    getPostById
};