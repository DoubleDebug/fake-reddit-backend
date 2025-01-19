import type { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/misc/constants.ts';
import { snapshotToData } from '../utils/firestore/snapshotToData.ts';
import { log } from '../utils/misc/log.ts';

export async function getSavedPosts(
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

  // get saved post ids
  const db = getFirestore();
  const userData = (
    await db.collection(DB_COLLECTIONS.USERS).doc(uid).get()
  ).data();
  if (!userData || !userData.savedPosts) {
    res.send({
      success: false,
      message: 'Failed to find users saved posts.',
    });
    return;
  }
  const postIds = userData.savedPosts;

  // fetch posts
  const postsToFetch = postIds.map((pid: string) =>
    db.collection(DB_COLLECTIONS.POSTS).doc(pid).get()
  );
  const postsSnapshot = await Promise.all(postsToFetch).catch((error) => {
    log(
      `Failed to fetch saved posts from the Firestore database. ${JSON.stringify(
        error
      )}.`,
      false
    );
    res.send({
      success: false,
      message: 'Failed to fetch saved posts from the Firestore database.',
    });
  });

  // return post data
  if (!postsSnapshot) return;
  try {
    const data = snapshotToData(postsSnapshot as any);
    res.send({
      success: true,
      data: data,
    });
    next();
  } catch (error) {
    log(`Failed to get saved post data. ${JSON.stringify(error)}.`, false);
    res.send({
      success: false,
      message: 'Failed to get saved post data.',
    });
  }
}
