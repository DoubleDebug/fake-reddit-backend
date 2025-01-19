import type { Request, Response, NextFunction } from 'express';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAlgoliaClient } from '../utils/algolia/initAlgolia.ts';
import { validatePost } from '../utils/dataValidation/validatePost.ts';
import { DB_COLLECTIONS } from '../utils/misc/constants.ts';
import { log } from '../utils/misc/log.ts';

export async function submitPost(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const postData = req.body;

  // validate data
  const validation = validatePost(postData);
  if (!validation.success) {
    res.send(validation);
    return;
  }

  // add document to Firestore
  const db = getFirestore();
  const postRes = await db
    .collection(DB_COLLECTIONS.POSTS)
    .add({ ...postData, createdAt: Timestamp.now() })
    .catch((error) => {
      log(`Failed to add post to Firestore. ${error.message}.`, false);
    });

  if (postRes) {
    // update counters in Firestore
    const counters: any = {
      all: FieldValue.increment(1),
    };
    if (postData.subreddit !== 'all')
      counters[postData.subreddit] = FieldValue.increment(1);

    await db
      .collection(DB_COLLECTIONS.METADATA)
      .doc('numOfPosts')
      .update(counters)
      .catch((error) => {
        log(
          `Failed to update counter document to Firestore. ${error.message}.`,
          false
        );
      });

    // add document to Algolia
    const algClient = getAlgoliaClient();
    if (!algClient) log('Failed to initialize Algolia client.', false);
    algClient
      ?.saveObject({
        indexName: 'posts',
        body: {
          id: postRes.id,
          title: postData.title,
          content: postData.content,
          author: postData.author,
          createdAt: new Date().toISOString().slice(0, 10),
          subreddit: postData.subreddit,
        },
      })
      .then(() => log('Added a post to Algolia.'))
      .catch((err: any) =>
        log(`Failed to add a post to Algolia. ${JSON.stringify(err)}.`, false)
      );

    log(`Added a post with the following ID: ${postRes.id}.`);
    res.send({
      success: true,
      data: {
        id: postRes.id,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    });
    next();
  } else {
    res.send({
      success: false,
      message: 'Failed to add post to Firestore.',
    });
  }
}
