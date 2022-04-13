import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { addUserToAlgolia } from '../utils/algolia/addUserToAlgolia.js';
import { validateUserWithProvider } from '../utils/dataValidation/validateUserWithProvider.js';
import { log } from '../utils/misc/log.js';

export async function registerUserWithProvider(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // validate data
    const validation = validateUserWithProvider(req.body);
    if (!validation.success) {
        log(
            `Failed to register user due to validation failure. ${validation.message}.`,
            false
        );
        res.send({
            success: false,
            message: validation.message,
        });
        return;
    }

    // format data
    const userData = {
        id: req.body.id,
        name: req.body.name,
        photoURL:
            req.body.photoURL ||
            `https://avatars.dicebear.com/api/human/${req.body.name}.svg`,
    };

    // update Firebase Auth info
    const auth = getAuth();
    const response = await auth
        .updateUser(req.body.id, {
            displayName: userData.name,
            photoURL: userData.photoURL,
        })
        .catch((err) =>
            log(
                `Failed to update user\'s Firebase Auth information. ${err.message}.`,
                false
            )
        );
    if (response) log("Updated user's Firebase Auth information.");

    // add user to algolia
    const algoliaResponse = await addUserToAlgolia({
        objectID: userData.id,
        name: userData.name,
        photoURL: userData.photoURL,
    });
    res.send(algoliaResponse);

    next();
}
