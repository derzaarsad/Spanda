import { app } from './app';
import * as https from 'https';
import * as fs from 'fs'

import { MongoHelper } from './mongo.helper';
import * as mongoose from 'mongoose';

const PORT = 8443;
const MONGO_URI = 'mongodb://localhost:27017/spanda';
const server = https.createServer({
    key: fs.readFileSync('server_dev.key'),
    cert: fs.readFileSync('server_dev.crt')
  }, app);
server.listen(PORT);
server.on('listening', async () => {
    console.info(`Listening on port ${PORT}`);
    mongoose.connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false });
    mongoose.connection.on('open', () => {
        console.info('Connected to Mongo.');
    });
    mongoose.connection.on('error', (err: any) => {
        console.error(err);
    });
});