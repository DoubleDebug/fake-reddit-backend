import express from 'express';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import { CONFIG } from './utils/misc/setupConfig';
import { setupMiddleware } from './utils/middleware/setupMiddleware';
import { isSignedIn } from './utils/middleware/isSignedIn';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL';
import { getPosts } from './endpoints/getPosts';
import { getPostsCustom } from './endpoints/getPostsCustom';
import { deletePost } from './endpoints/deletePost';
import { deleteFile } from './endpoints/deleteFile';
import { submitPost } from './endpoints/submitPost';
import { deleteUnusedFiles } from './utils/firestore/deleteUnusedFiles';
import { registerUserWithProvider } from './endpoints/registerUserWithProvider';
import { registerUserWithEmail } from './endpoints/registerUserWithEmail';
import { getUserEmailByUsername } from './endpoints/getUserEmailByUsername';
import { deleteAccount } from './endpoints/deleteAccount';
import { isAdmin } from './utils/middleware/isAdmin';
import { banAccount } from './endpoints/banAccount';
import { deleteComment } from './endpoints/deleteComment';
import { log } from './utils/misc/log';
import { getUserPosts } from './endpoints/getUserPosts';
import { getUserComments } from './endpoints/getUserComments';
import { getSavedPosts } from './endpoints/getSavedPosts';
import { submitSubreddit } from './endpoints/submitSubreddit';
import { updateAccount } from './endpoints/updateAccount';
import { deleteUserAvatars } from './utils/firestore/deleteUserAvatars';
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
