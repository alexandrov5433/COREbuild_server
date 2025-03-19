import { json, static as static_ } from "express";
import cookieParser from 'cookie-parser';
// import cors from 'cors';
import { checkCookie } from "../util/cookie.js";
import { router } from "../router/index.js";
import path from 'node:path';
import { verifyDBConnection } from '../data/postgres.js'; //init Pool instance and check connection to DB
import fileUpload from "express-fileupload";
import logger from "./winston.js";

const appAssetsPath = path.resolve('./dist_app');
const PDF_SIZE_LIMIT_MB = Number(process.env.PDF_SIZE_LIMIT_MB) || 4;

export default async function configExpress(app: any) {
    try {
        app.use(json());
        app.use(cookieParser());
        app.use(checkCookie);
        app.use(static_(appAssetsPath)); //must be before router
        app.use(fileUpload({ // uploads files into RAM; files are then moved to storage in handler function
            limits: {
                fileSize: PDF_SIZE_LIMIT_MB * 1024 * 1024
            },
            safeFileNames: true, // strip non-alphanumeric characters except dashes
            preserveExtension: 4,  // allow extentions of length up to 4 char - eg. jpeg
            abortOnLimit: true, // Returns a HTTP 413 when the file is bigger than the size limit
            responseOnLimit: `One or more files exceed the ${PDF_SIZE_LIMIT_MB}MB size limit.`
        }));
        app.use(router);
        await verifyDBConnection(); //implement fallback handlers?
    } catch (e) {
        logger.error(e.message, e);
    } finally {
        return app;
    }
}