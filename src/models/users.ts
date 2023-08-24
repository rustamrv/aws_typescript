import { Document, Schema, now } from "mongoose";
import { createModel } from "../db";

export interface UsersType extends Document {
  email: string;
  password: string;
  isVerifyEmail: boolean;
  fistName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UsersType>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerifyEmail: { type: Boolean, default: false },
  fistName: { type: String, required: true },
  lastName: { type: String, required: false },
  createdAt: { type: Date, default: now() },
  updatedAt: { type: Date },
});

export const UserModel = async () => {
  return await createModel("users", userSchema);
};
