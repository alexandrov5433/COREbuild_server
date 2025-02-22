import { Request, Response } from "express";
import userData from '../data/data.ts';
import { createJWT } from "../util/jwt.ts";

export default async function login(req: Request, res: Response) {
    try {
        const bodyData = {
            username: req.body.username || '',
            password: req.body.password || ''
        };
        if (userData.username === bodyData.username && userData.password === bodyData.password) {

            const token = await createJWT({ userID: userData.userID });
            res.status(200);
            res.set({ 'Set-Cookie': `session=${token}; Max-Age=300000000; Path=/;` });
            res.json({
                msg: 'Login success!',
                ...bodyData
            });
            res.end();


        } else {
            res.status(400);
            res.json({
                msg: 'False credentials. No such user exists.'
            });
            res.end();
        }
    } catch (e) {
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}