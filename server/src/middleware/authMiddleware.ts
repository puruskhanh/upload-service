import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret') as { userId: number };
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        // @ts-ignore
        req.user = { userId: user.id };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
