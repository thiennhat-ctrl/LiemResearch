import { Paper } from '../models/Paper.js';
import { Rating } from '../models/Rating.js';

// Tìm kiếm bài báo công khai (cộng đồng)
export async function searchPapers(req, res) {
  try {
    const { query, year, sortBy } = req.query;
    const filter = { status: 'downloaded' }; // Chỉ hiển thị bài đã tải

    // Tìm kiếm full-text
    if (query) {
      filter.$text = { $search: query };
    }

    // Lọc theo năm
    if (year) {
      filter.publishedYear = parseInt(year);
    }

    // Sắp xếp
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'rating') {
      sortOptions = { averageRating: -1, totalRatings: -1 };
    } else if (sortBy === 'views') {
      sortOptions = { views: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const papers = await Paper.find(filter)
      .populate('requestedBy', 'fullName university rank contributionScore')
      .populate('uploadedBy', 'fullName')
      .sort(sortOptions)
      .limit(50);

    res.json({
      papers,
      total: papers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Tăng lượt xem
export async function incrementViews(req, res) {
  try {
    const paper = await Paper.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json({ paper });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Lấy bài báo theo ID (công khai)
export async function getPublicPaper(req, res) {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('requestedBy', 'fullName university rank contributionScore')
      .populate('uploadedBy', 'fullName');

    if (!paper || paper.status !== 'downloaded') {
      return res.status(404).json({ message: 'Paper not found or not yet uploaded' });
    }

    // Lấy ratings của bài này
    const ratings = await Rating.find({ paper: req.params.id })
      .populate('user', 'fullName university')
      .sort({ createdAt: -1 });

    res.json({ paper, ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}