import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { chatCompletion, FREE_MODELS, extractJSON } from '../utils/openai';
import Application from '../models/Application';
import rateLimit from 'express-rate-limit';

const router = Router();

// OpenRouter free tier: 20 requests/minute, 200 requests/day
// We apply our own rate limit to stay within bounds
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window (matches OpenRouter limit)
  max: 15,             // 15 per minute (buffer under 20 limit)
  message: 'Too many AI requests. The free tier allows 20 requests/minute. Please wait.',
  keyGenerator: (req: any) => req.userId || req.ip,
});

// POST: Tailor resume bullets for a job description
router.post('/tailor-resume', requireAuth, aiRateLimit, async (req: AuthRequest, res) => {
  try {
    const { jobDescription, currentBullets, role, company } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const systemPrompt = `You are an expert resume writer and career coach specializing in ATS optimization.
Your task is to tailor resume bullet points to match a specific job description.
Always output ONLY a JSON array of strings. No extra text, no markdown, no explanations.
Format: ["bullet 1", "bullet 2", "bullet 3", ...]`;

    const userPrompt = `Role: ${role} at ${company}

Job Description:
${jobDescription}

${currentBullets ? `Current Resume Bullets:\n${currentBullets}` : ''}

Generate 6-8 powerful, ATS-optimized resume bullet points that:
1. Use strong action verbs (Built, Engineered, Reduced, Increased, Led, Designed)
2. Include specific metrics where possible (%, numbers, scale)
3. Match keywords from the job description exactly
4. Highlight technical skills mentioned in the JD
5. Are concise (1-2 lines each)

Return ONLY a JSON array of strings.`;

    const result = await chatCompletion(systemPrompt, userPrompt, 1200, FREE_MODELS.primary);

    // Parse JSON — robust extraction handles markdown fences and preamble text
    const bullets = JSON.parse(extractJSON(result));

    // Save to application if applicationId provided
    if (req.body.applicationId) {
      await Application.findOneAndUpdate(
        { _id: req.body.applicationId, userId: req.userId },
        {
          $set: {
            'aiInsights.resumeBullets': bullets,
            'aiInsights.generatedAt': new Date(),
          },
        }
      );
    }

    res.json({ bullets });
  } catch (err) {
    console.error('Resume tailor error:', err);
    res.status(500).json({ error: 'Failed to generate resume bullets' });
  }
});

// POST: Generate interview questions and company research
router.post('/interview-prep', requireAuth, aiRateLimit, async (req: AuthRequest, res) => {
  try {
    const { company, role, jobDescription } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'Company and role are required' });
    }

    const systemPrompt = `You are a senior technical interviewer and career coach.
Output ONLY valid JSON. No markdown, no extra text.`;

    const userPrompt = `Company: ${company}
Role: ${role}
${jobDescription ? `Job Description:\n${jobDescription}` : ''}

Generate comprehensive interview preparation in this EXACT JSON format:
{
  "technicalQuestions": ["question1", "question2", "question3", "question4", "question5"],
  "behavioralQuestions": ["question1", "question2", "question3", "question4"],
  "questionsToAsk": ["question1", "question2", "question3"],
  "companyResearch": "3-4 sentences about the company, their products, tech stack, and recent news",
  "tips": ["tip1", "tip2", "tip3", "tip4"]
}`;

    const result = await chatCompletion(systemPrompt, userPrompt, 1500, FREE_MODELS.reasoning);
    const prepData = JSON.parse(extractJSON(result));

    // Save to application if applicationId provided
    if (req.body.applicationId) {
      await Application.findOneAndUpdate(
        { _id: req.body.applicationId, userId: req.userId },
        {
          $set: {
            'aiInsights.interviewQuestions': [
              ...prepData.technicalQuestions,
              ...prepData.behavioralQuestions,
            ],
            'aiInsights.companyResearch': prepData.companyResearch,
            'aiInsights.generatedAt': new Date(),
          },
        }
      );
    }

    res.json(prepData);
  } catch (err) {
    console.error('Interview prep error:', err);
    res.status(500).json({ error: 'Failed to generate interview prep' });
  }
});

// POST: Generate cover letter
router.post('/cover-letter', requireAuth, aiRateLimit, async (req: AuthRequest, res) => {
  try {
    const { company, role, jobDescription, candidateName, highlights } = req.body;

    if (!company || !role || !jobDescription) {
      return res.status(400).json({ error: 'Company, role, and job description are required' });
    }

    const systemPrompt = `You are a professional cover letter writer.
Write compelling, personalized cover letters that get interviews.
Be specific, confident, and concise. Never generic.`;

    const userPrompt = `Write a professional cover letter for:

Candidate: ${candidateName || 'the applicant'}
Role: ${role}
Company: ${company}
${highlights ? `Key Highlights: ${highlights}` : ''}

Job Description:
${jobDescription}

Requirements:
- 3 paragraphs maximum
- Opening: Hook with specific reason for interest in THIS company
- Middle: 2-3 specific achievements with metrics that match the JD requirements
- Closing: Strong call to action
- Professional but personable tone
- 250-300 words total
- Do NOT use generic phrases like "I am writing to express my interest"`;

    const coverLetter = await chatCompletion(systemPrompt, userPrompt, 800, FREE_MODELS.primary);

    // Save to application if applicationId provided
    if (req.body.applicationId) {
      await Application.findOneAndUpdate(
        { _id: req.body.applicationId, userId: req.userId },
        {
          $set: {
            'aiInsights.coverLetter': coverLetter,
            'aiInsights.generatedAt': new Date(),
          },
        }
      );
    }

    res.json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

export default router;
