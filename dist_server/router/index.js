import { Router } from "express";
import login from "../handlers/user/login.js";
import register from "../handlers/user/register.js";
import logout from "../handlers/user/logout.js";
import validateCookie from "../handlers/user/validateCookie.js";
const router = Router();
router.post('/api/login', login);
router.post('/api/register', register);
router.get('/api/logout', logout);
router.get('/api/validate-cookie', validateCookie);
router.all('*', (req, res) => {
    res.status(404);
    res.json({
        msg: `The route: "${req.url}" is not valid.`
    });
    res.end();
});
export { router };
