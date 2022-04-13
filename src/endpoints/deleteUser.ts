import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/misc/constants.js';
import { initAlgolia } from '../utils/algolia/initAlgolia.js';
import { log } from '../utils/misc/log.js';

export async function deleteUser(
    _: Request,
    res: Response,
    next: NextFunction
) {
    const decodedToken = res.locals.decodedToken;
    const uid = decodedToken.uid;
    if (!decodedToken || !uid) {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }

    // sign out user everywhere
    const auth = getAuth();
    auth.revokeRefreshTokens(uid);

    // delete user from Firestore
    const db = getFirestore();
    const firestoreResponse = await db
        .collection(DB_COLLECTIONS.USERS)
        .doc(uid)
        .delete()
        .catch((err) =>
            log(`Failed to delete user from Firestore. ${err.message}.`, false)
        );
    if (firestoreResponse) log(`Deleted user from Firestore: ${uid}.`);

    // delete user from Algolia
    const index = initAlgolia('users');
    index
        ?.deleteObject(uid)
        .then(() => log(`Deleted user from Algolia.`))
        .catch((error) =>
            log(`Failed to delete user from Algolia. ${error}`, false)
        );

    // delete user from Firebase Auth
    await auth
        .deleteUser(uid)
        .catch((err) =>
            log(
                `Failed to delete user from Firebase auth. ${err.message}.`,
                false
            )
        );
    log(`Deleted user from Firebase auth.`);

    res.send({
        success: true,
    });
    next();
}
