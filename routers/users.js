import { Router } from 'express';
import { getUser, signIn, signUp } from '../controllers/users.js';

const userRouter =  Router();

userRouter.post('/sign-up', signUp);
userRouter.post('/log-in', signIn);
userRouter.get('/:id', getUser);



export default userRouter;
