import { Request, Response, NextFunction } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { deleteQueryBatch } from '../utils/firestore/deleteQueryBatch.js';
import { DB_COLLECTIONS } from '../utils/misc/constants.js';
import { log } from '../utils/misc/log.js';

export async function deleteComment(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // get comment id
    const cid = req.query.id && String(req.query.id);
    if (!cid) {
        res.send({
            success: false,
            message: 'The comment ID is required.',
        });
        return;
    }

    // check if user is author
    const uid = res.locals.decodedToken && res.locals.decodedToken.uid;
    if (!uid) {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }
    const db = getFirestore();
    const commentDoc = await db
        .collection(DB_COLLECTIONS.COMMENTS)
        .doc(cid)
        .get();
    const commentData = commentDoc.data();
    if (!commentData || commentData.authorId !== uid) {
        res.send({
            success: false,
            message: 'Only the author of the comment can delete it.',
        });
        return;
    }

    // delete comment
    await db
        .collection(DB_COLLECTIONS.COMMENTS)
        .doc(cid)
        .delete()
        .catch((error) =>
            res.send({
                success: false,
                message: `Failed to delete comment from Firestore. ${JSON.stringify(
                    error
                )}.`,
            })
        );
    log(`Deleted comment with the following ID: ${cid}.`);

    // delete replies
    const query = db
        .collection(DB_COLLECTIONS.COMMENTS)
        .where('parentCommentId', '==', cid);
    await deleteQueryBatch(db, query, () =>
        log(`Deleted comment replies.`)
    ).catch((error) => {
        res.send({
            success: false,
            message: `Failed to delete comments replies from Firestore. ${JSON.stringify(
                error
            )}.`,
        });
        log(`Failed to delete comment replies. ${error.message}`, false);
    });

    res.send({
        success: true,
    });

    next();
}
