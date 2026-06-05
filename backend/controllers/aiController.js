const FAQ = require("../models/FAQ");

const askAI = async (req, res) => {
    try {
        const { question } = req.body;

        const faq = await FAQ.findOne({
            question: {
                $regex: question,
                $options: "i"
            }
        });

        if (faq) {
            return res.json({
                source: "faq",
                answer: faq.answer
            });
        }

        return res.json({
            source: "llm",
            answer: "LLM integration pending"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = { askAI };