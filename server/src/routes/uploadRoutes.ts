import {Router} from 'express';
// @ts-ignore
import multer from 'multer';
import {
  uploadFile,
  getUserUploads,
  deleteUpload,
  updateUpload,
  updateCustomPath, uploadByToken
} from '../controllers/uploadController';
import {authenticateJWT} from '../middleware/authMiddleware';

const router = Router();
const upload = multer({dest: '../uploads/'});

router.post('/upload', authenticateJWT, upload.single('file'), uploadFile);
router.get('/uploads', authenticateJWT, getUserUploads);
router.delete('/uploads/:id', authenticateJWT, deleteUpload);
router.post('/uploads/:id', authenticateJWT, upload.single('file'), updateUpload);
router.post('/update-custom-path/:id', authenticateJWT, updateCustomPath);
router.post('/upload-by-token', authenticateJWT, upload.single('file'), uploadByToken);

export default router;
