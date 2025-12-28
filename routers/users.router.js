import { Router } from "express";
import { signIn, signUp } from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/sign-up", signUp);
userRouter.post("/log-in", signIn);

export default userRouter;
