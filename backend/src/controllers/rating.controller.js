import { Rating } from '../models/Rating.js';
import { Paper } from '../models/Paper.js';
import { User } from '../models/User.js';

// Đánh giá bài báo
export async function ratePaper(req, res) {
  try {
    const { rating, comment } = req.body;
    const paperId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Kiểm tra user đã rate chưa
    const existingRating = await Rating.findOne({
      paper: paperId,
      user: req.user._id,
    });

    if (existingRating) {
      // Cập nhật rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
    } else {
      // Tạo rating mới
      await Rating.create({
        paper: paperId,
        user: req.user._id,
        rating,
        comment,
      });

      // Tăng điểm đóng góp cho user
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalRatingsGiven: 1, contributionScore: 5 },
      });
    }

    // Tính lại average rating
    const ratings = await Rating.find({ paper: paperId });
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : 0;

    const paper = await Paper.findByIdAndUpdate(
      paperId,
      {
        averageRating: parseFloat(avgRating),
        totalRatings: ratings.length,
      },
      { new: true }
    );

    res.json({
      paper,
      rating: existingRating || (await Rating.findOne({ paper: paperId, user: req.user._id })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Lấy ratings của bài báo
export async function getPaperRatings(req, res) {
  try {
    const ratings = await Rating.find({ paper: req.params.id })
      .populate('user', 'fullName university rank')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Lấy top users (ranking) - ROUTE CỤ THỂ, PHẢI TRƯỚC
export async function getTopUsers(req, res) {
  try {
    const users = await User.find({ role: 'user' })
      .select('fullName university contributionScore totalRequestsCreated totalRatingsGiven rank email')
      .sort({ contributionScore: -1 })
      .limit(50);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Lấy ranking của user hiện tại - ROUTE CỤ THỂ, PHẢI TRƯỚC
export async function getUserRanking(req, res) {
  try {
    const userCount = await User.countDocuments({
      contributionScore: { $gt: req.user.contributionScore },
      role: 'user',
    });
    const rank = userCount + 1;

    res.json({
      rank,
      user: req.user.toSafeObject(),
      contributionScore: req.user.contributionScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}