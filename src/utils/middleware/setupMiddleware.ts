import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

export function setupMiddleware(app: Express) {
  app.use(express.json());
  app.use(swaggerUi.serve);
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
    })
  );
}
