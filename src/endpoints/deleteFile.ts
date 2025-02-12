import type { Request, Response, NextFunction } from 'express';
import { getStorage } from 'firebase-admin/storage';
import { log } from '../utils/misc/log';

export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const storagePath = req.query.path && String(req.query.path);
  if (!storagePath) {
    res.send({
      success: false,
      message: 'Missing following parameter: path.',
    });
    return;
  }

  const storage = getStorage();
  const response = await storage
    .bucket()
    .file(storagePath)
    .delete()
    .catch((err) => {
      if (err) {
        log(
          `Failed to delete the following file: ${storagePath}. ${JSON.stringify(
            err
          )}.`,
          false
        );
        res.send({
          success: false,
          message: `Failed to delete the following file: ${storagePath}. ${JSON.stringify(
            err
          )}.`,
        });
      }
    });

  if (response) {
    log(`Deleted file: ${storagePath}.`);
    res.send({
      success: true,
    });
    next();
  }
}
