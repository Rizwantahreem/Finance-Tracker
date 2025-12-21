import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true,  match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, unique: true },
    password: { type: String, required: true, },
    age: { type: Number, required: true, min: 10 },
    role: { type: String, required: true, maxlength: 50 },
    },
    { Timestamp: true }
)

export const UserModel = model('user', userSchema);