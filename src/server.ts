import express from 'express';
import { CONFIG } from './utils/misc/setupConfig.js';
import { setupMiddleware } from './utils/misc/setupMiddleware.js';
import { auth } from './utils/middleware/auth.js';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.js';
import { getPosts } from './endpoints/getPosts.js';
import { deletePost } from './endpoints/deletePost.js';
import { deleteFile } from './endpoints/deleteFile.js';
import { submitPost } from './endpoints/submitPost.js';
import { deleteUnusedFiles } from './utils/firestore/deleteUnusedFiles.js';
import cron from 'node-cron';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/userPhotoURL/:uid', getUserPhotoURL);
app.get('/feed', getPosts);
app.delete('/deletePost', auth, deletePost);
app.delete('/deleteFile', auth, deleteFile);
app.post('/submitPost', auth, submitPost);

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    console.log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
});

// FIREBASE MAINTENANCE
cron.schedule('0 0 * * 1', () => {
    // delete all unused content from storage every Monday
    // (cancelled post submission)
    deleteUnusedFiles();
});

// cron.schedule('0 0 * * 1', async () => {
//     // delete chat rooms collection every Monday
//     await deleteCollection(DB_COLLECTIONS.CHAT_ROOMS);
// });
