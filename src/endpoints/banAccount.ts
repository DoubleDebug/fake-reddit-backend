import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { log } from '../utils/misc/log.js';

export async function banAccount(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // get user id
    const uid = req.query.uid && String(req.query.uid);
    if (!uid) {
        res.send({
            success: false,
            message: 'The user ID is required.',
        });
        return;
    }

    // ban user
    const auth = getAuth();
    const response = await auth
        .updateUser(uid, {
            disabled: true,
        })
        .catch((err) => {
            log(
                `Failed to ban user with the following id: ${uid}. Reason: ${JSON.stringify(
                    err
                )}`,
                false
            );
            res.send({
                success: false,
                message: 'Failed to ban the user.',
            });
        });

    if (response) {
        res.send({ success: true });
        next();
    }
}
