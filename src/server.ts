import express from 'express';
import { CONFIG } from './utils/setupConfig.js';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.js';
import { setupMiddleware } from './utils/setupMiddleware.js';
import { getPosts } from './endpoints/getPosts.js';
import cron from 'node-cron';
import { deleteCollection } from './utils/firestore/deleteAllChatRooms.js';
import { DB_COLLECTIONS } from './utils/constants.js';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/userPhotoURL/:uid', getUserPhotoURL);
app.get('/feed', getPosts);

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    console.log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
});

// FIRESTORE MAINTENANCE
cron.schedule('0 0 * * 1', async () => {
    // delete chat rooms collection every Monday
    await deleteCollection(DB_COLLECTIONS.CHAT_ROOMS);
});
