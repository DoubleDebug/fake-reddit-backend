import { getFirestore } from 'firebase-admin/firestore';
import { DELETE_BATCH_SIZE } from '../misc/constants';
import { log } from '../misc/log';
import { deleteQueryBatch } from './deleteQueryBatch';

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
    const resolve = () => log(`Deleted ${collectionName} collection.`);
    const reject = () =>
      log(`Failed to  delete ${collectionName} collection.`, false);
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}
