import { Firestore, getFirestore, Query } from 'firebase-admin/firestore';
import { DELETE_BATCH_SIZE } from '../constants.js';

/**
 * Example code from Firebase documentation:
 * https://firebase.google.com/docs/firestore/manage-data/delete-data#node.js_2
 *
 * Deletes a whole collection in smaller batches to avoid out-of-memory errors.
 */
export async function deleteCollection(collectionName: string): Promise<void> {
    const db = getFirestore();
    const collectionRef = db.collection(collectionName);
    const query = collectionRef.orderBy('createdAt').limit(DELETE_BATCH_SIZE);

    return new Promise(() => {
        const resolve = () =>
            console.log('Successfully deleted chatRooms collection.');
        const reject = () =>
            console.log('Failed to  delete chatRooms collection.');
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(
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
