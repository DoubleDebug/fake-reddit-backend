import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/constants.js';
import { doesDocumentExist } from '../utils/firestore/doesDocumentExist.js';
import { snapshotToData } from '../utils/firestore/snapshotToData.js';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 * - r (subreddit id)
 */
export async function getPosts(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || POSTS_PER_PAGE;
    const subreddit = req.query.subreddit && String(req.query.subreddit);

    // check if subreddit exists
    const db = getFirestore();
    const subredditExists = await doesDocumentExist(
        db,
        DB_COLLECTIONS.SUBREDDITS,
        subreddit
    );
    if (subreddit && (!subredditExists || subreddit.length < 3)) {
        res.status(400).send({
            success: false,
            message: 'Bad parameter: subreddit.',
        });
        return;
    }

    try {
        let postsSnapshot: any = db.collection(DB_COLLECTIONS.POSTS);

        if (subreddit) {
            postsSnapshot = postsSnapshot.where('subreddit', '==', subreddit);
        }

        postsSnapshot = await postsSnapshot
            .orderBy('createdAt', 'desc')
            .offset(offset)
            .limit(limit)
            .get();

        const data = snapshotToData(postsSnapshot);
        res.send({
            success: true,
            data: data,
        });
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch posts data from the Firestore database.',
        });
    }
}
