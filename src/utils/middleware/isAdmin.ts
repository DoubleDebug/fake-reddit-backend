import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../misc/constants.js';

export async function isAdmin(_: Request, res: Response, next: NextFunction) {
    // get user id
    const decodedToken = res.locals.decodedToken;
    const uid = decodedToken.uid;
    if (!decodedToken || !uid) {
        sendFailMessage(res);
        return;
    }

    // get user data
    const db = getFirestore();
    const userDoc = await db.collection(DB_COLLECTIONS.USERS).doc(uid).get();
    const userData = userDoc.data();
    if (!userDoc.exists || !userData) {
        sendFailMessage(res);
        return;
    }

    // check if user is admin
    if (!userData.isAdmin) {
        sendFailMessage(res);
        return;
    }

    next();
}

function sendFailMessage(res: Response) {
    res.send({
        success: false,
        message: 'User must be an admin to perform this action.',
    });
}
