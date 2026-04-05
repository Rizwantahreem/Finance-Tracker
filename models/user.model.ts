import mongoose, { Schema } from "mongoose";

interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  age: number;
  role: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  tokenVersion: number;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      unique: true,
    },
    password: { type: String, required: true, minlength: 6 },
    age: { type: Number, required: true, min: 10 },
    role: { type: String, required: true, maxlength: 50 },
    phoneNumber: { type: String, required: false, match: /^[0-9]{10}$/ },
    isEmailVerified: { type: Boolean, required: true, default: false },
    tokenVersion: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
    collection: "users", // Explicit collection name to avoid any confusion
  },
);

/** Re-use compiled model in long-lived processes (e.g. Vitest singleFork) — Mongoose forbids duplicate names. */
export const UserModel =
  mongoose.models.user ?? mongoose.model<User>("user", userSchema);
