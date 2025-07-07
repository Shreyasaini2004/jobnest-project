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

interface ResumeImprovementResult {
  improvedResume?: string; // Optional since we're focusing on recommendations
  summary: string;
  keyImprovements: string[];
  atsScoreImpact: string;
}

// Helper function to extract personal information from resume
const extractPersonalInfo = (resumeText: string) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+\d{1,3}[- ]?)?\d{10}/g;
  const nameMatch = resumeText.match(/^[A-Z][a-z]+(?: [A-Z][a-z]+)+/m);
  const emailMatch = resumeText.match(emailRegex);
  const phoneMatch = resumeText.match(phoneRegex);
  
  return {
    name: nameMatch ? nameMatch[0] : '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : ''
  };
};

export const improveResumeWithGemini = async (
  originalResume: string,
  jobDescription: string,
  currentATSFeedback: string[]
): Promise<ResumeImprovementResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const prompt = `
    You are an expert resume writer and ATS optimization specialist. Your task is to analyze the following resume and provide specific, actionable recommendations to improve its ATS compatibility and alignment with the target job description.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    CURRENT ATS FEEDBACK:
    ${currentATSFeedback.join('\n')}
    
    RESUME TO ANALYZE:
    ${originalResume}
    
    TASKS:
    1. Analyze the resume's alignment with the job description
    2. Identify missing keywords and skills from the job description
    3. Suggest specific improvements to enhance ATS compatibility
    4. Provide actionable recommendations for each section of the resume
    5. Highlight areas where quantifiable achievements could be added
    6. Suggest better action verbs and professional language
    
    RESPONSE FORMAT (as JSON):
    {
      "summary": "A concise summary of the overall assessment and key areas for improvement",
      "keyImprovements": [
        "Specific, actionable recommendation 1",
        "Specific, actionable recommendation 2"
      ],
      "atsScoreImpact": "Explanation of how implementing these changes would improve the ATS score"
    }
    
    IMPORTANT: 
    - The response must be valid JSON
    - Escape any double quotes within strings with a backslash (\")
    - Do not include any markdown code blocks or backticks
    - Keep the response as a single, valid JSON object
    - Focus on specific, actionable recommendations rather than rewriting the resume
    - Do not include the original resume content in the response
    - Preserve all original personal information and formatting
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
    
    // Try to parse the response
    let parsedResponse: Partial<ResumeImprovementResult>;
    
    try {
      // First try to parse as JSON directly
      parsedResponse = JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // If we can't parse as JSON, try to extract the content we need
        parsedResponse = {
          summary: 'Analysis complete. See recommendations below.',
          keyImprovements: [
            'Ensure your resume includes relevant keywords from the job description',
            'Add quantifiable achievements to your work experience',
            'Use action verbs to start each bullet point',
            'Include a skills section with relevant technical and soft skills'
          ],
          atsScoreImpact: 'Implementing these recommendations should improve your resume\'s ATS compatibility.'
        };
      }
    }
    
    // Ensure all required fields exist with proper typing
    const defaultResponse: ResumeImprovementResult = {
      summary: parsedResponse.summary || 'Analysis complete. See recommendations below.',
      keyImprovements: Array.isArray(parsedResponse.keyImprovements) 
        ? parsedResponse.keyImprovements 
        : ['General improvements made'],
      atsScoreImpact: typeof parsedResponse.atsScoreImpact === 'string'
        ? parsedResponse.atsScoreImpact
        : 'Implementing these recommendations should improve your resume\'s ATS compatibility.'
    };
    
    return defaultResponse;
    
  } catch (error) {
    console.error('Error generating resume recommendations with Gemini:', error);
    
    // Return a helpful default response in case of errors
    return {
      summary: 'We encountered an issue analyzing your resume, but here are some general tips:',
      keyImprovements: [
        'Ensure your resume includes relevant keywords from the job description',
        'Add quantifiable achievements to your work experience',
        'Use action verbs to start each bullet point',
        'Include a skills section with relevant technical and soft skills'
      ],
      atsScoreImpact: 'Implementing these recommendations should improve your resume\'s ATS compatibility.'
    };
  }
};
