import express, { urlencoded } from 'express';
import router from './routers/transaction.js';

const app = express();
const port = process.env.Port || 5000;

// Adding middleware for request body parsing 
app.use(express.json());
app.use(urlencoded({ extended: false }));

app.use('/api/transaction', router);

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})