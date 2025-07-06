const mongoose = require('mongoose');

const SavedAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  resumeFileName: String,
  jobDescription: String,
  score: Number,
  keywordMatches: [String],
  missingKeywords: [String],
  suggestions: [String]
});

module.exports = mongoose.model('SavedAnalysis', SavedAnalysisSchema); 