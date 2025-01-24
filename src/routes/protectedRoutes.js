const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Protected
 *   description: 보호된 라우트에 대한 API
 */

/**
 * @swagger
 * /protected:
 *   get:
 *     tags: [Protected]
 *     summary: 보호된 라우트에 접근
 *     security:
 *       - bearerAuth: []  # JWT 인증을 위한 보안 설정
 *     responses:
 *       200:
 *         description: 보호된 라우트 접근 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: 인증 실패
 */
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ msg: 'You have accessed a protected route', user: req.user });
});

module.exports = router;
