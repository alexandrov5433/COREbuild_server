import userData from '../data/data.ts';
import { Request, Response } from 'express';
import { JwtPayload, validateJWT } from '../util/jwt.ts';

export default async function validateCookie(req: Request, res: Response) {
    try {
        const sessionCookie: JwtPayload | null = req.cookies.userSession;
        if (!sessionCookie) {
            throw new Error('No cookie was provided.');
        }
        // const payload = await validateJWT(sessionCookie.userID);
        if (sessionCookie.userID === userData.userID) {
            res.status(200);
            res.json({
                msg: `Session is valid.`,
                username: userData.username,
                password: userData.password
            });
            res.end();
            return;
        }
        throw new Error('Invalid cookie.');
    } catch (e) {
        console.log('Problem');
        
        res.status(500);
        res.set({ 'Set-Cookie': `session=0; Max-Age=0; Path=/;` });
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}