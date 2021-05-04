const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setToursUsersIds } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });
router.use(protect);

router.route('/')
  .get(getAllReview)
  .post(restrictTo('user'), setToursUsersIds, createReview);
router.route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
