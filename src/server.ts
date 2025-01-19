import express from 'express';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import { CONFIG } from './utils/misc/setupConfig.ts';
import { setupMiddleware } from './utils/middleware/setupMiddleware.ts';
import { isSignedIn } from './utils/middleware/isSignedIn.ts';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.ts';
import { getPosts } from './endpoints/getPosts.ts';
import { getPostsCustom } from './endpoints/getPostsCustom.ts';
import { deletePost } from './endpoints/deletePost.ts';
import { deleteFile } from './endpoints/deleteFile.ts';
import { submitPost } from './endpoints/submitPost.ts';
import { deleteUnusedFiles } from './utils/firestore/deleteUnusedFiles.ts';
import { registerUserWithProvider } from './endpoints/registerUserWithProvider.ts';
import { registerUserWithEmail } from './endpoints/registerUserWithEmail.ts';
import { getUserEmailByUsername } from './endpoints/getUserEmailByUsername.ts';
import { deleteAccount } from './endpoints/deleteAccount.ts';
import { isAdmin } from './utils/middleware/isAdmin.ts';
import { banAccount } from './endpoints/banAccount.ts';
import { deleteComment } from './endpoints/deleteComment.ts';
import { log } from './utils/misc/log.ts';
import { getUserPosts } from './endpoints/getUserPosts.ts';
import { getUserComments } from './endpoints/getUserComments.ts';
import { getSavedPosts } from './endpoints/getSavedPosts.ts';
import { submitSubreddit } from './endpoints/submitSubreddit.ts';
import { updateAccount } from './endpoints/updateAccount.ts';
import { deleteUserAvatars } from './utils/firestore/deleteUserAvatars.ts';
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
