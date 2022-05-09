import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from '../utils/misc/setupConfig.js';

export async function getUserPhotoURL(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const uid = req.params.uid;

    if (!uid || uid === '') {
        res.send({
            success: false,
            message: 'User with provided ID does not exist.',
        });
        return;
    }

    const auth = getAuth(firebaseApp);
    try {
        const user = await auth.getUser(uid);
        res.send({
            success: true,
            data: user.photoURL,
        });
    } catch (error: any) {
        res.send({
            success: false,
            message: JSON.stringify(error.message),
        });
    }

    next();
}
