const express = require('express');
const router = express.Router();

const { getOverview, getTour, getLoginForm, getAccaunt, updateUserData, getMyTours} = require('../controllers/viewsController');
const { protect, isLoggedIn} = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

router.get('/login', getLoginForm);

//router.get('/signup', signup);

router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getOverview);
router.get('/me', protect, getAccaunt);
router.get('/my-tours', protect, getMyTours);
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;