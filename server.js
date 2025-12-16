import express, { urlencoded } from 'express';
import router from './routers/transaction.js';
import { errorLogger } from './middlwares/error.middleware.js';
import { startServer } from './DbConnection.js';

const app = express();
const port = process.env.Port || 5000;

startServer(app, port);

// Adding middleware for request body parsing 
app.use(express.json());
app.use(urlencoded({ extended: false }));

app.use('/api/transaction', router, errorLogger);
app.use(errorLogger);

