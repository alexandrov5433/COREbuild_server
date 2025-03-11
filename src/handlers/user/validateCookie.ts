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
            const dbResponse = await findUserByUserID(Number(sessionCookie.userID) || 0);
            if (dbResponse?.rows[0].userID != sessionCookie.userID) {
                throw new Error('Invalid cookie.');
            }
            res.status(200);
            res.json({
                msg: `Session is valid.`,
                payload: {
                    userID: dbResponse?.rows[0].userID,
                    is_employee: dbResponse?.rows[0].is_employee,
                    username: dbResponse?.rows[0].username,
                    email: dbResponse?.rows[0].email || null,
                    firstname: dbResponse?.rows[0].firstname || null,
                    lastname: dbResponse?.rows[0].lastname || null,
                    prefered_payment_method: dbResponse?.rows[0].prefered_payment_method || null,
                    address: dbResponse?.rows[0].address || null
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