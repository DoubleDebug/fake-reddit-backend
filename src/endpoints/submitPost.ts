import { Request, Response, NextFunction } from 'express';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/constants.js';

export async function submitPost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const postData = req.body;

    if (!postData) {
        res.status(400).send({
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
            console.log('Failed to add document to Firestore.');
            console.error(error);
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
                console.log('Failed to update counter document to Firestore.');
                console.error(error);
            });

        console.log(
            `Successfully added a post with the following ID: ${postRes.id}.`
        );
        res.status(200).send({
            success: true,
        });
        next();
    } else {
        res.status(500).send({
            success: false,
            message: 'Failed to add document to Firestore.',
        });
    }
}
