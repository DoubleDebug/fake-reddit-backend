import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/misc/constants.js';
import { doesDocumentExist } from '../utils/firestore/doesDocumentExist.js';
import { snapshotToData } from '../utils/firestore/snapshotToData.js';
import { log } from '../utils/misc/log.js';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 * - r (subreddit id)
 * - sortBy (sorting methods: 'top' | 'new')
 */
export async function getPosts(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || POSTS_PER_PAGE;
    const subreddit = req.query.subreddit && String(req.query.subreddit);
    const sortingMethod = req.query.sortBy && String(req.query.sortBy);

    // check if subreddit exists
    const db = getFirestore();
    const subredditExists = await doesDocumentExist(
        db,
        DB_COLLECTIONS.SUBREDDITS,
        subreddit
    );
    if (subreddit && (!subredditExists || subreddit.length < 3)) {
        res.send({
            success: false,
            message: 'Bad query parameter: subreddit.',
        });
        return;
    }

    try {
        let postsSnapshot: any = db.collection(DB_COLLECTIONS.POSTS);
        if (subreddit && subreddit !== 'all') {
            postsSnapshot = postsSnapshot.where('subreddit', '==', subreddit);
        }
        postsSnapshot = await postsSnapshot
            .orderBy(sortingMethod === 'top' ? 'score' : 'createdAt', 'desc')
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
        log(
            `Failed to fetch posts data from the Firestore database. ${JSON.stringify(
                error
            )}.`,
            false
        );
        res.send({
            success: false,
            message: 'Failed to fetch posts data from the Firestore database.',
        });
    }
}
