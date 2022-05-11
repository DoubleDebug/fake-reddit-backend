import express from 'express';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
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
import { deleteAccount } from './endpoints/deleteAccount.js';
import { isAdmin } from './utils/middleware/isAdmin.js';
import { banAccount } from './endpoints/banAccount.js';
import { deleteComment } from './endpoints/deleteComment.js';
import { log } from './utils/misc/log.js';
import { getUserPosts } from './endpoints/getUserPosts.js';
import { getUserComments } from './endpoints/getUserComments.js';
import { getSavedPosts } from './endpoints/getSavedPosts.js';
import { submitSubreddit } from './endpoints/submitSubreddit.js';
import { updateAccount } from './endpoints/updateAccount.js';
import { deleteUserAvatars } from './utils/firestore/deleteUserAvatars.js';
import { readFileSync } from 'fs';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/posts', getPosts);
app.get('/posts/custom', isSignedIn, getPostsCustom);
app.get('/user/posts', getUserPosts);
app.get('/user/comments', getUserComments);
app.get('/user/saved-posts', isSignedIn, getSavedPosts);
app.get('/user/avatar/:uid', getUserPhotoURL);
app.get('/user/email', getUserEmailByUsername);
app.post('/register/with-provider', registerUserWithProvider);
app.post('/register/with-email', registerUserWithEmail);
app.post('/posts', isSignedIn, submitPost);
app.post('/subreddits', isSignedIn, submitSubreddit);
app.patch('/user/account', isSignedIn, updateAccount);
app.delete('/posts', isSignedIn, deletePost);
app.delete('/comments', isSignedIn, deleteComment);
app.delete('/files', isSignedIn, deleteFile);
app.delete('/user/account', isSignedIn, deleteAccount);
app.delete('/user/ban', isSignedIn, isAdmin, banAccount);

// DOCS
const apiDocument = readFileSync('./docs/OpenAPI.json', 'utf-8');
const apiDocumentJson = JSON.parse(apiDocument);
app.get('/', swaggerUi.setup(apiDocumentJson));

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
    // delete all temporary user avatar images
    deleteUserAvatars();
});

// cron.schedule('0 0 * * 1', async () => {
//     // delete chat rooms collection every Monday
//     await deleteCollection(DB_COLLECTIONS.CHAT_ROOMS);
// });
