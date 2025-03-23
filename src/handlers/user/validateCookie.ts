import { Request, Response } from 'express';
import { JwtPayload } from '../../util/jwt.js';
import { findUserByUserID } from '../../data/user.js';

export default async function validateCookie(req: Request, res: Response) {
    try {
        const sessionCookie: JwtPayload | null = req.cookies.userSession;
        if (!sessionCookie) {
            throw new Error('No cookie was provided.');
        }
        if (sessionCookie.userID) {
            const userData = await findUserByUserID(Number(sessionCookie.userID) || 0);
            if (userData?.userID != Number(sessionCookie.userID)) {
                throw new Error('Invalid cookie.');
            }
            if (userData?.is_employee != sessionCookie.is_employee) {
                throw new Error('Invalid cookie.');
            }
            res.status(200);
            res.json({
                msg: `Session is valid.`,
                payload: {
                    userID: userData?.userID,
                    is_employee: userData?.is_employee,
                    username: userData?.username,
                    email: userData?.email || null,
                    firstname: userData?.firstname || null,
                    lastname: userData?.lastname || null,
                    address: userData?.address || null
                }
            });
            res.end();
            return;
        }
        throw new Error('Invalid cookie.');
    } catch (e) {
        res.status(500);
        res.set({ 'Set-Cookie': `session=0; Max-Age=0; Path=/; HttpOnly; Secure;` });
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}