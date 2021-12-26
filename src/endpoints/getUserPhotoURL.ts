import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { firebaseApp } from '../utils/setupConfig.js';

export async function getUserPhotoURL(req: Request, res: Response) {
    const uid = req.params.uid;

    if (!uid || uid === '') {
        res.status(400).send({
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
            photoURL: user.photoURL,
        });
    } catch (error: any) {
        res.status(400).send({
            success: false,
            message: JSON.stringify(error.message),
        });
    }
}
