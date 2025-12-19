import Router from 'express';
import { 
    getTransactions, 
    getTransaction, 
    createTransactionRecord, 
    deleteTransaction, 
    updateTransaction 
} from '../controllers/transaction.js';
import { verifyToken } from '../middlwares/auth.middleware.js';

const transactionRouter = Router();

// @desc - get all transactions
transactionRouter.get('/', verifyToken,  getTransactions);
transactionRouter.get('/:id', verifyToken, getTransaction);
transactionRouter.post('/', verifyToken, createTransactionRecord);
transactionRouter.delete('/:id', verifyToken, deleteTransaction);
transactionRouter.patch('/:id', verifyToken, updateTransaction);

export default transactionRouter;
