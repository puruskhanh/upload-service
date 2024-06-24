// @ts-ignore
import express from 'express';
// @ts-ignore
import path from 'path';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
// @ts-ignore
import fs from 'fs';
import User from "./models/User";
// @ts-ignore
import cors from 'cors';

let dirname;
if (process.env.NODE_ENV === 'development') {
    dirname = path.resolve(path.dirname(''));
}
else {
    dirname = __dirname;
}

const app = express();
app.use(cors());

app.use(express.json());

// Middleware to serve static files and index.html for directories
app.use('/uploads', (req, res, next) => {
    const filePath = path.join(dirname, "..", 'uploads', req.path);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).send('Not Found');
        }

        if (stats.isDirectory()) {
            const indexFilePath = path.join(filePath, 'index.html');
            fs.stat(indexFilePath, (indexErr, indexStats) => {
                if (indexErr) {
                    return res.status(404).send('Not Found');
                }
                res.sendFile(indexFilePath);
            });
        } else {
            res.sendFile(filePath);
        }
    });
});

// Serve the React application
app.use(express.static(path.join(dirname, "..", 'client', 'build')));

// Handle API routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);

app.use(express.static(path.join(dirname,"..", 'client', 'dist')));

// Serve the React app for any other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(dirname, "..", 'client', 'dist', 'index.html'));
});

sequelize.sync({ force: false }) // Set to true if you want to reset the database on every start
    .then(() => {
        console.log('Database connected and synced');
        (async () => {
            let adminUser = await User.findOne({ where: { role: 'admin' } });
            if (!adminUser) {
                User.create({ username: 'admin', password: 'admin', role: 'admin' });
                console.log('Admin user created with username: admin and password: admin');
            }
        })();
    })
    .catch((err: any) => console.log(err));

export default app;
