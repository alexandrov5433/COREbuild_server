import { Request, Response, NextFunction } from "express";
import { validateJWT } from "./jwt.js";

async function checkCookie(req: Request, res: Response, next: NextFunction) {
    if (req.cookies.session) {
        try {
            const payload = await validateJWT(req.cookies.session);
            req.cookies.userSession = payload;
            next();
        } catch (e) {
            req.cookies.userSession = null;
            next();
        }
    } else {
        req.cookies.userSession = null;
        next();
    }
}

export {
    checkCookie
}