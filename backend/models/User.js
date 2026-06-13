const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["student", "staff", "admin"],
            default: "student",
        },

        avatar: {
            type: String,
            default: "",
        },

        title: {
            type: String,
            default: "Undergraduate Scholar",
        },

        bio: {
            type: String,
            default: "",
        },

        bookmarks: [{
            type: String,
        }],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);