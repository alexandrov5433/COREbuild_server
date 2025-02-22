import { json } from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { checkCookie } from "../util/cookie.ts";
import { router } from "../router/index.ts";

const corsOrigin = process.env.CORS_ORIGIN || '';

export default function configExpress(app) {
    // app.use(cors());
    app.use(cors({
        origin: corsOrigin,
        credentials: true
    }));
    app.use(json());
    app.use(cookieParser());
    app.use(checkCookie);
    app.use(router);
    return app;
}