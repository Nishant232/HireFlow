import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import Application from '../models/Application';

const router = Router();

// GET dashboard stats
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req;

    // Aggregate all stats in one query
    const [statusCounts, monthlyData, jobTypeBreakdown, recentApps] = await Promise.all([
      // Count by status
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Applications per month (last 6 months)
      Application.aggregate([
        {
          $match: {
            userId,
            appliedDate: {
              $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$appliedDate' },
              month: { $month: '$appliedDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Job type breakdown
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: '$jobType', count: { $sum: 1 } } },
      ]),

      // 5 most recent applications
      Application.find({ userId })
        .sort({ appliedDate: -1 })
        .limit(5)
        .select('company role status appliedDate')
        .lean(),
    ]);

    // Format status counts
    const statusMap: Record<string, number> = {
      wishlist: 0, applied: 0, screening: 0,
      interview: 0, offer: 0, rejected: 0, withdrawn: 0,
    };
    statusCounts.forEach(({ _id, count }) => {
      if (_id) statusMap[_id] = count;
    });

    const totalApplications = Object.values(statusMap).reduce((a, b) => a + b, 0);

    // Response rate: (screening + interview + offer) / total
    const activeCount = statusMap.screening + statusMap.interview + statusMap.offer;
    const responseRate = totalApplications > 0
      ? Math.round((activeCount / totalApplications) * 100)
      : 0;

    // Format monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyData.map(({ _id, count }) => ({
      month: months[_id.month - 1],
      count,
    }));

    res.json({
      overview: {
        total: totalApplications,
        active: statusMap.applied + statusMap.screening + statusMap.interview,
        interviews: statusMap.interview,
        offers: statusMap.offer,
        responseRate,
      },
      statusBreakdown: statusMap,
      monthlyApplications: formattedMonthly,
      jobTypeBreakdown: jobTypeBreakdown.map(({ _id, count }) => ({
        type: _id || 'unknown',
        count,
      })),
      recentApplications: recentApps,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
