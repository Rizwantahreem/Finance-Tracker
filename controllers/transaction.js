import { mongo } from "mongoose";
import { TransactionModal } from "../modals/transaction.modal.js";
import mongoose from "mongoose";

// @Desc - Get alltransaction
export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionModal.find({ isDeleted: false });
        res.status(200).json(transactions);
    } catch (error) {
        next({msg: error.message, status : 500});
    }
}

// @Desc - Get single transaction
export const getTransaction = async (req, res, next) => {
    const id = req.params.id;
    if (!id)  return res.status(400).json({messaeg: "Invalid ID."})
    
    try {
        const transaction = await TransactionModal.findById({ _id: id });

        if (!transaction) return res.status(404).json({ message: 'No transaction found' })

        res.status(200).json(transaction);
    } catch (error) {
        next({msg : error.message , status: 404})
    }
    
}

// @Desc - Post Create transaction
export const createTransactionRecord = async (req, res, next) => {
    
    try {
        const body = req.body;
        const newTransaction = new TransactionModal({
            amount: body.amount,
            purpose: body.purpose,
            sentTo: body.sendTo
        })
        
        await newTransaction.save();
        res.status(201).json({message: `transaction with id ${newTransaction._id} created successfully`});
    } catch (error) {
        next({ msg: error.message, status: 500});
    }
   
}

// @Desc - Delete Create transaction
export const deleteTransaction = async (req, res, next) => {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({"message": "Invalid id"});
    }

    try {
        const transaction = await TransactionModal.updateOne(
            { _id: id, isDeleted: false },
            { isDeleted: true }
        ); 

        if (transaction.nModified == 0) {
            return res.status(404).json({ message: `Transaction with id ${id} not found or already deleted.` });
        }

        res.status(200).json({ message:  `Transaction with id ${id} deleted successfully`});
    } catch (error) {
        next({ msg: error.message });
    }

}

export const updateTransaction = async (req, res, next) => {
    const body = req.body;
    const id = req.params.id;

    if (!id || !body || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
        let updatedBody = {};
        Object.entries(body).forEach(([key, value]) => {
            updatedBody[key] = value; 
        });

        const transaction = await TransactionModal.updateOne(
            { _id: id, isDeleted: false },
            { $set: updatedBody }
        )

        if (transaction.nModified == 0) {
            return res.status(404).json({ message: `Transaction with id ${id} not found or already updated.` });
        }

        res.status(200).json({'message': `transaction with id ${id} updated.`})
    } catch (error) {
        next({ msg: error.message })   
    }
}