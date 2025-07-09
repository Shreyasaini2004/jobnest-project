const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const requireAuth = require('../middleware/auth');

// Middleware: require employer role
function requireEmployer(req, res, next) {
  if (!req.user || req.user.role !== 'employer') {
    return res.status(403).json({ error: 'Employer access required' });
  }
  next();
}
// Middleware: require event creator
async function requireEventCreator(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only modify your own events' });
    }
    req.event = event;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get events created by the logged-in employer
router.get('/mine', requireAuth, requireEmployer, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your events' });
  }
});

// Create a new event (employer only)
router.post('/', requireAuth, requireEmployer, async (req, res) => {
  try {
    const { title, date, type, description, meetingLink } = req.body;
    const event = new Event({
      title,
      date,
      type,
      description,
      meetingLink,
      createdBy: req.user._id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

// Update an event (only creator)
router.put('/:id', requireAuth, requireEmployer, requireEventCreator, async (req, res) => {
  try {
    Object.assign(req.event, req.body);
    await req.event.save();
    res.json(req.event);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// Delete an event (only creator)
router.delete('/:id', requireAuth, requireEmployer, requireEventCreator, async (req, res) => {
  try {
    await req.event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete event' });
  }
});

module.exports = router; 