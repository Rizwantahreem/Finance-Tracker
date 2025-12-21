import mongoose, { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
    amount: { type: Number, required: true, maxlength: 99999},
    purpose: { type: String, require: false },
    sendTo: { type: String, require: true, maxlength: 1000 },
    isDeleted: { type: Boolean, require: false, default: false },
    userID: { type: mongoose.Schema.Types.ObjectId, require: true, ref: 'user' }
    }, 
    { timestamps: true }
)

export const TransactionModel = model('Transaction', transactionSchema);
