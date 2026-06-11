import { Router, Response } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { parseResume } from '../utils/resumeParser';
import { verifyAllUrls, getVerificationSummary } from '../utils/urlVerifier';
import { chatCompletion, FREE_MODELS, extractJSON } from '../utils/openai';
import rateLimit from 'express-rate-limit';

const router = Router();

// Memory storage — we don't store files on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '5')) * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// Aligned with OpenRouter free tier limits
const resumeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  keyGenerator: (req: any) => req.userId || req.ip,
  message: 'Too many resume operations. Please wait a moment.',
});

// POST /api/resume/upload
router.post(
  '/upload',
  requireAuth,
  upload.single('resume'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log(`📄 Parsing ${req.file.originalname} (${req.file.mimetype})`);

      const parsed = await parseResume(req.file.buffer, req.file.mimetype);

      let urlVerification = null;
      if (parsed.urls.length > 0) {
        console.log(`🔗 Verifying ${parsed.urls.length} URLs...`);
        const verifiedUrls = await verifyAllUrls(parsed.urls, 3);
        urlVerification = {
          urls: verifiedUrls,
          summary: getVerificationSummary(verifiedUrls),
        };
      }

      res.json({
        success: true,
        resume: {
          text: parsed.text,
          sections: parsed.sections,
          wordCount: parsed.wordCount,
          fileType: parsed.fileType,
          fileName: req.file.originalname,
        },
        urlVerification,
      });
    } catch (err: any) {
      console.error('Resume parse error:', err);
      res.status(400).json({ error: err.message || 'Failed to parse resume' });
    }
  }
);

// POST /api/resume/optimize
router.post('/optimize', requireAuth, resumeRateLimit, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText, jobDescription, targetRole, targetCompany } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description are required' });
    }

    const systemPrompt = `You are an expert ATS optimization specialist and resume writer.
Analyze the resume and job description, then return a comprehensive optimization report.
Return ONLY valid JSON, no markdown, no extra text.`;

    const userPrompt = `
TARGET ROLE: ${targetRole || 'Not specified'}
TARGET COMPANY: ${targetCompany || 'Not specified'}

=== RESUME ===
${resumeText.substring(0, 3000)}

=== JOB DESCRIPTION ===
${jobDescription.substring(0, 2000)}

Return this EXACT JSON structure:
{
  "atsScore": 72,
  "matchPercentage": 68,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "presentKeywords": ["keyword1", "keyword2"],
  "optimizedSummary": "A rewritten professional summary tailored to this JD",
  "optimizedBullets": [
    "Bullet point 1 using JD keywords and strong action verbs with metrics",
    "Bullet point 2...",
    "Bullet point 3...",
    "Bullet point 4...",
    "Bullet point 5...",
    "Bullet point 6..."
  ],
  "skillsToAdd": ["skill1", "skill2", "skill3"],
  "skillsToHighlight": ["skill1", "skill2"],
  "weaknesses": ["weakness1", "weakness2"],
  "strengths": ["strength1", "strength2"],
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ]
}`;

    const result = await chatCompletion(systemPrompt, userPrompt, 1800, FREE_MODELS.primary);
    // Robust JSON extraction — handles markdown fences and model preamble text
    const optimization = JSON.parse(extractJSON(result));

    res.json({ optimization });
  } catch (err: any) {
    console.error('Optimization error:', err);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// POST /api/resume/verify-urls
router.post('/verify-urls', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    if (urls.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 URLs per request' });
    }

    const verifiedUrls = await verifyAllUrls(urls, 4);
    const summary = getVerificationSummary(verifiedUrls);

    res.json({ urls: verifiedUrls, summary });
  } catch (err: any) {
    res.status(500).json({ error: 'URL verification failed' });
  }
});

// POST /api/resume/generate-pdf
router.post('/generate-pdf', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeData } = req.body;

    console.log('📄 PDF generation request received');
    console.log('   Fields:', Object.keys(resumeData || {}));

    if (!resumeData?.name) {
      return res.status(400).json({ error: 'Resume data with name is required' });
    }

    // pdfmake VFS approach — works correctly in Node.js
    // The 'pdfmake/build/vfs_fonts' module exports the virtual file system
    // containing base64-encoded Roboto fonts bundled with pdfmake.
    const pdfMake = require('pdfmake/build/pdfmake');
    const pdfFonts = require('pdfmake/build/vfs_fonts');
    pdfMake.vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs;

    const { buildResumeDocDefinition } = await import('../utils/pdfGenerator');
    const docDefinition = buildResumeDocDefinition(resumeData);

    console.log('   Building PDF document...');
    const pdfDoc = pdfMake.createPdf(docDefinition);

    // getBuffer works in Node.js — returns the PDF as a Buffer
    pdfDoc.getBuffer((buffer: Buffer) => {
      const safeName = resumeData.name.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_Resume.pdf"`);
      res.setHeader('Content-Length', buffer.length);
      console.log(`   ✅ PDF generated successfully (${buffer.length} bytes)`);
      res.end(buffer);
    });

  } catch (err: any) {
    console.error('❌ PDF generation error:', err?.message || err);
    console.error('   Stack:', err?.stack);
    res.status(500).json({ error: err?.message || 'Failed to generate PDF' });
  }
});

export default router;
