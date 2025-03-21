import { Request, Response } from "express";
import { findProductById, updateProductPicturesInDB, updateProductThumbnailInDB } from "../../data/product.js";
import logger from "../../config/winston.js";
import { UploadedFile } from "express-fileupload";
import path from "node:path";
import fsp from "node:fs/promises";
import { v4 as uuidv4 } from 'uuid';
import { createFile, removeFile } from "../../data/file.js";
import { FileData } from "../../data/definitions.js";

const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');
const PICTURE_SIZE_LIMIT_MB = Number(process.env.PICTURE_SIZE_LIMIT_MB) || 0.5;
const MAX_PICTURE_COUNT = Number(process.env.MAX_PICTURE_COUNT) || 5;

export default async function addProductPictures(req: Request, res: Response) {
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
        //check if product max pic count is reached
        const availablePictureSlots = MAX_PICTURE_COUNT - productData.pictures.length;
        if (availablePictureSlots <= 0) {
            res.status(400);
            res.json({
                msg: `The maximum picture count of ${MAX_PICTURE_COUNT} for the product is reached.`
            });
            res.end();
            return;
        }
        //check files
        let picturesFiles = req.files.pictures || null
        if (!picturesFiles) {
            res.status(400)
                .json({
                    msg: `No pictures were submitted.`
                })
                .end();
            return;
        }

        // if single picture place in array
        if (!(picturesFiles instanceof Array)) {
            picturesFiles = [req.files.pictures as UploadedFile];
        }

        if (picturesFiles.find(p => p.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024)) {
            res.status(400)
                .json({
                    msg: `One or more pictures exceed the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`
                })
                .end();
            return;
        }
        if (picturesFiles.length > availablePictureSlots) {
            res.status(400)
                .json({
                    msg: `You may upload no more than ${availablePictureSlots} pictures.`
                })
                .end();
            return;
        }
        if (picturesFiles.find(p => !['image/jpeg', 'image/png'].includes(p.mimetype))) {
            res.status(400)
                .json({
                    msg: `All pictures must be PNG, JPG or JPEG files.`
                })
                .end();
            return;
        }

        //change file names
        picturesFiles = picturesFiles.reduce((acc, cur) => {
            cur.name = `${uuidv4()}---${cur.name}`;
            acc.push(cur);
            return acc;
        }, []);

        //save files to DB
        const dbResults = await Promise.all(
            picturesFiles.reduce((acc, cur) => {
                acc.push(createFile(cur.name));
                return acc;
            }, []) as Array<Promise<FileData | boolean | null>>
        );

        //check if all files are saved in db
        if (dbResults.find(res => res == null || res == false)) {
            //if one or more files were not saved, delete saved files from db and end
            await Promise.all(
                dbResults.reduce((acc, cur) => {
                    if (cur) {
                        acc.push(removeFile((cur as FileData).fileID));
                    }
                    return acc;
                }, []) as Array<Promise<FileData | boolean | null>>
            );
            res.status(400)
                .json({
                    msg: `Could not save pictures in DB.`
                })
                .end();
            return;
        }
        //save files to system
        await Promise.all(
            picturesFiles.reduce((acc, cur) => {
                acc.push(cur.mv(`${PICS_STORAGE_PATH}/${cur.name}`));
                return acc;
            }, []) as Array<Promise<void>>
        );
        // update product data in db
        const allPicturesIDs = productData.pictures;
        dbResults.forEach(f => allPicturesIDs.push((f as FileData).fileID));
        const picturesUpdatedInDB = await updateProductPicturesInDB(allPicturesIDs, productData.productID)
        if (!picturesUpdatedInDB) {
            await Promise.all(
                dbResults.reduce((acc, cur) => {
                    if (cur) {
                        acc.push(removeFile((cur as FileData).fileID));
                    }
                    return acc;
                }, []) as Array<Promise<FileData | boolean | null>>
            );
            await Promise.all(
                picturesFiles.reduce((acc, cur) => {
                    acc.push(fsp.rm(`${PICS_STORAGE_PATH}/${cur.name}`));
                    return acc;
                }, []) as Array<Promise<void>>
            );
            res.status(400)
                .json({
                    msg: `Could not update product pictures in DB.`
                })
                .end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Pictures added.',
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