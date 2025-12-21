import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { UserModel } from '../modals/user.model.js';
import { getUserByEmail } from '../services/user.service.js';


export const signUp = async (req, res, next) => {
    let body = req.body;
    if (!body || Object.entries(body).length == 0) {
        return res.status(400).json({ "messaage": "Invalid request."});
    }

    try {
        const encryptedPassword = await bcrypt.hash(body.password, 12);
        const user = await UserModel.create({
            name: body.name,
            password: encryptedPassword,
            age: body.age,
            email: body.email,
            role: body.role,
        });

        res.status(201).json({ message: `user with id ${user._id} created.`});
    } catch (error) {
        console.log(error, 'err')
        next({ msg : error.messaage});
    }
    
}

export const signIn = async (req, res, next) => {
    const body = req.body;

    try {
        const user = await getUserByEmail(body.email);
        if (!user) return res.status(404).json({ message: 'user not found' });
        
        const isPassMatched = await bcrypt.compare(body.password, user.password);
        if (!isPassMatched) return res.status(400).json({ message: 'Invalid credentials' });

        const signedToken = jwt.sign({
                email: user.email,
                age: user.age,
                name: user.name,
                role: user.role,
            }, 
            process.env.SECRET_KEY,
            { 
                expiresIn: '5h',
                algorithm: process.env.ENC_ALGO
            }
        )

        res.cookie('token', signedToken, {
            httpOnly: true,
            httpOnly: true,
            sameSite: 'strict', // CSRF protection
            maxAge: 5 * 60 * 60 * 1000
        })
        res.status(200).json({ message: 'log in successful' });
    } catch (error) {
        next({msg: error.message})
    }
}

export const getUser = async (req, res, next) => {
    const value = req?.params?.id;
    const fieldName = req?.params?.id ? '_id' : 'email';

    try {
        const user = await UserModel.findOne({ [fieldName]: value });

        if (!user) {
            return res.status(404).json({message: 'No user found', user: [] });
        }

        res.status(200).json({ user: user, message: 'fetched user successfully.' })
    } catch (error) {
        console.log(error, 'msg')
        next({ message: error.message });
    }
}