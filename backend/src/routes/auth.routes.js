import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
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
 *                 example: Nguyễn Văn A
 *                 description: Họ tên đầy đủ
 *               university:
 *                 type: string
 *                 example: Đại học Bách Khoa
 *                 description: Trường/Đơn vị
 *               studentId:
 *                 type: string
 *                 example: SE190001
 *                 description: Mã số sinh viên
 *               email:
 *                 type: string
 *                 example: user@example.com
 *                 description: Email đăng ký
 *               password:
 *                 type: string
 *                 example: Password@123
 *                 description: Mật khẩu
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       409:
 *         description: Email đã tồn tại
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
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
 *                 description: Email đăng nhập
 *               password:
 *                 type: string
 *                 example: Admin123456
 *                 description: Mật khẩu
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token JWT
 *       401:
 *         description: Email hoặc mật khẩu sai
 *       400:
 *         description: Thiếu email hoặc mật khẩu
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin user
 *       401:
 *         description: Token không hợp lệ hoặc hết hạn
 */
router.get('/me', requireAuth, me);

export default router;