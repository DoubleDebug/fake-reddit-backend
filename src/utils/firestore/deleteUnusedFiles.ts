import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { DB_COLLECTIONS, STORAGE_FOLDERS } from '../misc/constants.js';
import { log } from '../misc/log.js';

export async function deleteUnusedFiles() {
    const storage = getStorage();
    const res = await storage.bucket().getFiles({
        prefix: STORAGE_FOLDERS.CONTENT,
    });
    const allFiles = res[0].map((f) => f.name);
    const filesToDelete: { name: string; task: Promise<any> }[] = [];

    for (let i = 0; i < allFiles.length; i++) {
        const currentFile = allFiles[i];
        const firestore = getFirestore();
        const postsWithFile = await firestore
            .collection(DB_COLLECTIONS.POSTS)
            .where('contentFiles', 'array-contains', currentFile)
            .get();

        if (postsWithFile.empty) {
            // delete file if unused
            const promise = storage.bucket().file(currentFile).delete();
            filesToDelete.push({ name: currentFile, task: promise });
        }
    }

    if (filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map((f) => f.task));

        log('Deleted the following unused files:');
        filesToDelete.forEach((f) => log(`     ${f.name}`));
    }
}
