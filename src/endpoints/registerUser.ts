import { Request, Response, NextFunction } from 'express';
import { validateUserData } from '../utils/dataValidation/validateUserData.js';
import { initAlgolia } from '../utils/misc/initAlgolia.js';

export async function registerUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // validate data
    if (!validateUserData(req.body)) {
        const errorMessage = 'Bad data parameter(s).';
        console.log(errorMessage);
        res.status(400).send({
            success: false,
            message: errorMessage,
        });
        return;
    }

    // init Algolia index
    const index = initAlgolia('users');
    if (!index) {
        const errorMessage = 'Failed to initialize Algolia client.';
        console.log(errorMessage);
        res.status(500).send({
            success: false,
            message: errorMessage,
        });
        return;
    }

    // add user to Algolia
    index
        .saveObject({
            objectID: req.body.id,
            name: req.body.name,
            photoURL: req.body.photoURL,
        })
        .then(() => console.log('Successfully added user to Algolia.'))
        .catch((err) => {
            const errorMessage = 'Failed to add user to Algolia.';
            console.log(errorMessage, err);
            res.status(500).send({
                success: false,
                message: errorMessage,
            });
        });

    res.status(200).send({
        success: true,
    });
    next();
}
