import { User } from '../models/User.js';
import { syncUserPoints } from '../utils/points.js';

const activeUserFilter = {
  role: 'user',
  $or: [{ status: 'active' }, { status: { $exists: false } }],
};

async function buildUserStats(user) {
  const stats = await syncUserPoints(user._id);

  return {
    user: { ...user.toSafeObject(), points: stats.points },
    ...stats,
  };
}

export async function getTopUsers(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

  const users = await User.find(activeUserFilter).sort({ createdAt: 1 });
  const stats = await Promise.all(users.map(buildUserStats));

  const rankings = stats
    .sort((left, right) => right.points - left.points || left.user.fullName.localeCompare(right.user.fullName))
    .slice(0, 50)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

  const total = rankings.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * limit;

  res.json({
    rankings: rankings.slice(skip, skip + limit),
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
    },
  });
}

export async function getMyRanking(req, res) {
  const users = await User.find(activeUserFilter).sort({ createdAt: 1 });
  const stats = await Promise.all(users.map(buildUserStats));
  const rankings = stats
    .sort((left, right) => right.points - left.points || left.user.fullName.localeCompare(right.user.fullName))
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

  const ranking = rankings.find((item) => item.user._id.toString() === req.user._id.toString());

  if (!ranking) {
    return res.status(404).json({ message: 'Ranking not found for current user' });
  }

  res.json({ ranking });
}
