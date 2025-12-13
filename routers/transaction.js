import Router from 'express';
import { 
    getTransactions, 
    getTransaction, 
    createTransactionRecord, 
    deleteTransaction, 
    updateTransaction 
} from '../controllers/transaction.js';

const transactionRouter = Router();

// @desc - get all transactions
transactionRouter.get('/', getTransactions);
transactionRouter.get('/:id', getTransaction);
transactionRouter.post('/', createTransactionRecord);
transactionRouter.delete('/:id', deleteTransaction);
transactionRouter.patch('/:id', updateTransaction);

export default transactionRouter;
