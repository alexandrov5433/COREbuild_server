import { json, static as static_ } from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { checkCookie } from "../util/cookie.ts";
import { router } from "../router/index.ts";
import path from 'node:path';
import { verifyDBConnection } from '../data/postgres.ts'; //init Pool instance and check connection to DB

// const corsOrigin = process.env.CORS_ORIGIN || '';
const appAssetsPath = path.resolve('./dist');

export default async function configExpress(app: any) {
    try {
        app.use(cors()); //TODO remove; added for vite dev server
        // app.use(cors({
        //     origin: corsOrigin,
        //     credentials: true
        // }));
        app.use(json());
        app.use(cookieParser());
        app.use(checkCookie);
        app.use(static_(appAssetsPath)); //must be before router
        app.use(router);
        await verifyDBConnection(); //implement fallback handlers?
    } catch (e) {
        console.error(e.message);
    } finally {
        return app;
    }
}