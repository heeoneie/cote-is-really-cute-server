const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: health
 *   description: 서버 상태 확인
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 서버 상태 확인
 *     description: 서버의 상태를 확인합니다.
 *     tags: [health]
 *     responses:
 *       200:
 *         description: 서버가 정상입니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
