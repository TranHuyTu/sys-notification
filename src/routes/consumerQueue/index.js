'use strict';

const express = require('express');
const consumerQueue = require('../../controllers/consumerQueue.controller')
const { asyncHandler } = require('../../auth/checkAuth');
const router = express.Router();

router.post('', asyncHandler(consumerQueue.runConsumer))
router.post('/userOrder', asyncHandler(consumerQueue.consumerOrderedMessage))
router.post('/unSub', asyncHandler(consumerQueue.unFollowConsumer))


module.exports = router