'use strict';

const messageService = require('../services/consumerQueue.service');

const { CREATE, OK, SuccessResponse } = require('../core/success.response');

class consumerQueue{
    runConsumer = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create queue success !',
            metadata: await messageService.runConsumer(req.body)
        }).send( res );
    }

    unFollowConsumer = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create queue success !',
            metadata: await messageService.unFollowConsumer(req.body)
        }).send( res );
    }

    consumerOrderedMessage = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create queue success !',
            metadata: await messageService.consumerOrderedMessage(req.body)
        }).send( res );
    }
}

module.exports = new consumerQueue();