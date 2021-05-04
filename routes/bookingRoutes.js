const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getCheckoutSession, getBooking, createBooking, getAllBooking, updateBooking, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();
router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.route('/')
  .get(getAllBooking)
  .post(restrictTo('admin', 'lead-guide'), createBooking);

router.route('/:id')
  .get(getBooking)
  .patch(restrictTo('admin', 'lead-guide'), updateBooking)
  .delete(restrictTo('admin', 'lead-guide'), deleteBooking);

module.exports = router;
