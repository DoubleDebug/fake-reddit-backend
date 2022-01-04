import { Firestore, Query } from 'firebase-admin/firestore';

/**
 * Example code from Firebase documentation:
 * https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2
 *
 * Deletes documents matching the query in smaller batches to avoid out-of-memory errors.
 */
export async function deleteQueryBatch(
    db: Firestore,
    query: Query,
    resolve: () => void
) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}
