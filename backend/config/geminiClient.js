import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const result = await model.embedContent({
    content: {
      parts: [
        { text }
      ]
    }
  });

  return result.embedding.values;
}

export default genAI;
