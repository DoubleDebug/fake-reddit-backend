import dotenv from 'dotenv';

const defaultConfig = {
    PORT: 3000,
    HOSTNAME: 'localhost',
};

dotenv.config();

export const CONFIG = {
    PORT: Number(process.env.PORT) || defaultConfig.PORT,
    HOSTNAME: process.env.HOSTNAME || defaultConfig.HOSTNAME,
};
