import type { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS, POSTS_PER_PAGE } from '../utils/misc/constants.ts';
import { doesDocumentExist } from '../utils/firestore/doesDocumentExist.ts';
import { snapshotToData } from '../utils/firestore/snapshotToData.ts';
import { log } from '../utils/misc/log.ts';

/**
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default: 0)
 * - limit (default: 3)
 * - r (subreddit id)
 * - sortBy (sorting methods: 'top' | 'new')
 * - hideNSFW (default: false)
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
  const hideNSFW = req.query.hideNSFW;

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
