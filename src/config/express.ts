import { json, static as static_ } from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { checkCookie } from "../util/cookie.ts";
import { router } from "../router/index.ts";
import path from 'node:path';
import '../data/postgres.ts'; //init Pool instance

// const corsOrigin = process.env.CORS_ORIGIN || '';
const appAssetsPath = path.resolve('./dist');
console.log('appAssetsPath   -->  ', appAssetsPath);

export default function configExpress(app: any) {
    app.use(cors()); //TODO remove; added for vite dev server
    // app.use(cors({
    //     origin: corsOrigin,
    //     credentials: true
    // }));
    app.use(json());
    app.use(cookieParser());
    app.use(checkCookie);
    app.use(static_(appAssetsPath));
    app.use(router);
    return app;
}