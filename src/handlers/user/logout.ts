import { Request, Response } from "express";

export default function logout(req: Request, res: Response) {
    if (!req.cookies.userSession) {
        res.status(400);
        res.json({
            msg: 'Request is not authorized.'
        });
        res.end();
        return;
    }
    res.status(200);
    res.setHeader('Set-Cookie', `session=0; Max-Age=0; Path=/;`);
    res.json({
        msg: 'Logout successful.'
    });
    res.end();
}