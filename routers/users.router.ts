import { Router } from "express";
import { logOut, signIn, signUp } from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/sign-up", signUp);
userRouter.post("/log-in", signIn);
userRouter.post('/log-out', verifyToken, logOut);

export default userRouter;
