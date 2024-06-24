import { Router } from 'express';
import {login, user, changePassword, getUsers, addUser, deleteUser, resetPassword} from '../controllers/authController';
import {authenticateJWT} from "../middleware/authMiddleware";

const router = Router();

router.post('/login', login);
router.post('/change-password', authenticateJWT, changePassword);
router.get('/user', authenticateJWT, user);
router.get('/users', authenticateJWT, getUsers);
router.post('/create-user', authenticateJWT, addUser);
router.delete('/users/:id', authenticateJWT, deleteUser);
router.post("/reset-password/:id", authenticateJWT, resetPassword);

export default router;
