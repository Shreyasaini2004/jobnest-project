// backend/controllers/userController.js

import User from '../models/User.js';

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, profileData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
};
