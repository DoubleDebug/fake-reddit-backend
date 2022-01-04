import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';

export async function auth(req: Request, res: Response, next: NextFunction) {
    const idToken = req.headers.authorization;
    if (!idToken) {
        res.status(403).send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (decodedToken) {
        next();
    } else {
        res.status(403).send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }
}
