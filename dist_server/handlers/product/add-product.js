import path from "node:path";
import { v4 as uuidv4 } from 'uuid';
import { createFile } from "../../data/file.js";
import { createProduct } from "../../data/product.js";
import { createCategory } from "../../data/category.js";
import logger from "../../config/winston.js";
import { reduceSpacesBetweenWordsToOne } from "../../util/string.js";
import { toCent } from "../../util/currency.js";
const DOCS_STORAGE_PATH = path.resolve('./fileStorage/docs');
const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');
const MAX_PICTURE_COUNT = Number(process.env.MAX_PICTURE_COUNT) || 5;
const PICTURE_SIZE_LIMIT_MB = Number(process.env.PICTURE_SIZE_LIMIT_MB) || 0.5;
const PDF_SIZE_LIMIT_MB = Number(process.env.PDF_SIZE_LIMIT_MB) || 4;
export default async function addProduct(req, res) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new Error('No files were uploaded.');
        }
        const productData = {
            name: req.body.name.trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            description: req.body.description.trim() || null,
            category: reduceSpacesBetweenWordsToOne(req.body.category.toLowerCase().replaceAll(/[^A-Za-z ]/g, '')) || null,
            categoryID: null,
            price: req.body.price,
            stockCount: Number(req.body.stockCount),
            manufacturer: req.body.manufacturer.trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            thumbnailID: 0,
            pictures: null,
            specsDocID: null
        };
        const thumbnailFile = req.files.thumbnail || null;
        const picturesFiles = req.files.pictures || null;
        const specsDocFile = req.files.specsDoc || null;
        if (!productData.name) {
            throw new Error('The product name is missing.');
        }
        if (!productData.description) {
            throw new Error('The product description is missing.');
        }
        if (!productData.category) {
            throw new Error('The product category is missing.');
        }
        if (!productData.price || Number(productData.price) <= 0 || !/^[0-9]+(?:\.[0-9]{2}){0,1}$/.test(productData.price)) {
            throw new Error(`The price must be greater than 0. Please use a dot as a decimal separator. E.g.: '01.23', '23.03' or '0.01'.`);
        }
        if (Number.isNaN(productData.stockCount) || productData.stockCount < 0 || !Number.isInteger(productData.stockCount)) {
            throw new Error('The stock count must be 0 or greater and a whole number.');
        }
        if (!productData.manufacturer) {
            throw new Error('he product manufacturer is missing.');
        }
        if (!thumbnailFile) {
            throw new Error('No thumbnail was submitted.');
        }
        else if (thumbnailFile.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024) {
            throw new Error(`The thumbnail exceeds the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`);
        }
        else if (!['image/jpeg', 'image/png'].includes(thumbnailFile.mimetype)) {
            throw new Error('The thumbnail must be a PNG, JPG or JPEG file.');
        }
        if (picturesFiles) {
            if (picturesFiles instanceof Array) {
                // case array of pictures
                if (picturesFiles.find(p => p.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024)) {
                    throw new Error(`One or more pictures exceed the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`);
                }
                if (picturesFiles.length > MAX_PICTURE_COUNT) {
                    throw new Error(`The pictures may not be more than ${MAX_PICTURE_COUNT}.`);
                }
                if (picturesFiles.find(p => !['image/jpeg', 'image/png'].includes(p.mimetype))) {
                    throw new Error('All pictures must be PNG, JPG or JPEG files.');
                }
            }
            else if (picturesFiles.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024) {
                // case singe picture instanceof Object
                throw new Error(`The picture exceeds the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`);
            }
            else if (!['image/jpeg', 'image/png'].includes(picturesFiles.mimetype)) {
                throw new Error('The picture must be a PNG, JPG or JPEG file.');
            }
        }
        if (specsDocFile && specsDocFile.size > PDF_SIZE_LIMIT_MB * 1024 * 1024) {
            throw new Error(`The specifications document exceeds the size limit of ${PDF_SIZE_LIMIT_MB}MB.`);
        }
        else if (specsDocFile && specsDocFile.mimetype !== 'application/pdf') {
            throw new Error('The specifications document must be a PDF file.');
        }
        const newThumbnailName = `${uuidv4()}---${thumbnailFile.name}`;
        thumbnailFile.name = newThumbnailName;
        await thumbnailFile.mv(`${PICS_STORAGE_PATH}/${newThumbnailName}`);
        const thumbnailID = (await createFile(newThumbnailName))?.fileID;
        let pictures = [];
        let specsDocID = null;
        if (picturesFiles) {
            if (picturesFiles instanceof Array) {
                for (let i = 0; i < picturesFiles.length; i++) {
                    const file = picturesFiles[i];
                    const newPictureName = `${uuidv4()}---${file.name}`;
                    file.name = newPictureName;
                    file.mv(`${PICS_STORAGE_PATH}/${newPictureName}`);
                    const newPicID = (await createFile(newPictureName))?.fileID;
                    pictures.push(newPicID);
                }
            }
            else {
                const newPictureName = `${uuidv4()}---${picturesFiles.name}`;
                picturesFiles.name = newPictureName;
                picturesFiles.mv(`${PICS_STORAGE_PATH}/${newPictureName}`);
                const newPicID = (await createFile(newPictureName))?.fileID;
                pictures.push(newPicID);
            }
        }
        if (specsDocFile) {
            const newSpecsDocName = `${uuidv4()}---${specsDocFile.name}`;
            specsDocFile.name = newSpecsDocName;
            specsDocFile.mv(`${DOCS_STORAGE_PATH}/${newSpecsDocName}`);
            specsDocID = (await createFile(newSpecsDocName))?.fileID;
        }
        productData.thumbnailID = thumbnailID;
        productData.pictures = pictures.length > 0 ? pictures : null;
        productData.specsDocID = specsDocID;
        productData.price = toCent(productData.price); // converting to cent
        productData.categoryID = (await createCategory(productData.category))?.rows[0]?.categoryID;
        const newProduct = await createProduct(productData);
        if (!newProduct) {
            throw new Error('Could not create new product.');
        }
        res.status(200)
            .json({
            msg: `New product added.`,
            payload: newProduct
        })
            .end();
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
//# sourceMappingURL=add-product.js.map