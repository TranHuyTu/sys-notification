'use strict';

const {
    consumerQueue,
    connectToRabbitMQ
} = require('../dbs/init.rabbit');
const { socketIO } = require('../middlewares/http');

const log = console.log;

console.log = function(){
    log.apply(console, [new Date()].concat(arguments));
}

const messageService = {
    consumerToQueue: async (queueName) => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();
            await consumerQueue(chanel, queueName);
        } catch (error) {
            console.error(error);
        }
    },
    //case processing
    consumerToQueueNormal: async ({id}) => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();

            const notificationExchange = 'notificationEx';
            const notificationQueue = 'notificationQueueProcess';
            const notificationExchangeDLX = 'notificationExDLX';
            const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX';

            //1. Create Exchange
            await chanel.assertExchange(notificationExchange, 'direct', {
                durable: true,
            });
            //2. Create Queue
            const queueResult = await chanel.assertQueue(notificationQueue, {
                exclusive: false,
                deadLetterExchange: notificationExchangeDLX,
                deadLetterRoutingKey: notificationRoutingKeyDLX
            })

            //3. bind Queue
            await chanel.bindQueue(queueResult.queue, notificationExchange);

            //TTL

            // setTimeout(() => {
            //     chanel.consume( notificationQueue, msg => {
            //         const maxRetries = 3;
            //         const retryCount = msg.properties.headers['x-retry-count'] || 0;
            //         try {
            //             const numTest = Math.random();
            //             console.log(numTest);
            //             if(numTest < 0.5){
            //                 throw new Error('Send notification false:: HOI FIX');
            //             }
            //             console.log(`Send notificationQueue successfully processed:: ${id}  =>>>`);
            //             console.log(msg.content.toString());
            //             chanel.ack(msg);
            //         } catch (error) {
            //             // console.log('Send notification error::', error);
            //             if (retryCount < maxRetries) {
            //                 const newHeaders = {
            //                     ...msg.properties.headers,
            //                     'x-retry-count': retryCount + 1
            //                 };
            //                 chanel.publish(
            //                     '',
            //                     notificationQueue,
            //                     msg.content,
            //                     { headers: newHeaders }
            //                 );
            //                 console.log('Đưa lại thông báo vào hàng đợi::: '+(retryCount + 1));
            //                 chanel.ack(msg);
            //             }else {
            //                 console.log('Từ chối xác nhận thông báo mà không đưa lại vào hàng đợi');
            //                 chanel.nack(msg, false, false);
            //             }
            //         }
            //     })
            // }, 2000);

            //LOGIC
            chanel.consume( notificationQueue, msg => {
                const maxRetries = 3;
                const retryCount = msg.properties.headers['x-retry-count'] || 0;
                try {
                    const numTest = Math.random();
                    console.log(numTest);
                    if(numTest < 0.5){
                        throw new Error('Send notification false:: HOI FIX');
                    }
                    console.log(`Send notificationQueue successfully processed::`);
                    console.log(msg.content.toString());
                    chanel.ack(msg);
                } catch (error) {
                    // console.log('Send notification error::', error);
                    if (retryCount < maxRetries) {
                        const newHeaders = {
                            ...msg.properties.headers,
                            'x-retry-count': retryCount + 1
                        };
                        chanel.publish(
                            '',
                            notificationQueue,
                            msg.content,
                            { headers: newHeaders }
                        );
                        console.log('Đưa lại thông báo vào hàng đợi::: '+(retryCount + 1));
                        chanel.ack(msg);
                    }else {
                        console.log('Từ chối xác nhận thông báo mà không đưa lại vào hàng đợi');
                        chanel.nack(msg, false, false);
                    }
                }
            })
        } catch (error) {
            console.error(error);
        }
    },
    //case false processing
    consumerToQueueFalse: async () => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();
            
            const notificationExchangeDLX = 'notificationExDLX';
            const notificationRoutingKeyDLX = 'notificationRoutingKeyDLX';
            const notificationQueueHandler = 'notificationQueueHotFix';

            await chanel.assertExchange(notificationExchangeDLX, 'direct', {
                durable: true,
            })

            const queueResult = await chanel.assertQueue(notificationQueueHandler, {
                exclusive: false,
            })
            
            await chanel.bindQueue( queueResult.queue, notificationExchangeDLX, notificationRoutingKeyDLX );
            await chanel.consume( queueResult.queue, msgFalse=>{
                console.log(`this notification error: , pls hot fix :: `, msgFalse.content.toString());
            },{
                noAck: true,
            })
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    runConsumer: async ({userId, shopId}) => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();

            const notificationExchange = `notificationExPubSub${shopId}`;

            await chanel.assertExchange(notificationExchange, 'fanout', {
                durable: false,
            });
            
            const {
                queue
            } = await chanel.assertQueue('', {
                exclusive: true,
            });

            await chanel.bindQueue(queue, notificationExchange, '');

            const consumeResult = await chanel.consume( queue, (message) => {
                console.log(`NotiID ${message.content.toString()} ::: ${userId}`);

                socketIO.emit(userId, {
                    shopId,
                    notification: JSON.parse(message.content.toString())
                });
            },{
                noAck: true,
            })

            const consumerTag = consumeResult.consumerTag;

            if (!consumerTag) {
                throw new Error('Failed to retrieve consumerTag');
            }

            console.log(consumerTag);

            return {
                tagId: consumerTag,
                userId,
                shopId
            }
        } catch (error) {
            console.error(error);
        }
    },

    unFollowConsumer: async({consumerTag}) => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();

            // Cancel the consumer using the consumer tag
            await chanel.cancel(consumerTag);

            console.log(`Successfully unsubscribed consumer with tagId: ${consumerTag}`);
        } catch (error) {
            console.error('Error during unsubscription:', error);
        }
    },
    
    consumerOrderedMessage: async({shopId}) => {
        try {
            const { chanel, connection } = await connectToRabbitMQ();

            const queueName = `queuedMessageChatBox${shopId}`;
            await chanel.assertQueue(queueName, {
                durable: true,
            })

            //Set prefetch to 1 to ensure only one ack at a time
            chanel.prefetch(1);

            chanel.consume( queueName, (message) => {
                console.log(`NotiID ${message.content.toString()}`);

                const detail = JSON.parse(message.content.toString());

                socketIO.emit(shopId, {
                    shopId,
                    notification: JSON.parse(message.content.toString())
                });

                socketIO.emit(detail.user_Id, {
                    shopId,
                    notification: JSON.parse(message.content.toString())
                });

                setTimeout(() => {
                    chanel.ack(message);
                }, Math.random() * 1000);
            })
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = messageService;