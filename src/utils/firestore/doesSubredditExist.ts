import { Firestore } from 'firebase-admin/firestore';
import { DB_COLLECTIONS } from '../constants.js';

export async function doesSubredditExist(
    db: Firestore,
    subredditName: string | undefined
): Promise<boolean> {
    if (!subredditName) return false;
    if (subredditName.length < 3) return false;

    return (
        await db.collection(DB_COLLECTIONS.SUBREDDITS).doc(subredditName).get()
    ).exists;
}
