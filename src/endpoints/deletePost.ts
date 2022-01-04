import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/constants.js';
import { deleteQueryBatch } from '../utils/firestore/deleteQueryBatch.js';
import { doesDocumentExist } from '../utils/firestore/doesDocumentExist.js';

export async function deletePost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const db = getFirestore();
    const postId = req.query.postId && String(req.query.postId);
    const postExists = await doesDocumentExist(
        db,
        DB_COLLECTIONS.POSTS,
        postId
    );
    if (!postExists) {
        res.status(400).send({
            success: false,
            message: 'Bad query parameter: postId.',
        });
        return;
    }

    try {
        // delete post
        await db
            .collection(DB_COLLECTIONS.POSTS)
            .doc(postId!)
            .delete()
            .catch((error) =>
                res.status(500).send({
                    success: false,
                    message:
                        'Failed to delete post from Firestore. ' +
                        JSON.stringify(error),
                })
            );

        // delete comments
        const query = db
            .collection(DB_COLLECTIONS.COMMENTS)
            .where('postId', '==', postId);
        await deleteQueryBatch(db, query, () =>
            console.log(
                `Successfully deleted comments from following post ID: ${postId}`
            )
        ).catch((error) => {
            res.status(500).send({
                success: false,
                message:
                    'Failed to delete comments from Firestore. ' +
                    JSON.stringify(error),
            });
        });

        res.status(200).send({
            success: true,
        });
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message:
                'Failed to delete post from Firestore. ' +
                JSON.stringify(error),
        });
    }
}
