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

const updateUpload = async (req: Request, res: Response) => {
    const { id } = req.params;
    // @ts-ignore
    const upload = await Upload.findOne({ where: { id, userId: req.user.userId } });
    if (!upload) {
        return res.status(404).json({ message: 'Upload not found' });
    }
    const filePath = upload.dataValues.filePath;
    const fileName = path.basename(filePath);
    const { file } = req;
    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadFileExtension = path.extname(file.originalname).toLowerCase();
    console.log(uploadFileExtension === '.zip' && path.extname(filePath).trim().length > 0);
    if (uploadFileExtension === '.zip' && path.extname(filePath).trim().length > 0) { // upload is a zip file, original file has an extension
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: 'File extension must be the same as the original file' });
    }
    else if (uploadFileExtension !== '.zip' && path.extname(filePath) !== uploadFileExtension) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: 'File extension must be the same as the original file' });
    }

    if (uploadFileExtension === '.zip') {
        const extractPath = path.join(dirname, "..", 'uploads', filePath);

        fs.rmdirSync(extractPath, { recursive: true, force: true});
        fs.mkdirSync(extractPath, { recursive: true });

        // Extract the zip file
        fs.createReadStream(file.path)
            .pipe(unzipper.Extract({ path: extractPath }))
            .promise()
            .then(async () => {
                upload.originalName = file.originalname;
                await upload.save();

                fs.unlinkSync(file.path); // Remove the uploaded zip file

                res.status(201).json({ message: 'Zip file uploaded and extracted', file: upload });
            })
            .catch((err: Error) => {
                fs.rmdirSync(extractPath, { recursive: true, force: true});
                res.status(500).json({ message: 'Error extracting zip file', error: err.message });
            });
    }
    else {
        const p = path.join(dirname, "..", 'uploads', fileName);
        fs.unlinkSync(p);
        fs.renameSync(file.path, p);
        upload.originalName = file.originalname;
        await upload.save();

        res.status(201).json({ message: 'File uploaded', file: upload.dataValues });
    }
};

export { uploadFile, getUserUploads, deleteUpload, updateUpload };
