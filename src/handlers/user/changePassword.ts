import { Request, Response } from "express";

import logger from "../../config/winston.js";
import { NewPasswordDetails, NewProfileDetails } from "../../data/definitions.js";
import bcrypt from "bcryptjs";
import { changePasswordInDB, findUserByUserID } from "../../data/user.js";

const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS) || 10;

export default async function changePassword(req: Request, res: Response) {
    try {
        const userID = Number(req.params.userID) || null;
        if (!userID) {
            throw new Error('UserID is missing.');
        }
        const newPasswordDetails = {
            currentPassword: req.body.currentPassword || null,
            newPassword: req.body.newPassword || null
        } as NewPasswordDetails;
        if (Object.values(newPasswordDetails).includes(null)) {
            throw new Error('One or more fields of data are missing.');
        }

        const userData = await findUserByUserID(userID);
        if (!userData) {
            throw new Error(`Could not find user with ID: ${userID}.`);
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(newPasswordDetails.currentPassword, userData.password);
        if (!isCurrentPasswordCorrect) {
            throw new Error('Invalid current password.');
        }

        const newPasswordValid = /^[A-Za-z0-9@_+?!-]{5,50}$/.test(newPasswordDetails.newPassword || '');
        if (!newPasswordValid) {
            throw new Error('The value for the new password is invalid.');
        }

        const newPasswordHash = await bcrypt.hash(newPasswordDetails.newPassword, HASH_SALT_ROUNDS);
        const updatedUserData = await changePasswordInDB(userID, newPasswordHash);
        if (!updatedUserData) {
            throw new Error('Could not update the password in DB.');
        }
        res.status(200);
        res.json({
            msg: 'Password changed.'
        });
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}