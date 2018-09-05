const express = require('express');
const workerRoutes = require('./worker/worker.route');
const authRoutes = require('./auth/auth.route');
const userRoutes = require('./user/user.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
  res.send('OK');
});

router.use(userRoutes);
router.use(workerRoutes);
router.use(authRoutes);
module.exports = router;
