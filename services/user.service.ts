import { UserModel } from "../models/user.model.js";

export const getUserByEmail = async (email) => {
  return await UserModel.findOne({ email: email });
};
