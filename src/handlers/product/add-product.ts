import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "node:path";
import { v4 as uuidv4 } from 'uuid';
import { createFile } from "../../data/file.js";
import { createProduct } from "../../data/product.js";
import { ProductCreationData } from "../../data/definitions.js";
import { createCategory } from "../../data/category.js";

const DOCS_STORAGE_PATH = path.resolve('./fileStorage/docs');
const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');
const MAX_PICTURE_COUNT = Number(process.env.MAX_PICTURE_COUNT) || 5;
const PICTURE_SIZE_LIMIT_MB = Number(process.env.PICTURE_SIZE_LIMIT_MB) || 0.5;
const PDF_SIZE_LIMIT_MB = Number(process.env.PDF_SIZE_LIMIT_MB) || 4;

export default async function addProduct(req: Request, res: Response) {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400)
                .json({
                    msg: `No files were uploaded.`
                })
                .end();
            return;
        }

        const productData: ProductCreationData = {
            name: (req.body.name as string).trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            description: (req.body.description as string).trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            category: reduceSpacesBetweenWordsToOne((req.body.category as string).toLowerCase().replaceAll(/[^A-Za-z ]/g, '')) || null,
            categoryID: null,
            price: Number(req.body.price),
            stockCount: Number(req.body.stockCount),
            manufacturer: (req.body.manufacturer as string).trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            thumbnailID: 0,
            pictures: null,
            specsDocID: null
        };
        console.log(productData);
        
        const thumbnailFile = req.files.thumbnail as UploadedFile || null;
        const picturesFiles = req.files.pictures || null;
        const specsDocFile = req.files.specsDoc as UploadedFile || null;

        if (!productData.name) {
            res.status(400)
                .json({
                    msg: `The product name is missing.`
                })
                .end();
            return;
        }
        if (!productData.description) {
            res.status(400)
                .json({
                    msg: `The product description is missing.`
                })
                .end();
            return;
        }
        if (!productData.category) {
            res.status(400)
                .json({
                    msg: `The product category is missing.`
                })
                .end();
            return;
        }
        if (!productData.price || productData.price <= 0 || !/^[0-9]+(?:\.[0-9]{2}){0,1}$/.test(productData.price.toString())) {
            res.status(400)
                .json({
                    msg: `The price must be greater than 0. Please use a dot as a decimal separator. E.g.: '01.23', '23.03' or '0.01'.`
                })
                .end();
            return;
        }
        if (Number.isNaN(productData.stockCount) || productData.stockCount < 0 || !Number.isInteger(productData.stockCount)) {
            res.status(400)
                .json({
                    msg: `The stock count must be 0 or greater and a whole number.`
                })
                .end();
            return;
        }

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

        if (picturesFiles) {
            if (picturesFiles instanceof Array) {
                // case array of pictures
                if (picturesFiles.find(p => p.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024)) {
                    res.status(400)
                        .json({
                            msg: `One or more pictures exceed the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`
                        })
                        .end();
                    return;
                }
                if (picturesFiles.length > MAX_PICTURE_COUNT) {
                    res.status(400)
                        .json({
                            msg: `You may upload no more than ${MAX_PICTURE_COUNT} pictures.`
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
            } else if (picturesFiles.size > PICTURE_SIZE_LIMIT_MB * 1024 * 1024) {
                // case singe picture instanceof Object
                res.status(400)
                    .json({
                        msg: `The picture exceeds the size limit of ${PICTURE_SIZE_LIMIT_MB}MB.`
                    })
                    .end();
                return;
            } else if (!['image/jpeg', 'image/png'].includes(picturesFiles.mimetype)) {
                res.status(400)
                    .json({
                        msg: `The picture must be a PNG, JPG or JPEG file.`
                    })
                    .end();
                return;
            }
        }

        if (specsDocFile && specsDocFile.size > PDF_SIZE_LIMIT_MB * 1024 * 1024) {
            res.status(400)
                .json({
                    msg: `The specifications document exceeds the size limit of ${PDF_SIZE_LIMIT_MB}MB.`
                })
                .end();
            return;
        } else if (specsDocFile && specsDocFile.mimetype !== 'application/pdf') {
            res.status(400)
                .json({
                    msg: `The specifications document must be a PDF file.`
                })
                .end();
            return;
        }

        const newThumbnailName = `${uuidv4()}---${thumbnailFile.name}`;
        thumbnailFile.name = newThumbnailName;
        thumbnailFile.mv(`${PICS_STORAGE_PATH}/${newThumbnailName}`);
        const thumbnailID = (await createFile(newThumbnailName))?.rows[0]?.fileID;
        let pictures = [];
        let specsDocID = null;
        if (picturesFiles) {
            if (picturesFiles instanceof Array) {
                picturesFiles.forEach(async f => {
                    const newPictureName = `${uuidv4()}---${f.name}`;
                    f.name = newPictureName;
                    f.mv(`${PICS_STORAGE_PATH}/${newPictureName}`);
                    const newPicID = (await createFile(newPictureName))?.rows[0]?.fileID;
                    pictures.push(newPicID);
                });
            } else {
                const newPictureName = `${uuidv4()}---${picturesFiles.name}`;
                picturesFiles.name = newPictureName;
                picturesFiles.mv(`${PICS_STORAGE_PATH}/${newPictureName}`);
                const newPicID = (await createFile(newPictureName))?.rows[0]?.fileID;
                pictures.push(newPicID);
            }
        }
        if (specsDocFile) {
            const newSpecsDocName = `${uuidv4()}---${specsDocFile.name}`;
            specsDocFile.name = newSpecsDocName;
            specsDocFile.mv(`${DOCS_STORAGE_PATH}/${newSpecsDocName}`);
            specsDocID = (await createFile(newSpecsDocName))?.rows[0]?.fileID;
        }

        productData.thumbnailID = thumbnailID;
        productData.pictures = pictures.length > 0 ? pictures : null;
        productData.specsDocID = specsDocID;

        productData.price = Number(Number.parseFloat(`${productData.price}`).toFixed(2)) * 100; // converting to cent

        productData.categoryID = (await createCategory(productData.category))?.rows[0]?.categoryID;
        const newProduct = await createProduct(productData);

        res.status(200)
            .json({
                msg: `New product added.`,
                payload: newProduct?.rows[0]
            })
            .end();
    } catch (e) {
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}

function reduceSpacesBetweenWordsToOne(sentance: string) {
    return sentance.trim().split(' ').filter(e => e != ' ' && e).join(' ');
}