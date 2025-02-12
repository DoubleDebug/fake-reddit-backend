import type { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/misc/constants';
import { snapshotToData } from '../utils/firestore/snapshotToData';
import { log } from '../utils/misc/log';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 * - sortBy (sorting methods: 'top' | 'new')
 * - hideNSFW (default: false)
 */
export async function getPostsCustom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || POSTS_PER_PAGE;
  const sortingMethod = req.query.sortBy && String(req.query.sortBy);
  const hideNSFW = req.query.hideNSFW;

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
    let postsSnapshot: any = db
      .collection(DB_COLLECTIONS.POSTS)
      .where('subreddit', 'in', subreddits);
    if (hideNSFW) {
      postsSnapshot = postsSnapshot.where('isNSFW', '==', false);
    }
    postsSnapshot = await postsSnapshot
      .orderBy(sortingMethod === 'top' ? 'score' : 'createdAt', 'desc')
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
      )}.`,
      false
    );
    res.send({
      success: false,
      message: 'Failed to fetch posts data from the Firestore database.',
    });
  }
}
