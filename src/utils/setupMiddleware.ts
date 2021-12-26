import cors from 'cors';
import express from 'express';
import { Express } from 'express-serve-static-core';

export function setupMiddleware(app: Express) {
    app.use(express.json());
    app.use(
        cors({
            origin: process.env.CLIENT_URL,
        })
    );
}
