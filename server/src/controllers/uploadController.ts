import { Request, Response } from 'express';
import Upload from '../models/Upload';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import unzipper from 'unzipper';


let dirname;
if (process.env.NODE_ENV === 'development') {
    dirname = path.resolve(path.dirname(''));
}
else {
    dirname = __dirname;
}

const uploadFile = async (req: Request, res: Response) => {
    const { file } = req;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (fileExtension === '.zip') {
        const uploadId = uuidv4();
        const extractPath = path.join(dirname, "..", 'uploads', uploadId);

        fs.mkdirSync(extractPath, { recursive: true });

        // Extract the zip file
        fs.createReadStream(file.path)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise()
            .then(async () => {
                const upload = await Upload.create({
                    // @ts-ignore
                    userId: req.user.userId,
                    filePath: uploadId,
                    originalName: file.originalname,
                });

                fs.unlinkSync(file.path); // Remove the uploaded zip file

                res.status(201).json({ message: 'Zip file uploaded and extracted', file: upload });
            })
            .catch((err: Error) => {
                fs.rmdirSync(extractPath, { recursive: true });
                res.status(500).json({ message: 'Error extracting zip file', error: err.message });
            });
    }
    else {
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(dirname, "..", 'uploads', fileName);

        fs.renameSync(file.path, filePath);

        const upload = await Upload.create({
            // @ts-ignore
            userId: req.user.userId,
            filePath: fileName,
            originalName: file.originalname,
        });

        res.status(201).json({ message: 'File uploaded', file: upload.dataValues });
    }
};

const getUserUploads = async (req: Request, res: Response) => {
    // @ts-ignore
    const uploads = await Upload.findAll({ where: { userId: req.user.userId } });
    res.json(uploads);
};

const deleteUpload = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const upload = await Upload.findOne({ where: { id, userId: req.user.userId } });
    if (!upload) {
        return res.status(404).json({ message: 'Upload not found' });
    }
    const filePath = path.resolve(path.join(dirname, "..", 'uploads', upload.dataValues.filePath));
    if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmdirSync(filePath, { recursive: true });
    } else {
        fs.unlinkSync(filePath);
    }
    await upload.destroy();
    res.json({ message: 'Upload deleted' });
};

export { uploadFile, getUserUploads, deleteUpload };
