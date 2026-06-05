const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
const app = express();
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Post routes
const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

// Answer routes
const answerRoutes = require("./routes/answerRoutes");
app.use("/api", answerRoutes);

// FAQ routes
const faqRoutes = require("./routes/faqRoutes");
app.use("/api/faqs", faqRoutes);

// AI routes
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);

// Protected route example
const protect = require("./middleware/authMiddleware");
app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "Protected route accessed",
        user: req.user
    });
});


