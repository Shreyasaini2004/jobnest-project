import { generateEmbedding, validateEmbeddableText } from "../config/geminiClient.js";

router.post("/create", async (req, res) => {
  try {
    const { jobTitle, description } = req.body;

    if (!jobTitle || !description) {
      return res.status(400).json({ error: "jobTitle and description are required" });
    }

    const textToEmbed = `${jobTitle} ${description}`.trim();

    if (!validateEmbeddableText(textToEmbed)) {
      return res.status(400).json({
        error: "Please enter a more complete, descriptive text. It should be at least 30 characters and 6+ words for meaningful semantic embedding."
      });
    }

    const embedding = await generateEmbedding(textToEmbed);

    const newJob = new Job({
      ...req.body,
      embedding,
    });

    const savedJob = await newJob.save();

    res.status(201).json(savedJob);
  } catch (err) {
    console.error("❌ Error creating job:", err);
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});
