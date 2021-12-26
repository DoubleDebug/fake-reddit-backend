import express from 'express';
import { CONFIG } from './utils/setupConfig.js';
import { getUserPhotoURL } from './endpoints/getUserPhotoURL.js';
import { setupMiddleware } from './utils/setupMiddleware.js';

const app = express();
setupMiddleware(app);

// ROUTES
app.get('/getUserPhotoURL/:uid', getUserPhotoURL);

// STARTING SERVER
app.listen(CONFIG.PORT, CONFIG.HOSTNAME, () => {
    console.log(`Server started at http://${CONFIG.HOSTNAME}:${CONFIG.PORT}`);
});
