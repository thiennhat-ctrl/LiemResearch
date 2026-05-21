import { Router } from 'express';
import {
  ratePaper,
  getPaperRatings,
  getTopUsers,
  getUserRanking,
} from '../controllers/rating.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/rankings/top:
 *   get:
 *     summary: Lấy top users theo điểm đóng góp
 *     tags: [Rankings]
 *     responses:
 *       200:
 *         description: Danh sách top 50 users
 */
router.get('/top', getTopUsers);

/**
 * @swagger
 * /api/rankings/my:
 *   get:
 *     summary: Lấy xếp hạng của user hiện tại
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xếp hạng và điểm đóng góp
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/my', requireAuth, getUserRanking);

/**
 * @swagger
 * /api/ratings/{paperId}:
 *   post:
 *     summary: Đánh giá/bình luận bài báo
 *     tags: [Ratings & Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *                 description: Điểm đánh giá (1-5)
 *               comment:
 *                 type: string
 *                 example: Bài báo rất hay
 *                 description: Bình luận (tùy chọn)
 *     responses:
 *       200:
 *         description: Đánh giá thành công
 *       400:
 *         description: Rating không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
router.post('/:id', requireAuth, ratePaper);

/**
 * @swagger
 * /api/ratings/{paperId}:
 *   get:
 *     summary: Lấy danh sách ratings/bình luận của bài báo
 *     tags: [Ratings & Comments]
 *     parameters:
 *       - in: path
 *         name: paperId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ratings
 */
router.get('/:id', getPaperRatings);

export default router;