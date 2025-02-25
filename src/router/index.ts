import { Router, Request, Response } from "express";

import login from "../handlers/user/login.ts";
import register from "../handlers/user/register.ts";
import logout from "../handlers/user/logout.ts";
import validateCookie from "../handlers/user/validateCookie.ts";

const router = Router();
router.post('/api/login', login);
router.post('/api/register', register);
router.get('/api/logout', logout);
router.get('/api/validate-cookie', validateCookie);

router.all('*', (req: Request, res: Response) => {
    res.status(404);
    res.json({
        msg: `The route: "${req.url}" is not valid.`
    });
    res.end();
});

export {
    router
};