import jwt from 'jsonwebtoken';

export const verifyToken = async (req, rest, next) => {
    let token = req.headers.authorization || req.headers.Authorization;

    if (!token || !token.startsWith('Bearer')) return res.status(401).json({messge: "Unauthorized access."})

    token = token?.split(" ")[1];
    try {
        const decodedUser = await jwt.verify(token, process.env.SECRET_KEY);
        req.user = decodedUser;

        if (!decodedUser) {
            throw Error({ message: 'Invalid or expire token' });
        }
        req.user = decodedUser;
        next();

    } catch (error) {
        next({ msg: error.message })
    }
}