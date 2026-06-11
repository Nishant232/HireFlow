import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import Application from '../models/Application';
import { z } from 'zod';

const router = Router();

// Validation schema
const ApplicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().optional().default(''),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
  status: z
    .enum(['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'])
    .optional(),
  appliedDate: z.string().optional(),
  salary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  jobUrl: z.string().optional().default(''),
  jobDescription: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  resumeVersion: z.string().optional().default(''),
  contactName: z.string().optional().default(''),
  contactEmail: z.string().optional().default(''),
  followUpDate: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

// GET all applications for user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req;
    const { search, status, jobType, sort = '-appliedDate' } = req.query;

    const query: any = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (jobType && jobType !== 'all') {
      query.jobType = jobType;
    }

    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const applications = await Application.find(query)
      .sort(sort as string)
      .lean();

    res.json({ applications, total: applications.length });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET single application
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const app = await Application.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!app) return res.status(404).json({ error: 'Application not found' });

    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// POST create application
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = ApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const app = await Application.create({
      ...parsed.data,
      userId: req.userId,
      appliedDate: parsed.data.appliedDate
        ? new Date(parsed.data.appliedDate)
        : new Date(),
    });

    res.status(201).json({ application: app });
  } catch (err) {
    console.error('Error creating application:', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PATCH update application
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!app) return res.status(404).json({ error: 'Application not found' });

    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE application
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!app) return res.status(404).json({ error: 'Application not found' });

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// PATCH bulk status update
router.patch('/bulk/status', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { ids, status } = req.body;

    await Application.updateMany(
      { _id: { $in: ids }, userId: req.userId },
      { $set: { status } }
    );

    res.json({ message: 'Status updated for all selected applications' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

export default router;
