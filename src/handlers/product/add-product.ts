import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import path from "node:path";
import { v4 as uuidv4 } from 'uuid';
import { createFile } from "../../data/file.js";
import { createProduct } from "../../data/product.js";
import { ProductCreationData } from "../../data/definitions.js";

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
            name: req.body.name as string || null,
            description: req.body.description as string || null,
            price: Number(req.body.price) || null,
            stockCount: Number(req.body.price) || null,
            manufacturer: req.body.manufacturer as string || null,
            thumbnailID: 0,
            pictures: null,
            specsDocID: null
        };
        const thumbnailFile = req.files.thumbnail as UploadedFile || null;
        const picturesFiles = req.files.pictures || null;
        const specsDocFile = req.files.specsDoc as UploadedFile || null;

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

