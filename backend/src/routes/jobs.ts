import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { searchJobs, extractKeywordsFromResume } from '../utils/jobsApi';
import { chatCompletion } from '../utils/openai';
import rateLimit from 'express-rate-limit';

const router = Router();

const jobsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req: any) => req.userId || req.ip,
});

// POST /api/jobs/recommend
router.post('/recommend', requireAuth, jobsRateLimit, async (req: AuthRequest, res) => {
  try {
    const { resumeText, location, jobTitle, skills } = req.body;

    if (!resumeText && !jobTitle && !skills?.length) {
      return res.status(400).json({
        error: 'Provide at least one of: resumeText, jobTitle, or skills',
      });
    }

    // Build keyword list — job title first (highest priority), then resume keywords
    let keywords: string[] = [];
    if (jobTitle) keywords.push(jobTitle);
    if (resumeText) {
      const resumeKeywords = extractKeywordsFromResume(resumeText);
      keywords = [...new Set([...keywords, ...resumeKeywords])];
    }
    if (skills?.length) {
      keywords = [...new Set([...keywords, ...skills])];
    }
    if (keywords.length === 0) keywords = ['software engineer'];

    console.log(`🔍 Searching with ${keywords.length} keywords: ${keywords.slice(0, 5).join(', ')}`);

    // searchJobs never throws — it returns { jobs, error? }
    const { jobs, error: apiError } = await searchJobs({
      keywords,
      location: location || 'india',
      maxResults: 15,
      maxDaysOld: 60,
    });

    // Always 200 — client decides how to display
    res.json({
      jobs,
      searchKeywords: keywords.slice(0, 5),
      totalFound: jobs.length,
      note: apiError
        ? apiError
        : jobs.length === 0
          ? 'No jobs found for these keywords. Try a simpler title like "Software Engineer" or change location.'
          : `Found ${jobs.length} active jobs`,
    });
  } catch (err: any) {
    // Catch unexpected errors (e.g. keyword extraction crash) — still no 500 for Adzuna
    console.error('Job recommendations unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
});

// POST /api/jobs/match-score
router.post('/match-score', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { resumeText, jobTitle, jobDescription, company } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description required' });
    }

    const systemPrompt = `You are an ATS system. Return ONLY valid JSON, no extra text.`;

    const userPrompt = `
Score how well this resume matches the job.

RESUME (excerpt):
${resumeText.substring(0, 1500)}

JOB: ${jobTitle} at ${company}
DESCRIPTION: ${jobDescription.substring(0, 1000)}

Return this EXACT JSON:
{
  "matchScore": 78,
  "verdict": "Strong Match" | "Good Match" | "Partial Match" | "Weak Match",
  "topMatchingSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["skill1", "skill2"],
  "recommendation": "One sentence on whether to apply and what to improve"
}`;

    const result = await chatCompletion(systemPrompt, userPrompt, 500);
    const clean = result.replace(/```json|```/g, '').trim();
    const matchData = JSON.parse(clean);

    res.json(matchData);
  } catch (err: any) {
    console.error('Match score error:', err);
    res.status(500).json({ error: 'Failed to calculate match score' });
  }
});

export default router;
