import { Request, Response } from "express";
import { createJWT } from "../../util/jwt.js";
import { findUserByUsername } from "../../data/user.js";
import bcrypt from "bcryptjs";
import logger from "../../config/winston.js";

export default async function login(req: Request, res: Response) {
    try {
        const bodyData = {
            username: req.body?.username || '',
            password: req.body?.password || '',
            stayLoggedIn: req.body?.stayLoggedIn || ''
        };
        if (bodyData.username && bodyData.password) {
            const userData = await findUserByUsername(bodyData.username);
            if (!userData) {
                throw new Error(`A user with these credentials was not found.`);
            }
            const isPasswordCorrect = await bcrypt.compare(bodyData.password, userData.password);
            if (!isPasswordCorrect) {
                throw new Error('False login credentials.');
            }
            const jwt = await createJWT({ userID: userData.userID, is_employee: userData.is_employee });
            const cookieMaxAge = bodyData.stayLoggedIn ? ' Max-Age=31556952;' : '';
            res.status(200);
            res.setHeader('Set-Cookie', `session=${jwt};${cookieMaxAge} Path=/; HttpOnly; Secure;`);
            res.json({
                msg: 'Login successful.',
                payload: {
                    userID: userData.userID,
                    is_employee: userData.is_employee,
                    username: userData.username,
                    email: userData.email || null,
                    firstname: userData.firstname || null,
                    lastname: userData.lastname || null,
                    address: userData.address || null
                }
            });
            res.end();
            logger.info(`User ${userData.username} with ID: ${userData.userID} logged in successfully.`);
        } else {
            logger.info(`Missing login credentials.`, bodyData);
            throw new Error('Missing login credentials.');
        }
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}