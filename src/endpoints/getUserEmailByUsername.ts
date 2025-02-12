import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../utils/misc/constants';

export async function getUserEmailByUsername(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // validate username
  const username = req.query.username;
  if (!username) {
    res.send({
      success: false,
      message: 'Username was not provided.',
    });
    return;
  }

  // get user id
  const db = getFirestore();
  const snapshot = await db
    .collection(DB_COLLECTIONS.USERS)
    .where('username', '==', username)
    .get()
    .catch((err) => {
      res.send({
        success: false,
        message: `Failed to perform Firebase query. ${err.message}.`,
      });
    });
  if (!snapshot) return;
  if (snapshot.empty) {
    res.send({
      success: false,
      message: 'Provided username does not exist.',
    });
    return;
  }
  const auth = getAuth();
  const uid = snapshot.docs.at(0)?.id;
  if (!uid) {
    res.send({
      success: false,
      message: "Failed to find user's ID.",
    });
    return;
  }

  // get user's email
  const userInfo = await auth.getUser(uid);
  if (!userInfo.email) {
    res.send({
      success: false,
      message: 'User does not have an email address.',
    });
    return;
  }

  res.send({
    success: true,
    data: userInfo.email,
  });
  next();
}
