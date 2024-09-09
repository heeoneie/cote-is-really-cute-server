const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
    res.json({ msg: 'You have accessed a protected route', user: req.user });
});

module.exports = router;
