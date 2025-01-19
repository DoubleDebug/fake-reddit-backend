import type { QuerySnapshot } from 'firebase-admin/firestore';

/**
 * @returns an array of raw data from firestore
 */
export function snapshotToData(snapshot: QuerySnapshot): any {
  const dataArray: any = [];
  snapshot.forEach((doc) => dataArray.push({ id: doc.id, ...doc.data() }));
  return dataArray;
}
