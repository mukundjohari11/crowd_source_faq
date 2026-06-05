const express = require("express");
const router = express.Router();

const { 
    createPost,
    getPosts,
    getPostById
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", protect, createPost);

module.exports = router;