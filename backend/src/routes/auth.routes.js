import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a normal user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, university, studentId, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyen Van A
 *               university:
 *                 type: string
 *                 example: FPT University
 *               studentId:
 *                 type: string
 *                 example: SE190001
 *               email:
 *                 type: string
 *                 example: user@liemresearch.com
 *               password:
 *                 type: string
 *                 example: User123456
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@liemresearch.com
 *               password:
 *                 type: string
 *                 example: Admin123456
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', requireAuth, me);

export default router;
