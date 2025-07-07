import express from "express";
import User from "../models/jobSeeker.js";

const router = express.Router();

// ------------------------------
// ✅ POST /api/auth/users/update-profile
// ------------------------------
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    console.log('Incoming update request:', req.body);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      profileData,
      { new: true }
    );

    console.log('Updated user from DB:', updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

export default router;
