import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { addUserToAlgolia } from '../utils/algolia/addUserToAlgolia';
import { validateUserWithProvider } from '../utils/dataValidation/validateUserWithProvider';
import { DB_COLLECTIONS } from '../utils/misc/constants';
import { generateUsername } from '../utils/misc/generateUsername';
import { log } from '../utils/misc/log';

export async function registerUserWithProvider(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // validate data
  const validation = validateUserWithProvider(req.body);
  if (!validation.success) {
    log(
      `Failed to register user due to validation failure. ${validation.message}.`,
      false
    );
    res.send({
      success: false,
      message: validation.message,
    });
    return;
  }

  // format data
  const userData = {
    id: req.body.id,
    name: req.body.name,
    photoURL:
      req.body.photoURL ||
      `https://api.dicebear.com/9.x/micah/svg?seed=${req.body.name}`,
  };

  // update Firebase Auth info
  const auth = getAuth();
  const authResponse = await auth
    .updateUser(req.body.id, {
      displayName: userData.name,
      photoURL: userData.photoURL,
    })
    .catch((err) =>
      log(
        `Failed to update user\'s Firebase Auth information. ${err.message}.`,
        false
      )
    );
  if (authResponse) log("Updated user's Firebase Auth information.");

  // update Firestore info
  const db = getFirestore();
  const firestoreResponse = await db
    .collection(DB_COLLECTIONS.USERS)
    .doc(userData.id)
    .set({
      username: await generateUsername(),
      lastOnline: Timestamp.now(),
      savedPosts: [],
      karma: 0,
      cakeDay: Timestamp.now(),
    });
  if (firestoreResponse) log("Updated user's Firestore profile information.");

  // add user to algolia
  const algoliaResponse = await addUserToAlgolia({
    objectID: userData.id,
    name: userData.name,
    photoURL: userData.photoURL,
  });
  if (algoliaResponse.success) {
    log("Added user's data to Algolia.");
  } else {
    log("Failed to add user's data to Algolia.", false);
  }

  res.send({
    success: true,
    data: {
      id: userData.id,
      username: userData.name,
      photoURL: userData.photoURL,
    },
  });
  next();
}
