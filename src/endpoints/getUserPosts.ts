import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/misc/constants.js';
import { snapshotToData } from '../utils/firestore/snapshotToData.js';
import { log } from '../utils/misc/log.js';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 */
export async function getUserPosts(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // get parameters
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || POSTS_PER_PAGE;
    const decodedToken = res.locals.decodedToken;
    const uid = decodedToken.uid;
    if (!decodedToken || !uid) {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }

    // fetch posts
    const db = getFirestore();
    const postsSnapshot = await db
        .collection(DB_COLLECTIONS.POSTS)
        .where('authorId', '==', uid)
        .orderBy('createdAt', 'desc')
        .offset(offset)
        .limit(limit)
        .get()
        .catch((error) => {
            log(
                `Failed to fetch user posts from the Firestore database. ${JSON.stringify(
                    error
                )}.`,
                false
            );
            res.send({
                success: false,
                message:
                    'Failed to fetch user posts from the Firestore database.',
            });
        });

    if (postsSnapshot) {
        const data = snapshotToData(postsSnapshot);
        res.send({
            success: true,
            data: data,
        });
        next();
    }
}
