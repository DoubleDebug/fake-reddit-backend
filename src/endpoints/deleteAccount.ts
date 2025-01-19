import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/misc/constants.ts';
import { initAlgolia } from '../utils/algolia/initAlgolia.ts';
import { log } from '../utils/misc/log.ts';

export async function deleteAccount(
  _: Request,
  res: Response,
  next: NextFunction
) {
  const uid = res.locals.decodedToken.uid;

  // sign out user everywhere
  const auth = getAuth();
  await auth.revokeRefreshTokens(uid);

  // delete user from Firestore
  const db = getFirestore();
  const firestoreResponse = await db
    .collection(DB_COLLECTIONS.USERS)
    .doc(uid)
    .delete()
    .catch((err) =>
      log(`Failed to delete user from Firestore. ${err.message}.`, false)
    );
  if (firestoreResponse) log(`Deleted user from Firestore: ${uid}.`);

  // delete user from Algolia
  const index = initAlgolia('users');
  index
    ?.deleteObject(uid)
    .then(() => log(`Deleted user from Algolia.`))
    .catch((error: any) =>
      log(`Failed to delete user from Algolia. ${error}`, false)
    );

  // delete user from Firebase Auth
  await auth
    .deleteUser(uid)
    .catch((err) =>
      log(`Failed to delete user from Firebase auth. ${err.message}.`, false)
    );
  log(`Deleted user from Firebase auth.`);

  res.send({
    success: true,
  });
  next();
}
