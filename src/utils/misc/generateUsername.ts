import { getFirestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from './constants';
import { generateRandomNumber } from './generateRandomNumber';

/**
 * @returns a unique username in the format: "user1234".
 * Maximum number of tries: 10.
 */
export async function generateUsername(): Promise<string> {
  let usernameExists = true;
  let username = '';
  let numOfTries = 0;

  while (usernameExists && numOfTries < 10) {
    // generate username
    const userNumber = generateRandomNumber([1000, 10000]);
    username = `user${userNumber}`;

    // check if username already exists
    const db = getFirestore();
    const usersWithSameUsername = await db
      .collection(DB_COLLECTIONS.USERS)
      .where('username', '==', username)
      .get();
    if (usersWithSameUsername.empty) {
      usernameExists = false;
    }
    numOfTries++;
  }

  return username;
}
