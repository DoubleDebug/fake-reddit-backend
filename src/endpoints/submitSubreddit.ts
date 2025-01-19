import type { Request, Response, NextFunction } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getAlgoliaClient } from '../utils/algolia/initAlgolia.ts';
import { validateSubreddit } from '../utils/dataValidation/validateSubreddit.ts';
import { DB_COLLECTIONS } from '../utils/misc/constants.ts';
import { log } from '../utils/misc/log.ts';

export async function submitSubreddit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // validate data
  const subredditData = req.body;
  const id = req.body?.id;
  const validation = await validateSubreddit(subredditData);
  if (!validation.success) {
    res.send({
      success: false,
      message: validation.message,
    });
    return;
  }

  // add document to Firestore
  const db = getFirestore();
  const dbResponse = await db
    .collection(DB_COLLECTIONS.SUBREDDITS)
    .doc(id)
    .set(subredditData)
    .catch((error) => {
      log(`Failed to add subreddit to Firestore. ${error.message}.`, false);
    });

  if (dbResponse) {
    // add document to Algolia
    const index = getAlgoliaClient();
    if (!index) log('Failed to initialize Algolia client.', false);
    index
      ?.saveObject({
        indexName: 'subreddits',
        body: {
          name: id,
          description: subredditData.description,
        },
      })
      .then(() => log('Added a subreddit to Algolia.'))
      .catch((err: any) =>
        log(
          `Failed to add a subreddit to Algolia. ${JSON.stringify(err)}.`,
          false
        )
      );

    log(`Added a subreddit with the following ID: ${id}.`);
    res.send({
      success: true,
      data: {
        id: id,
        description: subredditData.description,
      },
    });
    next();
  } else {
    res.send({
      success: false,
      message: 'Failed to add subreddit to Firestore.',
    });
  }
}
