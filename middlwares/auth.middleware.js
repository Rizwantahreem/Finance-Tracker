import jwt from 'jsonwebtoken';

export const verifyToken = async (req, rest, next) => {
    let token = req.headers.authorization || req.headers.Authorization;
    token = token ? token?.split(" ")[1] : token;

    if (!token) return rest.status(401).json({messge: "Unauthorized access."})

    try {
        const decodedUser = await jwt.verify(token, process.env.SECRET_KEY);
        
        if (!decodedUser) {
            throw Error({ message: 'Invalid token' });
        }
        req.user = decodedUser;
        next();

    } catch (error) {
        next({ msg: error.message })
    }
}