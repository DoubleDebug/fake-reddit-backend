import { getStorage } from 'firebase-admin/storage';
import { STORAGE_FOLDERS } from '../misc/constants.js';
import { log } from '../misc/log.js';

export async function deleteUserAvatars() {
    const storage = getStorage();
    const listOfFiles = await storage.bucket().getFiles({
        prefix: STORAGE_FOLDERS.USER_AVATARS,
    });
    const allFiles = listOfFiles[0].map((f) => f.name);
    const deletionTasks = allFiles.map((f) =>
        storage.bucket().file(f).delete()
    );
    if (deletionTasks.length > 0) {
        await Promise.all(deletionTasks);

        log('Deleted the following user avatar images:');
        allFiles.forEach((f) => log(`     ${f}`));
    }
}
