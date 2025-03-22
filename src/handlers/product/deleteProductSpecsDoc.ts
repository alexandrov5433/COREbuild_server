import { Request, Response } from "express";
import { findProductById, updateProductPicturesInDB, updateProductSpecsDocRefInDB } from "../../data/product.js";
import logger from "../../config/winston.js";
import path from "node:path";
import fsp from "node:fs/promises";
import { getFileById, removeFile } from "../../data/file.js";

const DOCS_STORAGE_PATH = path.resolve('./fileStorage/docs');

export default async function deleteProductSpecsDoc(req: Request, res: Response) {
    try {
        const productID = Number(req.params.productID) || null;
        const specsDocToDeleteID = Number(req.params.specsDocToDeleteID) || null;
        if (!productID) {
            throw new Error(`Missing productID. Recieved: "${productID}".`);
        }
        if (!specsDocToDeleteID) {
            throw new Error(`Missing ID of the picture to delete. Recieved: "${specsDocToDeleteID}".`);
        }
        
        const queryResults = await Promise.all([
            findProductById(productID),
            getFileById(specsDocToDeleteID)
        ]);
        const productData = queryResults[0];
        const fileData = queryResults[1];
        if (!productData) {
            throw new Error(`Could not find product with ID: ${productID}.`);
        }
        if (!fileData) {
            throw new Error(`Could not find file with ID: ${specsDocToDeleteID}.`);
        }
        if (fileData.fileID != productData.specsDocID) {
            throw new Error(`The file with ID: ${specsDocToDeleteID} is not a document for the product with ID: ${productID}.`);
        }
        const deletedFile = await removeFile(specsDocToDeleteID);
        if (!deletedFile) {
            throw new Error(`Could not delete file with ID: ${specsDocToDeleteID} from DB.`);
        }
        // delete reference from product
        const newProductData = await updateProductSpecsDocRefInDB(null, productID);
        if (!newProductData) {
            throw new Error('Could not update document reference for product.');
        }
        //delete file from system 
        await fsp.rm(`${DOCS_STORAGE_PATH}/${deletedFile.name}`);
        res.status(200);
        res.json({
            msg: 'Document deleted.',
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