import { User } from '../models/User.js';
import { syncUserPoints } from '../utils/points.js';

const activeUserFilter = {
  $or: [{ status: 'active' }, { status: { $exists: false } }],
};

async function buildUserStats(user) {
  const stats = await syncUserPoints(user._id);

  return {
    user: { ...user.toSafeObject(), points: stats.points },
    ...stats,
  };
}

async function buildRankings() {
  const users = await User.find(activeUserFilter).sort({ createdAt: 1 });
  const stats = await Promise.all(users.map(buildUserStats));

  return stats
    .sort((left, right) => right.points - left.points || left.user.fullName.localeCompare(right.user.fullName))
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
}

export async function getTopUsers(req, res) {
  const rankings = (await buildRankings()).slice(0, 50);

  res.json({ rankings });
}

export async function getMyRanking(req, res) {
  const rankings = await buildRankings();

  const ranking = rankings.find((item) => item.user._id.toString() === req.user._id.toString());

  if (!ranking) {
    return res.status(404).json({ message: 'Ranking not found for current user' });
  }

  res.json({ ranking });
}

export async function getUserRankingById(req, res) {
  const rankings = await buildRankings();
  const ranking = rankings.find((item) => item.user._id.toString() === req.params.id.toString());

  if (!ranking) {
    return res.status(404).json({ message: 'Ranking not found for user' });
  }

  res.json({ ranking });
}
