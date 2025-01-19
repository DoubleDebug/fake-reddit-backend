import type { Firestore } from 'firebase-admin/firestore';

/**
 * @returns TRUE if the document exists in the Firestore database
 */
export async function doesDocumentExist(
  db: Firestore,
  collectionId: string,
  documentId: string | undefined
): Promise<boolean> {
  if (!documentId) return false;
  return (await db.collection(collectionId).doc(documentId).get()).exists;
}
