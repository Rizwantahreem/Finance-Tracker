import { UserModel } from "../modals/user.model.js"

export const getUserByEmail = async (email) => {
    return await UserModel.findOne({ email: email});
}