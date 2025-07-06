import express from "express";
import { generateEmbedding } from "../config/geminiClient.js";

const router = express.Router();

/**
 * POST /api/embedding/embed
 * Generate semantic embedding for provided text
 */
router.post('/embed', async (req, res) => {
  try {
    let { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "No valid text provided for embedding" });
    }

    text = text.trim();

    // Call our embedding generator
    const embedding = await generateEmbedding(text);

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding generated");
    }

    res.status(200).json({ embedding });
  } catch (err) {
    console.error('❌ Error generating embedding:', err);
    res.status(500).json({ error: 'Failed to create embedding', details: err.message });
  }
});

export default router;
