import { json, NextFunction, Request, Response, static as static_ } from "express";
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
const DOMAIN = process.env.DOMAIN || '';
const NODE_ENV = process.env.NODE_ENV || 'production';

export default async function configExpress(app: any) {
    try {
        if (NODE_ENV == 'production') {
            app.use('*',(req: Request, res: Response, next: NextFunction) => {
                if (!req.secure) {
                    // case http
                    const secureURL = DOMAIN + req.originalUrl;
                    return res.redirect(secureURL);
                }
                // case https
                return next();
            });
        }
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