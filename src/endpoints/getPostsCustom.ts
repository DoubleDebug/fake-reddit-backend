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
export async function getPostsCustom(
    req: Request,
    res: Response,
    next: NextFunction
) {
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

    // get subreddit names
    const db = getFirestore();
    const subredditsSnapshot = await db
        .collection(DB_COLLECTIONS.SUBREDDITS)
        .where('followers', 'array-contains', uid)
        .get();
    const subreddits = subredditsSnapshot.docs.map((s) => s.id);
    if (subreddits.length === 0) {
        res.send({
            success: true,
            data: {
                posts: [],
                followedSubreddits: [],
            },
        });
        return;
    }

    try {
        // fetch posts from followed subreddits
        const postsSnapshot = await db
            .collection(DB_COLLECTIONS.POSTS)
            .where('subreddit', 'in', subreddits)
            .orderBy('createdAt', 'desc')
            .offset(offset)
            .limit(limit)
            .get();

        const data = snapshotToData(postsSnapshot);
        res.send({
            success: true,
            data: {
                posts: data,
                followedSubreddits: subreddits,
            },
        });
        next();
    } catch (error) {
        log(
            `Failed to fetch posts data from the Firestore database. ${JSON.stringify(
                error
            )}.`
        );
        res.send({
            success: false,
            message: 'Failed to fetch posts data from the Firestore database.',
        });
    }
}
