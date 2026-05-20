import { Router } from 'express';
import {
  createPaper,
  getAllPapers,
  getMyPapers,
  getPaperById,
  updatePaperStatus,
  uploadPaperPdf,
} from '../controllers/paper.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { uploadPdf } from '../middlewares/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/papers:
 *   post:
 *     summary: Create a paper download request
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
 *               doi:
 *                 type: string
 *                 example: 10.1234/liem.2026.001
 *               paperLink:
 *                 type: string
 *                 example: https://example.com/paper/001
 *               abstract:
 *                 type: string
 *                 example: This paper studies scientific paper retrieval.
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [research, retrieval, deep learning]
 *               publishedYear:
 *                 type: number
 *                 example: 2026
 *     responses:
 *       201:
 *         description: Paper request created
 */
router.post('/', requireAuth, createPaper);

/**
 * @swagger
 * /api/papers/my-requests:
 *   get:
 *     summary: Get current user's paper requests
 *     tags: [Papers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of current user's requests
 */
router.get('/my-requests', requireAuth, getMyPapers);

/**
 * @swagger
 * /api/papers:
 *   get:
 *     summary: Admin gets all paper requests
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_downloaded, downloaded, duplicate, need_info, failed]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all paper requests
 */
router.get('/', requireAuth, requireRole('admin'), getAllPapers);

/**
 * @swagger
 * /api/papers/{id}:
 *   get:
 *     summary: Get one paper request
 *     tags: [Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paper detail
 */
router.get('/:id', requireAuth, getPaperById);

/**
 * @swagger
 * /api/papers/{id}/status:
 *   patch:
 *     summary: Admin updates paper status
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [not_downloaded, downloaded, duplicate, need_info, failed]
 *                 example: need_info
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', requireAuth, requireRole('admin'), updatePaperStatus);

/**
 * @swagger
 * /api/papers/{id}/upload-pdf:
 *   post:
 *     summary: Admin uploads a PDF and marks the paper as downloaded
 *     tags: [Admin Papers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF uploaded
 */
router.post('/:id/upload-pdf', requireAuth, requireRole('admin'), uploadPdf.single('pdf'), uploadPaperPdf);

export default router;
