import { Request, Response } from "express";
import { findProductById, updateProductThumbnailInDB } from "../../data/product.js";
import logger from "../../config/winston.js";
import { UploadedFile } from "express-fileupload";
import path from "node:path";
import fsp from "node:fs/promises";
import { v4 as uuidv4 } from 'uuid';
import { createFile, removeFile } from "../../data/file.js";
import { FileData } from "../../data/definitions.js";

const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');
const PICTURE_SIZE_LIMIT_MB = Number(process.env.PICTURE_SIZE_LIMIT_MB) || 0.5;

export default async function updateProductThumbnail(req: Request, res: Response) {
    try {
        const productID = Number(req.params.productID) || null;
        if (!productID) {
            res.status(400);
            res.json({
                msg: `Missing productID. Recieved: "${productID}".`
            });
            res.end();
            return;
        }
        const productData = await findProductById(productID);
        if (!productData) {
            res.status(400);
            res.json({
                msg: `Could not find product with ID: ${productID}.`
            });
            res.end();
            return;
        }
        const oldThumbnailIDToDelete = productData.thumbnailID;
        const thumbnailFile = req.files?.thumbnail as UploadedFile || null;
        if (!thumbnailFile) {
            res.status(400)
                .json({
                    msg: `No thumbnail was submitted.`
                })
                .end();
            return;
        } else if (thumbnailFile.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024) {
            res.status(400)
                .json({
                    msg: `The thumbnail exceeds the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`
                })
                .end();
            return;
        } else if (!['image/jpeg', 'image/png'].includes(thumbnailFile.mimetype)) {
            res.status(400)
                .json({
                    msg: `The thumbnail must be a PNG, JPG or JPEG file.`
                })
                .end();
            return;
        }
        const newThumbnailName = `${uuidv4()}---${thumbnailFile.name}`;
        thumbnailFile.name = newThumbnailName;
        await thumbnailFile.mv(`${PICS_STORAGE_PATH}/${newThumbnailName}`);
        const newThumbnailID = (await createFile(newThumbnailName) as FileData)?.fileID;
        if (!newThumbnailID) {
            res.status(400);
            res.json({
                msg: `Could not save new thumbnail.`
            });
            res.end();
            return;
        }
        // update product data in db
        const updatedProductData = await updateProductThumbnailInDB(newThumbnailID, productData.productID);
        if (!updatedProductData) {
            await removeFile(newThumbnailID);
            await fsp.rm(`${PICS_STORAGE_PATH}/${newThumbnailName}`);
            res.status(400);
            res.json({
                msg: `Could not upadate thumbnail in DB.`
            });
            res.end();
            return;
        }
        // delete old file from DB
        const deletedFile = await removeFile(oldThumbnailIDToDelete);
        // delete old file from system
        await fsp.rm(`${PICS_STORAGE_PATH}/${deletedFile.name}`);

        res.status(200);
        res.json({
            msg: 'Thumbnail updated.',
            payload: true
        });
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}