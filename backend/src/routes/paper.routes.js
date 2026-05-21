import { Router } from 'express';
import {
  createPaper,
  getAllPapers,
  getMyPapers,
  getPaperById,
  updatePaperStatus,
  uploadPaperPdf,
  uploadExistingPaper,
} from '../controllers/paper.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { uploadPdf } from '../middlewares/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/papers:
 *   post:
 *     summary: Tạo yêu cầu tải bài báo (User)
 *     tags: [Papers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, doi, paperLink, abstract, publishedYear]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Deep Learning for Scientific Paper Retrieval
 *                 description: Tên bài báo
 *               doi:
 *                 type: string
 *                 example: 10.1234/liem.2026.001
 *                 description: DOI của bài báo
 *               paperLink:
 *                 type: string
 *                 example: https://example.com/paper/001
 *                 description: Link bài báo
 *               abstract:
 *                 type: string
 *                 example: This paper studies scientific paper retrieval.
 *                 description: Tóm tắt bài báo
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["research", "retrieval", "deep learning"]
 *                 description: Từ khóa (tùy chọn)
 *               publishedYear:
 *                 type: number
 *                 example: 2026
 *                 description: Năm xuất bản
 *     responses:
 *       201:
 *         description: Yêu cầu tạo thành công
 *       409:
 *         description: DOI hoặc link đã tồn tại
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/', requireAuth, createPaper);

/**
 * @swagger
 * /api/papers/my:
 *   get:
 *     summary: Lấy danh sách bài báo của tôi (User)
 *     tags: [Papers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách bài báo của user hiện tại
 *       401:
 *         description: Token không hợp lệ
 */
router.get('/my', requireAuth, getMyPapers);

/**
 * @swagger
 * /api/papers/all:
 *   get:
 *     summary: Lấy danh sách tất cả bài báo (Admin)
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_downloaded, downloaded, duplicate, need_info, failed]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, DOI, hoặc link
 *     responses:
 *       200:
 *         description: Danh sách tất cả bài báo
 *       403:
 *         description: Chỉ admin mới có quyền
 */
router.get('/all', requireAuth, requireRole('admin'), getAllPapers);

/**
 * @swagger
 * /api/papers/{id}:
 *   get:
 *     summary: Lấy chi tiết một bài báo
 *     tags: [Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài báo
 *     responses:
 *       200:
 *         description: Thông tin chi tiết bài báo
 *       404:
 *         description: Bài báo không tìm thấy
 *       403:
 *         description: Không có quyền xem bài này
 */
router.get('/:id', requireAuth, getPaperById);

/**
 * @swagger
 * /api/papers/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái bài báo (Admin)
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài báo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [not_downloaded, downloaded, duplicate, need_info, failed]
 *                 example: downloaded
 *                 description: Trạng thái mới
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       404:
 *         description: Bài báo không tìm thấy
 *       400:
 *         description: Trạng thái không hợp lệ
 */
router.patch('/:id/status', requireAuth, requireRole('admin'), updatePaperStatus);

/**
 * @swagger
 * /api/papers/{id}/upload:
 *   post:
 *     summary: Upload file PDF cho bài báo (Admin)
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài báo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File PDF (max 50MB)
 *     responses:
 *       200:
 *         description: Upload thành công, status tự động chuyển thành downloaded
 *       400:
 *         description: File không phải PDF hoặc quá lớn
 *       404:
 *         description: Bài báo không tìm thấy
 */
router.post('/:id/upload', requireAuth, requireRole('admin'), uploadPdf.single('file'), uploadPaperPdf);

/**
 * @swagger
 * /api/papers/upload-existing:
 *   post:
 *     summary: Upload PDF cho bài báo đã tồn tại (Admin)
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, doi]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File PDF
 *               doi:
 *                 type: string
 *                 description: DOI của bài báo (hoặc dùng paperLink)
 *               paperLink:
 *                 type: string
 *                 description: Link của bài báo (hoặc dùng doi)
 *     responses:
 *       200:
 *         description: Upload thành công
 *       404:
 *         description: Bài báo không tìm thấy
 *       400:
 *         description: File hoặc thông tin không hợp lệ
 */
router.post('/upload-existing', requireAuth, requireRole('admin'), uploadPdf.single('file'), uploadExistingPaper);

export default router;