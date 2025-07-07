import express from "express";
import User from "../models/jobSeeker.js";
import { generateEmbedding } from "../config/geminiClient.js";

const router = express.Router();

// ------------------------------
// ✅ POST /api/auth/users/update-profile
// ------------------------------
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, bio, education, experience, skills, ...otherFields } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    console.log('Incoming update request:', req.body);

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine if embedding needs to be regenerated
    let embedding = existingUser.embedding;
    const combinedText = `${bio ?? ""} ${education ?? ""} ${experience ?? ""} ${skills ?? ""}`.trim();

    const combinedOldText = `${existingUser.bio ?? ""} ${existingUser.education ?? ""} ${existingUser.experience ?? ""} ${existingUser.skills ?? ""}`.trim();

    if (combinedText !== combinedOldText && combinedText.length > 0) {
      embedding = await generateEmbedding(combinedText);
      console.log('✅ Embedding regenerated');
    } else {
      console.log('✅ No changes to embedding fields - keeping existing embedding');
    }

    // Construct update object
    const updateData = {
      ...otherFields,
      bio,
      education,
      experience,
      skills,
      embedding
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    console.log('Updated user from DB:', updatedUser);

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

export default router;
