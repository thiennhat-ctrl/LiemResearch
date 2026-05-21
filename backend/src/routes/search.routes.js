import { Router } from 'express';
import {
  searchPapers,
  incrementViews,
  getPublicPaper,
} from '../controllers/paper.search.controller.js';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Tìm kiếm bài báo công khai (Cộng đồng)
 *     tags: [Search - Community]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên, DOI, keywords...)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Lọc theo năm xuất bản
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, views, newest]
 *         description: Sắp xếp theo (mặc định newest)
 *     responses:
 *       200:
 *         description: Danh sách bài báo công khai
 *       500:
 *         description: Lỗi server
 */
router.get('/', searchPapers);

/**
 * @swagger
 * /api/search/{id}:
 *   get:
 *     summary: Lấy chi tiết bài báo công khai
 *     tags: [Search - Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài báo
 *     responses:
 *       200:
 *         description: Chi tiết bài báo + danh sách ratings
 *       404:
 *         description: Bài báo không tìm thấy hoặc chưa được tải lên
 */
router.get('/:id', getPublicPaper);

/**
 * @swagger
 * /api/search/{id}/view:
 *   post:
 *     summary: Tăng lượt xem bài báo
 *     tags: [Search - Community]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:id/view', incrementViews);

export default router;