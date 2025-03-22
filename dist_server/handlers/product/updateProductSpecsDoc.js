import { findProductById, updateProductSpecsDocRefInDB } from "../../data/product.js";
import logger from "../../config/winston.js";
import path from "node:path";
import fsp from "node:fs/promises";
import { createFile, getFileById, removeFile } from "../../data/file.js";
import { v4 as uuidv4 } from 'uuid';
const DOCS_STORAGE_PATH = path.resolve('./fileStorage/docs');
const PDF_SIZE_LIMIT_MB = Number(process.env.PDF_SIZE_LIMIT_MB) || 4;
export default async function updateProductSpecsDoc(req, res) {
    try {
        const newSpecsDocFile = req.files.specsDoc || null;
        if (!newSpecsDocFile) {
            throw new Error('No files were uploaded.');
        }
        if (newSpecsDocFile.size > PDF_SIZE_LIMIT_MB * 1024 * 1024) {
            throw new Error(`The specifications document exceeds the size limit of ${PDF_SIZE_LIMIT_MB}MB.`);
        }
        else if (newSpecsDocFile.mimetype !== 'application/pdf') {
            throw new Error('The specifications document must be a PDF file.');
        }
        const productID = Number(req.params.productID) || null;
        if (!productID) {
            throw new Error(`Missing productID. Recieved: "${productID}".`);
        }
        const oldProductData = await findProductById(productID);
        if (!oldProductData) {
            throw new Error(`Could not find product with ID: ${productID}.`);
        }
        // create new file
        newSpecsDocFile.name = `${uuidv4()}---${newSpecsDocFile.name}`;
        const newSpecsDocFileData = await createFile(newSpecsDocFile.name);
        if (!newSpecsDocFileData) {
            throw new Error('Could not create a new file in DB.');
        }
        newSpecsDocFile.mv(`${DOCS_STORAGE_PATH}/${newSpecsDocFile.name}`);
        // change reference in product
        const newProductData = await updateProductSpecsDocRefInDB(newSpecsDocFileData.fileID, productID);
        if (!newProductData) {
            throw new Error('Could not update document reference for product.');
        }
        const oldFileData = await getFileById(oldProductData.specsDocID);
        if (oldFileData) {
            // specsDoc file available; must delete
            // delete old file
            const deletedFile = await removeFile(oldFileData.fileID);
            if (!deletedFile) {
                throw new Error(`Could not delete file with ID: ${oldFileData.fileID} from DB.`);
            }
            //delete old file from system 
            await fsp.rm(`${DOCS_STORAGE_PATH}/${deletedFile.name}`);
        }
        res.status(200);
        res.json({
            msg: 'Document updated.',
            payload: true
        });
        res.end();
    }
    catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}
//# sourceMappingURL=updateProductSpecsDoc.js.map