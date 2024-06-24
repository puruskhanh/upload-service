import { Router } from 'express';
// @ts-ignore
import multer from 'multer';
import { uploadFile, getUserUploads, deleteUpload } from '../controllers/uploadController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ dest: '../uploads/' });

router.post('/upload', authenticateJWT, upload.single('file'), uploadFile);
router.get('/uploads', authenticateJWT, getUserUploads);
router.delete('/uploads/:id', authenticateJWT, deleteUpload);

export default router;
