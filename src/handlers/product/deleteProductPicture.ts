import { Request, Response } from "express";
import { findProductById, updateProductPicturesInDB } from "../../data/product.js";
import logger from "../../config/winston.js";
import path from "node:path";
import fsp from "node:fs/promises";
import { getFileById, removeFile } from "../../data/file.js";

const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');

export default async function deletePictureOfProdcut(req: Request, res: Response) {
    try {
        const productID = Number(req.params.productID) || null;
        const pictureToDeleteID = Number(req.params.pictureToDeleteID) || null;
        if (!productID) {
            throw new Error(`Missing productID. Recieved: "${productID}".`);
        }
        if (!pictureToDeleteID) {
            throw new Error(`Missing ID of the picture to delete. Recieved: "${pictureToDeleteID}".`);
        }
        
        const queryResults = await Promise.all([
            findProductById(productID),
            getFileById(pictureToDeleteID)
        ]);
        const productData = queryResults[0];
        const fileData = queryResults[1];
        if (!productData) {
            throw new Error(`Could not find product with ID: ${productID}.`);
        }
        if (!fileData) {
            throw new Error(`Could not find file with ID: ${pictureToDeleteID}.`);
        }
        const deletedFile = await removeFile(pictureToDeleteID);
        if (!deletedFile) {
            throw new Error(`Could not delete file with ID: ${pictureToDeleteID} from DB.`);
        }
        const newPicturesIDs = productData.pictures.filter(id => id != pictureToDeleteID);
        const newProductData = await updateProductPicturesInDB(newPicturesIDs, productID);
        if (!newProductData) {
            throw new Error(`Could update product pictures in DB.`);
        }
        await fsp.rm(`${PICS_STORAGE_PATH}/${deletedFile.name}`);
        res.status(200);
        res.json({
            msg: 'Picture deleted.',
            payload: true
        });
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}