import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/constants.js';
import { doesSubredditExist } from '../utils/firestore/doesSubredditExist.js';
import { snapshotToData } from '../utils/snapshotToData.js';

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
    const subredditExists = doesSubredditExist(db, subreddit);
    if (!subredditExists) {
        res.status(400).send({
            success: false,
            message: 'Bad parameter: subreddit.',
        });
    }

    try {
        let postsSnapshot: any = db.collection(DB_COLLECTIONS.POSTS);

        if (subreddit && subredditExists) {
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
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch posts data from the Firestore database.',
        });
    }

    next();
}
