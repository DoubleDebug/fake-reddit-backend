import express, { Request, Response } from 'express';
import { CONFIG } from './config.js';

const app = express();
app.use(express.json());

// ROUTES
app.get('/', (_req: Request, res: Response) => {
    res.send('Test');
});

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    console.log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
});
