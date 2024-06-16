'use strict';

const mongoose = require('mongoose');
const connectString = 'mongodb+srv://tranhuytu37:r8e9UQDNDHjTQEQ0@clusternodejs.jqoqqp9.mongodb.net/dbDEV';

const TestSchema = new mongoose.Schema({name: String});
const Test = mongoose.model('Test', TestSchema);

describe('Mongoose Connection', () => {
    let connection;

    beforeAll(async()=>{
        connection = await mongoose.connect(connectString);
    })

    //Close the connection to mongoose
    afterAll(async()=>{
        await connection.disconnect();
    })

    it('should connect to mongoose', () => {
        expect(mongoose.connection.readyState).toBe(1);
    })

    it('should save a document to the database', async () => {
        const user = new Test({name: 'User0402'});
        await user.save();
        expect(user.isNew).toBe(false);
    })

    it('should find document to the database', async () => {
        const user = await Test.findOne({name: 'User0402'});
        expect(user).toBeDefined();
        expect(user.name).toBe('User0402');
    })
})