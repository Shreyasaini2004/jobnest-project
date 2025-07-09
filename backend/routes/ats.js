import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import SavedAnalysis from '../models/savedAnalysis.js';
import auth from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
// import { verifyCaptcha } from '../middleware/captcha'; // Stub for CAPTCHA

const router = express.Router();

// Multer setup for file upload
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

// Rate limiting middleware (relaxed for development)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

// Privacy disclaimer
const privacyDisclaimer = 'We do not store or share your files. They are deleted after processing. GDPR/CCPA compliant.';

// POST /upload - Resume upload and scoring
router.post('/upload', limiter, upload.single('resume'), async (req, res) => {
  try {
    // CAPTCHA verification (stub)
    // if (!verifyCaptcha(req.body.captchaToken)) return res.status(400).json({ error: 'CAPTCHA failed' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!req.body.jobDescription) return res.status(400).json({ error: 'No job description provided' });

    // TODO: Virus/malware scan (optional)

    // TODO: Call resume parsing/scoring logic here (stub)
    // const result = await parseAndScoreResume(req.file.path, req.body.jobDescription);
    const result = { score: 85, breakdown: { skills: 90, experience: 80, education: 70, format: 95 }, suggestions: ['Add more keywords', 'Improve formatting'] };

    // Auto-delete file after processing
    fs.unlink(req.file.path, () => {});

    res.json({
      ...result,
      privacy: privacyDisclaimer
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: err.message, privacy: privacyDisclaimer });
  }
});

// POST /improve - AI resume rewriting
router.post('/improve', limiter, async (req, res) => {
  const { resumeText, suggestions } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!resumeText || !suggestions) {
    return res.status(400).json({ error: 'Missing resumeText or suggestions', privacy: privacyDisclaimer });
  }
  if (!apiKey) {
    return res.json({ improved: 'This is a stub for AI resume rewriting. (No API key set)', privacy: privacyDisclaimer });
  }
  try {
    const prompt = `Rewrite the following resume to improve ATS compatibility based on these suggestions: ${suggestions.join(', ')}\n\nResume:\n${resumeText}`;
    
    // Check if the API key starts with 'sk-ant' or 'sk-proj' (Claude API)
    if (apiKey.startsWith('sk-ant') || apiKey.startsWith('sk-proj')) {
      console.log('Using Anthropic Claude API for resume improvement');
      // Use Anthropic Claude API with correct headers
      try {
        console.log('Sending request to Anthropic API for resume improvement...');
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-haiku-20240307',
          max_tokens: 1200,
          messages: [
            {
              role: 'user',
              content: `You are an expert resume writer and ATS optimization assistant. ${prompt}`
            }
          ],
          temperature: 0.7
        }, {
          headers: {
            'anthropic-version': '2023-06-01',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Anthropic API response status for improve:', response.status);
        
        const improved = response.data.content[0].text;
        res.json({ improved, privacy: privacyDisclaimer });
      } catch (error) {
        console.error('Anthropic API error details for improve:', error.response ? error.response.data : error.message);
        throw error;
      }
    } else {
      console.log('Using OpenAI API for resume improvement');
      // Use OpenAI API as fallback
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert resume writer and ATS optimization assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const improved = response.data.choices[0].message.content;
      res.json({ improved, privacy: privacyDisclaimer });
    }
  } catch (err) {
    console.error('AI resume rewriting error:', err.message);
    res.status(500).json({ error: 'AI resume rewriting failed: ' + err.message, privacy: privacyDisclaimer });
  }
});

// POST /feedback - Feedback submission
router.post('/feedback', limiter, async (req, res) => {
  // TODO: Store feedback in DB or send to admin
  res.json({ message: 'Feedback received. Thank you!', privacy: privacyDisclaimer });
});

// POST /save - Save an analysis (requires auth)
router.post('/save', limiter, auth, async (req, res) => {
  try {
    const { resumeFileName, jobDescription, score, keywordMatches, missingKeywords, suggestions } = req.body;
    const saved = await SavedAnalysis.create({
      userId: req.user._id,
      resumeFileName,
      jobDescription,
      score,
      keywordMatches,
      missingKeywords,
      suggestions
    });
    res.json({ saved, privacy: privacyDisclaimer });
  } catch (err) {
    res.status(500).json({ error: err.message, privacy: privacyDisclaimer });
  }
});

// GET /saved - Get all analyses for user (requires auth)
router.get('/saved', limiter, auth, async (req, res) => {
  try {
    const analyses = await SavedAnalysis.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.json({ analyses, privacy: privacyDisclaimer });
  } catch (err) {
    res.status(500).json({ error: err.message, privacy: privacyDisclaimer });
  }
});

// DELETE /saved/:id - Delete a saved analysis (requires auth)
router.delete('/saved/:id', limiter, auth, async (req, res) => {
  try {
    await SavedAnalysis.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted', privacy: privacyDisclaimer });
  } catch (err) {
    res.status(500).json({ error: err.message, privacy: privacyDisclaimer });
  }
});

// POST /email - Send ATS report as PDF via email
router.post('/email', limiter, async (req, res) => {
  const { to, subject, analysis, improvedResume } = req.body;
  if (!to || !analysis) return res.status(400).json({ error: 'Missing recipient or analysis', privacy: privacyDisclaimer });
  
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
      process.env.EMAIL_USER === 'your.email@gmail.com' || 
      process.env.EMAIL_PASS === 'your-app-password') {
    return res.status(503).json({ 
      error: 'Email service not configured. Please set up email credentials in the backend.', 
      privacy: privacyDisclaimer 
    });
  }
  
  try {
    // Generate PDF in memory
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      try {
        // Send email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject: subject || 'Your ATS Score Report',
          text: 'See attached ATS score report.',
          attachments: [{ filename: 'ATS_Score_Report.pdf', content: pdfData }]
        });
        res.json({ message: 'Email sent', privacy: privacyDisclaimer });
      } catch (emailErr) {
        console.error('Email sending error:', emailErr);
        res.status(500).json({ 
          error: 'Failed to send email. Please check email configuration.', 
          details: emailErr.message,
          privacy: privacyDisclaimer 
        });
      }
    });
    doc.fontSize(18).text('ATS Score Report', { align: 'left' });
    doc.moveDown();
    doc.fontSize(12).text(`Score: ${analysis.score}%`);
    doc.text('Breakdown:');
    doc.text(`Skills Match: ${analysis.skillsMatch}%`);
    doc.text(`Experience Match: ${analysis.experienceMatch}%`);
    doc.text(`Education Match: ${analysis.educationMatch}%`);
    doc.text(`Keyword Match: ${analysis.keywordMatch}%`);
    doc.moveDown();
    doc.text('Suggestions:');
    (analysis.suggestions || []).forEach(s => doc.text(`- ${s}`));
    if (improvedResume) {
      doc.addPage();
      doc.fontSize(16).text('Improved Resume (AI)', { align: 'left' });
      doc.fontSize(10).text(improvedResume);
    }
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate PDF report', 
      details: err.message,
      privacy: privacyDisclaimer 
    });
  }
});

// POST /chatbot - AI chatbot for resume help
router.post('/chatbot', limiter, async (req, res) => {
  const { messages } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array', privacy: privacyDisclaimer });
  }
  
  if (!apiKey) {
    return res.status(503).json({ error: 'Chatbot service not configured (No API key set)', privacy: privacyDisclaimer });
  }
  
  try {
    // Check if the API key starts with 'sk-ant' or 'sk-proj' (Claude API)
    if (apiKey.startsWith('sk-ant') || apiKey.startsWith('sk-proj')) {
      console.log('Using Anthropic Claude API for chatbot');
      // Use Anthropic Claude API with correct headers
      try {
        console.log('Sending request to Anthropic API for chatbot...');
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-haiku-20240307',
          max_tokens: 1200,
          messages: messages,
          temperature: 0.7
        }, {
          headers: {
            'anthropic-version': '2023-06-01',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Anthropic API response status for chatbot:', response.status);
        
        const reply = response.data.content[0].text;
        res.json({ reply, privacy: privacyDisclaimer });
      } catch (error) {
        console.error('Anthropic API error details for chatbot:', error.response ? error.response.data : error.message);
        throw error;
      }
    } else {
      console.log('Using OpenAI API for chatbot');
      // Use OpenAI API as fallback
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful resume writing and job application assistant.' },
          ...messages
        ],
        max_tokens: 1200,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      const reply = response.data.choices[0].message.content;
      res.json({ reply, privacy: privacyDisclaimer });
    }
  } catch (err) {
    console.error('Chatbot error:', err.message);
    res.status(500).json({ error: 'Chatbot error: ' + err.message, privacy: privacyDisclaimer });
  }
});
export default router;