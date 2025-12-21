import Router from 'express';
import { 
    getTransactions, 
    getTransaction, 
    createTransactionRecord, 
    deleteTransaction, 
    updateTransaction 
} from '../controllers/transaction.js';
import { verifyToken } from '../middlwares/auth.middleware.js';
import { authorizeUser } from '../middlwares/roll-based-access.middleware.js';

const transactionRouter = Router();

// @desc - get all transactions
transactionRouter.get(
    '/', 
    verifyToken, 
    authorizeUser('admin', 'user'),  
    getTransactions
);

transactionRouter.get(
    '/:id', 
    verifyToken, 
    authorizeUser('admin', 'user'), 
    getTransaction
);

transactionRouter.post(
    '/', 
    verifyToken, 
    authorizeUser('admin', 'user'), 
    createTransactionRecord
);

transactionRouter.delete(
    '/:id', 
    verifyToken, 
    authorizeUser('admin', 'user'), 
    deleteTransaction
);

transactionRouter.patch(
    '/:id', 
    verifyToken, 
    authorizeUser('admin', 'user'), 
    updateTransaction
);

export default transactionRouter;
