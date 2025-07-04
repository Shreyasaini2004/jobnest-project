const express = require('express');
const router = express.Router(); // ✅ This line was missing!
const User = require('../models/jobSeeker'); // ✅ Correct

// POST /api/auth/users/update-profile
router.post('/update-profile', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    console.log('Incoming update request:', req.body); // ✅ Log what frontend is sending

    const updatedUser = await User.findByIdAndUpdate(userId, profileData, { new: true });

    console.log('Updated user from DB:', updatedUser); // ✅ Log what DB returns


    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router; // ✅ export the router
