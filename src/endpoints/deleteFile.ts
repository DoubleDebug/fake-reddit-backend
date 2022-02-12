import { Request, Response, NextFunction } from 'express';
import { getStorage } from 'firebase-admin/storage';

export async function deleteFile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const storagePath = req.query.path && String(req.query.path);
    if (!storagePath) {
        res.status(400).send({
            success: false,
            message: 'Missing following parameter: path.',
        });
        return;
    }

    const storage = getStorage();
    storage
        .bucket()
        .file(storagePath)
        .delete((err, _) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: `Failed to delete the following file: ${storagePath}. Error: ${JSON.stringify(
                        err
                    )}.`,
                });
                return;
            }

            console.log(`Successfully deleted file: ${storagePath}.`);
            res.status(200).send({
                success: true,
            });
            next();
        });
}
