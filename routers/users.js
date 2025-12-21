import { Router } from 'express';
import { getUser, signIn, signUp } from '../controllers/users.js';
import { verifyToken } from '../middlwares/auth.middleware.js';

const userRouter =  Router();

userRouter.post('/sign-up', signUp);
userRouter.post('/log-in', signIn);
userRouter.get('/:id', verifyToken, getUser);


export default userRouter;
