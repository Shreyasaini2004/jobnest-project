import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface JobDetails {
  department: string;
  description: string;
  requirements: string;
  benefits: string;
}

// Helper function to clean and parse JSON string
const parseJsonSafely = (jsonString: string): JobDetails | null => {
  try {
    // First, try to parse directly
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      // If direct parse fails, try to clean the string
      const cleaned = jsonString
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\n\r]+/g, ' ')
        .replace(/[^\x20-\x7E\n\r]/g, '');
      
      // Try to find JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  }
};

export const generateJobDetails = async (jobTitle: string, jobType: string): Promise<JobDetails> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
    You are an expert job description writer. 
    
    Generate comprehensive job details for the position of "${jobTitle}" (${jobType} position).
    
    IMPORTANT: Your response MUST be a valid JSON object with the following structure:
    
    {
      "department": "The most relevant department for this job (e.g., 'Engineering', 'Marketing')",
      "description": "A detailed job description (3-5 paragraphs) including key responsibilities and what makes this role exciting. Use markdown formatting for paragraphs.",
      "requirements": "A markdown bulleted list of qualifications, skills, and experience required (5-8 items). Start each item with '- '.",
      "benefits": "A markdown bulleted list of benefits and perks (5-8 items). Start each item with '- '."
    }
    
    Guidelines:
    - Use double quotes for all strings
    - Escape any double quotes within strings with a backslash (\")
    - Do not include any markdown code blocks or backticks in the response
    - Keep the response as a single, valid JSON object
    - The content should be professional, engaging, and tailored to the job title and type
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI Response:', text); // For debugging
    
    // Try to parse the response
    const jobDetails = parseJsonSafely(text);
    
    if (!jobDetails) {
      console.error('Failed to parse AI response. Raw response:', text);
      throw new Error('The AI response could not be processed. Please try again.');
    }
    
    // Ensure all required fields exist
    const defaultResponse: JobDetails = {
      department: jobDetails.department || 'General',
      description: jobDetails.description || 'No description generated.',
      requirements: jobDetails.requirements || '- No specific requirements provided',
      benefits: jobDetails.benefits || '- Competitive salary\n- Health benefits\n- Flexible work schedule'
    };
    
    return defaultResponse;
    
  } catch (error) {
    console.error('Error generating job details:', error);
    throw new Error('Failed to generate job details. Please try again.');
  }
};
