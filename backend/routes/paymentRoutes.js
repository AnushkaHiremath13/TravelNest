const express = require('express');
const { createPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/', createPayment);

module.exports = router;