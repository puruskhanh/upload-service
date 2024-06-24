import {Request, Response} from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';


const login = async (req: Request, res: Response) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({where: {username}});
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        let token = jwt.sign({userId: user.id, username: username, role: user.role, firstLogin: !user.passwordChanged }, 'your_jwt_secret', {expiresIn: '30d'});
        res.status(200).json({token, firstLogin: false});
    } catch (error) {
        console.log("Error logging in", error);
        res.status(500).json({message: 'Error logging in', error});
    }
};

const changePassword = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;

    const {password} = req.body;
    try {
        const user = await User.findByPk(userId);
        user.password = password;
        user.passwordChanged = true;
        await user.save();
        res.json({message: 'successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error changing password', error});
    }
}

const user = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json({username: user.username});
    } catch (error) {
        res.status(500).json({message: 'Error fetching user', error});
    }
}

const getUsers = async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    // @ts-ignore
    let user = await User.findByPk(req.user.userId);
    if (user.role !== 'admin') {
        return res.status(403).json({message: 'Access denied'});
    }

    const users = await User.findAll({attributes: ['id', 'username'], where: {role: 'user'}});
    res.status(200).json(users);
};

const addUser = async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    // @ts-ignore
    let user = await User.findByPk(req.user.userId);

    if (user.role !== 'admin') {
        return res.status(403).json({message: 'Access denied'});
    }

    const {username} = req.body;
    const password = 'password';
    try {
        const user = await User.create({username, password, role: 'user'});
        res.json(user);
    } catch (error) {
        res.status(500).json({message: 'Error creating user', error});
    }
}

const deleteUser = async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    // @ts-ignore
    let user = await User.findByPk(req.user.userId);
    if (user.role !== 'admin') {
        return res.status(403).json({message: 'Access denied'});
    }

    const {id} = req.params;
    try {
        await User.destroy({where: {id}});
        res.status(200).json({message: 'User deleted'});
    } catch (error) {
        res.status(500).json({message: 'Error deleting user', error});
    }
}

const resetPassword = async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    // @ts-ignore
    let user = await User.findByPk(req.user.userId);
    if (user.role !== 'admin') {
        return res.status(403).json({message: 'Access denied'});
    }

    const {id} = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        user.password = 'password';
        user.passwordChanged = false;
        await user.save();
        res.status(200).json({message: 'Password reset successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error resetting password', error});
    }
}


export {login, user, changePassword, getUsers, addUser, deleteUser, resetPassword};
