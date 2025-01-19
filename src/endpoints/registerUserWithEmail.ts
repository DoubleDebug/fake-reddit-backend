import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { addUserToAlgolia } from "../utils/algolia/addUserToAlgolia.ts";
import { validateUserWithEmail } from "../utils/dataValidation/validateUserWithEmail.ts";
import { DB_COLLECTIONS } from "../utils/misc/constants.ts";
import { log } from "../utils/misc/log.ts";

export async function registerUserWithEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // validate data
  const validation = await validateUserWithEmail(req.body);
  if (!validation.success) {
    log(
      `Failed to register user due to validation failure. ${validation.message}`,
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
    id: "",
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    photoURL: `https://avatars.dicebear.com/api/human/${req.body.username}.svg`,
  };

  // create user in Firebase Auth
  const auth = getAuth();
  const response = await auth
    .createUser({
      email: userData.email,
      displayName: userData.username,
      password: userData.password,
      photoURL: userData.photoURL,
    })
    .catch((error) => {
      log(`Failed to create a new user. ${error.message}`, false);
      res.send({
        success: false,
        message: error.message,
      });
    });

  if (response) {
    userData.id = response.uid;
    log(`Created a new user: ${response.uid}.`);

    // add username to Firestore
    const db = getFirestore();
    const firestoreResponse = await db
      .collection(DB_COLLECTIONS.USERS)
      .doc(response.uid)
      .set({
        username: userData.username,
        lastOnline: Timestamp.now(),
        savedPosts: [],
        karma: 0,
        cakeDay: Timestamp.now(),
      })
      .catch((err) =>
        log(`Failed to add user to Firestore. ${err.message}.`, false)
      );

    if (firestoreResponse) {
      log(`Added user's data to Firestore.`);
    }
  } else return;

  // add user to algolia
  const algoliaResponse = await addUserToAlgolia({
    objectID: userData.id,
    name: userData.username,
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
      username: userData.username,
      photoURL: userData.photoURL,
    },
  });
  next();
}
