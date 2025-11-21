const router = require('express').Router();
const auth = require('../middleware/auth');
const { createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-payment-intent', auth, createPaymentIntent);

module.exports = router;
