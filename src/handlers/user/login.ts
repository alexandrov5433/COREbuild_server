import { Request, Response } from "express";
import { createJWT } from "../../util/jwt.ts";
import { findUserByUsername } from "../../data/user.ts";
import bcrypt from "bcryptjs";

export default async function login(req: Request, res: Response) {
    try {
        const bodyData = {
            username: req.body.username || '',
            password: req.body.password || '',
            stayLoggedIn: req.body.stayLoggedIn || ''
        };
        if (bodyData.username && bodyData.password) {
            const dbResponse = await findUserByUsername(bodyData.username);
            const isPasswordCorrect = await bcrypt.compare(bodyData.password, dbResponse?.rows[0].password);
            if (!isPasswordCorrect) {
                res.status(400);
                res.json({
                    msg: 'False login credentials.'
                });
                res.end();
                return;
            }
            const jwt = await createJWT({ userID: dbResponse?.rows[0].userID });
            const cookieMaxAge = bodyData.stayLoggedIn ? ' Max-Age=31556952;' : '';
            res.status(200);
            res.setHeader('Set-Cookie', `session=${jwt};${cookieMaxAge} Path=/; HttpOnly; Secure;`);
            res.json({
                msg: 'Login successful.',
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
        } else {
            res.status(400);
            res.json({
                msg: 'False login credentials.'
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