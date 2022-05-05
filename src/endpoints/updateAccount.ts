import { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { validateAccountData } from '../utils/dataValidation/validateAccountData.js';
import { log } from '../utils/misc/log.js';
import { uploadToImgur } from '../utils/misc/uploadToImgur.js';

/**
 * BODY PARAMETERS:
 *  - email (optional)
 *  - password (optional)
 *  - displayName (optional)
 *  - photoURL (optional)
 */
export async function updateAccount(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const decodedToken = res.locals.decodedToken;
    const uid = decodedToken.uid;
    if (!decodedToken || !uid) {
        res.send({
            success: false,
            message: 'Unauthorized request.',
        });
        return;
    }

    // get parameters
    const email: string | undefined = req.body.email && String(req.body.email);
    const password: string | undefined =
        req.body.password && String(req.body.password);
    const displayName: string | undefined =
        req.body.displayName && String(req.body.displayName);
    const photoURL: string | undefined =
        req.body.photoURL && String(req.body.photoURL);

    // validate data
    const v_response = await validateAccountData(uid, {
        email: email,
        password: password,
        displayName: displayName,
        photoURL: photoURL,
    });
    if (!v_response.success) {
        res.send(v_response);
        return;
    }

    // upload avatar photo to Imgur
    if (v_response.data.photoURL) {
        const imgur_url = await uploadToImgur(v_response.data.photoURL);
        if (imgur_url) {
            v_response.data.photoURL = imgur_url;
        } else {
            log(`Failed to upload user avatar to Imgur.`, false);
        }
    }

    // update account
    const auth = getAuth();
    const updateResponse = await auth
        .updateUser(uid, v_response.data)
        .catch((error) => {
            log(`Failed to update user's account. ${error.message}`, false);
            res.send({
                success: false,
                message: error.message,
            });
        });

    if (updateResponse) {
        log(`Updated user's account with the following data:`);
        console.log(v_response.data);
        res.send({
            success: true,
        });
        next();
    }
}
