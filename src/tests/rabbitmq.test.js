'use strict';

const {
    connectToRabbitMQTest, connectToRabbitMQ
} = require('../dbs/init.rabbit');

describe('RabbitMQ connection', () => {
    it('should connect to successful RabbitMQ', async () => {
        const result = await connectToRabbitMQTest();
        expect(result).toBeUndefined();
    })
})