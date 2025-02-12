import { getFirestore } from 'firebase-admin/firestore';
import type { ResponseStatus } from '../../types';
import { DB_COLLECTIONS } from '../misc/constants';

export async function validateSubreddit(data: any): Promise<ResponseStatus> {
  if (!data || !data.id) {
    return {
      success: false,
      message: `Invalid data parameter: ID.`,
    };
  }

  // subreddit name uniqueness
  const db = getFirestore();
  const subredditsWithSameName = await db
    .collection(DB_COLLECTIONS.SUBREDDITS)
    .doc(data.id)
    .get();
  if (subredditsWithSameName.exists) {
    return {
      success: false,
      message: `Subreddit with the same name already exists.`,
    };
  }

  // remove unnecessary fields
  delete data.id;
  if (data.flairs.length === 0) {
    delete data.flairs;
  }
  if (data.photoURL === '') {
    delete data.photoURL;
  }

  return {
    success: true,
  };
}
