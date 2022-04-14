import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';

export async function isSignedIn(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const idToken = req.headers.authorization;
    if (!idToken) {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }

    const decodedToken = await getAuth()
        .verifyIdToken(idToken)
        .catch(() => {
            res.send({
                success: false,
                message: 'Unauthorized request.',
            });
            return;
        });

    if (decodedToken) {
        res.locals.decodedToken = decodedToken;
        next();
    } else {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }
}
