import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/constants.js';
import { snapshotToData } from '../utils/snapshotToData.js';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 */
export async function getPosts(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || POSTS_PER_PAGE;

    try {
        const postsSnapshot = await getFirestore()
            .collection(DB_COLLECTIONS.POSTS)
            .orderBy('createdAt', 'desc')
            .offset(offset)
            .limit(limit)
            .get();

        const data = snapshotToData(postsSnapshot);
        res.send({
            success: true,
            data: data,
        });
    } catch {
        res.status(500).send({
            success: false,
            message: 'Failed to fetch posts data from the Firestore database.',
        });
    }

    next();
}
