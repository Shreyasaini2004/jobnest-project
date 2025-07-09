import express from "express";
import { sendWelcomeEmail } from "../services/emailService.js";

const router = express.Router();

// Test email endpoint (POST)
router.post("/test-email", async (req, res) => {
  try {
    await sendWelcomeEmail("tsinghal_be22@thapar.edu", "Test User");
    
    res.json({ message: "Test email sent to tsinhgal_be22@thapar.edu successfully!" });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ error: "Email test failed", details: error.message });
  }
});

// Test email endpoint (GET) - for easy browser testing
router.get("/test-email", async (req, res) => {
  try {
    await sendWelcomeEmail("tsinghal_be22@thapar.edu", "Test User");
    
    res.json({ message: "Test email sent to tsinghal_be22@thapar.edu successfully!" });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ error: "Email test failed", details: error.message });
  }
});

export default router;