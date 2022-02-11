import dotenv from 'dotenv';
import { applicationDefault, initializeApp } from 'firebase-admin/app';

// setup firebase admin sdk
dotenv.config();
export const firebaseApp = initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// setup environment variables
const defaultConfig = {
    PORT: 3000,
    HOSTNAME: 'localhost',
    CLIENT_URL: 'http://localhost:3000',
};
export const CONFIG = {
    PORT: Number(process.env.PORT) || defaultConfig.PORT,
    HOSTNAME: process.env.HOSTNAME || defaultConfig.HOSTNAME,
    CLIENT_URL: process.env.CLIENT_URL || defaultConfig.CLIENT_URL,
};
