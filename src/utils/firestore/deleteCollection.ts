import { getFirestore } from 'firebase-admin/firestore';
import { DELETE_BATCH_SIZE } from '../constants.js';
import { deleteQueryBatch } from './deleteQueryBatch.js';

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
            console.log(`Successfully deleted ${collectionName} collection.`);
        const reject = () =>
            console.log(`Failed to  delete ${collectionName} collection.`);
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}
