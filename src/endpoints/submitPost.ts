import { Request, Response, NextFunction } from 'express';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initAlgolia } from '../utils/algolia/initAlgolia.js';
import { DB_COLLECTIONS } from '../utils/misc/constants.js';
import { log } from '../utils/misc/log.js';

export async function submitPost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const postData = req.body;

    if (!postData) {
        res.send({
            success: false,
            message: 'Invalid data parameter(s).',
        });
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
        const index = initAlgolia('posts');
        if (!index) log('Failed to initialize Algolia client.', false);
        index
            ?.saveObject(
                {
                    id: postRes.id,
                    title: postData.title,
                    content: postData.content,
                    author: postData.author,
                    createdAt: new Date().toISOString().slice(0, 10),
                    subreddit: postData.subreddit,
                },
                {
                    autoGenerateObjectIDIfNotExist: true,
                }
            )
            .then(() => log('Added a post to Algolia.'))
            .catch((err) =>
                log(
                    `Failed to add a post to Algolia. ${JSON.stringify(err)}.`,
                    false
                )
            );

        log(`Added a post with the following ID: ${postRes.id}.`);
        res.send({
            success: true,
        });
        next();
    } else {
        res.send({
            success: false,
            message: 'Failed to add post to Firestore.',
        });
    }
}
