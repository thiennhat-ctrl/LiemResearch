import { Router } from 'express';
import { getMyRanking, getTopUsers } from '../controllers/ranking.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/rankings/top:
 *   get:
 *     summary: Get top users by contribution points
 *     tags: [Rankings]
 *     responses:
 *       200:
 *         description: Top users
 */
router.get('/top', getTopUsers);

/**
 * @swagger
 * /api/rankings/me:
 *   get:
 *     summary: Get current user's ranking
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's ranking
 */
router.get('/me', requireAuth, getMyRanking);

export default router;
