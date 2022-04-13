import { NextFunction, Request, Response } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initAlgolia } from '../utils/algolia/initAlgolia.js';
import { DB_COLLECTIONS } from '../utils/misc/constants.js';
import { deleteQueryBatch } from '../utils/firestore/deleteQueryBatch.js';
import { log } from '../utils/misc/log.js';

export async function deletePost(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const db = getFirestore();
    const postId = req.query.postId && String(req.query.postId);
    if (!postId) {
        res.send({
            success: false,
            message: 'Bad query parameter: postId.',
        });
        return;
    }
    const post = await db.collection(DB_COLLECTIONS.POSTS).doc(postId).get();

    try {
        // delete post
        await db
            .collection(DB_COLLECTIONS.POSTS)
            .doc(postId!)
            .delete()
            .catch((error) =>
                res.send({
                    success: false,
                    message: `Failed to delete post from Firestore. ${JSON.stringify(
                        error
                    )}.`,
                })
            );

        // delete comments
        const query = db
            .collection(DB_COLLECTIONS.COMMENTS)
            .where('postId', '==', postId);
        await deleteQueryBatch(db, query, () =>
            log(`Deleted comments from following post ID: ${postId}.`)
        ).catch((error) => {
            res.send({
                success: false,
                message: `Failed to delete comments from Firestore. ${JSON.stringify(
                    error
                )}.`,
            });
        });

        // delete content files
        const storage = getStorage().bucket();
        const contentFiles = post.data()?.contentFiles;
        contentFiles &&
            contentFiles.map((filePath: string) => {
                storage.file(filePath).delete({}, () => {
                    log(`Deleted file: ${filePath}.`);
                });
            });

        // delete post from Algolia
        const index = initAlgolia('posts');
        index
            ?.deleteBy({
                filters: `id:"${postId}"`,
            })
            .then(() => log('Deleted document from Algolia.'))
            .catch((error) =>
                log(
                    `Failed to delete document from Algolia. ${error.message}`,
                    false
                )
            );

        res.send({
            success: true,
        });
        next();
    } catch (error) {
        log(
            `Failed to delete post from Firestore. ${JSON.stringify(error)}.`,
            false
        );
        res.status(500).send({
            success: false,
            message:
                'Failed to delete post from Firestore. ' +
                JSON.stringify(error),
        });
    }
}
