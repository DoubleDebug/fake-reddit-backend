import type { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { COMMENTS_PER_PAGE, DB_COLLECTIONS } from '../utils/misc/constants';
import { snapshotToData } from '../utils/firestore/snapshotToData';
import { log } from '../utils/misc/log';

/**
 * REQUIRED PARAMETER:
 * - username
 * OPTIONAL QUERY PARAMETERS:
 * - offset (default value: 0)
 * - limit (default value: 3)
 */
export async function getUserComments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get parameters
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || COMMENTS_PER_PAGE;
  const username = req.query.username;
  if (!username) {
    res.send({
      success: false,
      message: 'Missing parameter: username.',
    });
    return;
  }

  // fetch comments
  const db = getFirestore();
  const commentsSnapshot = await db
    .collection(DB_COLLECTIONS.COMMENTS)
    .where('author', '==', username)
    .orderBy('createdAt', 'desc')
    .offset(offset)
    .limit(limit)
    .get()
    .catch((error) => {
      log(
        `Failed to fetch user comments from the Firestore database. ${JSON.stringify(
          error
        )}.`,
        false
      );
      res.send({
        success: false,
        message: 'Failed to fetch user comments from the Firestore database.',
      });
    });

  if (commentsSnapshot) {
    const data = snapshotToData(commentsSnapshot);
    res.send({
      success: true,
      data: data,
    });
    next();
  }
}
