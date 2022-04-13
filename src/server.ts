import express from 'express';
import cron from 'node-cron';
import { CONFIG } from './utils/misc/setupConfig.js';
import { setupMiddleware } from './utils/middleware/setupMiddleware.js';
import { auth } from './utils/middleware/auth.js';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.js';
import { getPosts } from './endpoints/getPosts.js';
import { deletePost } from './endpoints/deletePost.js';
import { deleteFile } from './endpoints/deleteFile.js';
import { submitPost } from './endpoints/submitPost.js';
import { deleteUnusedFiles } from './utils/firestore/deleteUnusedFiles.js';
import { registerUserWithProvider } from './endpoints/registerUserWithProvider.js';
import { registerUserWithEmail } from './endpoints/registerUserWithEmail.js';
import { getUserEmailByUsername } from './endpoints/getUserEmailByUsername.js';
import { deleteUser } from './endpoints/deleteUser.js';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/getFeed', getPosts);
app.get('/getUserPhotoURL/:uid', getUserPhotoURL);
app.get('/getUserEmailByUsername', getUserEmailByUsername);
app.post('/registerUserWithProvider', registerUserWithProvider);
app.post('/registerUserWithEmail', registerUserWithEmail);
app.post('/submitPost', auth, submitPost);
app.delete('/deletePost', auth, deletePost);
app.delete('/deleteFile', auth, deleteFile);
app.delete('/deleteUser', auth, deleteUser);

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    console.log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
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
