import express from 'express';
import cron from 'node-cron';
import { CONFIG } from './utils/misc/setupConfig.js';
import { setupMiddleware } from './utils/middleware/setupMiddleware.js';
import { isSignedIn } from './utils/middleware/isSignedIn.js';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.js';
import { getPosts } from './endpoints/getPosts.js';
import { getPostsCustom } from './endpoints/getPostsCustom.js';
import { deletePost } from './endpoints/deletePost.js';
import { deleteFile } from './endpoints/deleteFile.js';
import { submitPost } from './endpoints/submitPost.js';
import { deleteUnusedFiles } from './utils/firestore/deleteUnusedFiles.js';
import { registerUserWithProvider } from './endpoints/registerUserWithProvider.js';
import { registerUserWithEmail } from './endpoints/registerUserWithEmail.js';
import { getUserEmailByUsername } from './endpoints/getUserEmailByUsername.js';
import { deleteUser } from './endpoints/deleteUser.js';
import { isAdmin } from './utils/middleware/isAdmin.js';
import { banUser } from './endpoints/banUser.js';
import { deleteComment } from './endpoints/deleteComment.js';
import { log } from './utils/misc/log.js';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/getFeed', getPosts);
app.get('/getCustomFeed', isSignedIn, getPostsCustom);
app.get('/getUserPhotoURL/:uid', getUserPhotoURL);
app.get('/getUserEmailByUsername', getUserEmailByUsername);
app.post('/registerUserWithProvider', registerUserWithProvider);
app.post('/registerUserWithEmail', registerUserWithEmail);
app.post('/submitPost', isSignedIn, submitPost);
app.delete('/deletePost', isSignedIn, deletePost);
app.delete('/deleteComment', isSignedIn, deleteComment);
app.delete('/deleteFile', isSignedIn, deleteFile);
app.delete('/deleteUser', isSignedIn, deleteUser);
app.delete('/banUser', isSignedIn, isAdmin, banUser);

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
    console.log('----------------------------------------------------------');
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
