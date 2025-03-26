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

function validateNewProfileDetails(newProfileDetails: NewProfileDetails) {
    const emailValid = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(newProfileDetails.email || '');
    const firstnameValid = /^[A-Za-z]{1,50}$/.test(newProfileDetails.firstname || '');
    const lastnameValid = /^[A-Za-z]{1,50}$/.test(newProfileDetails.lastname || '');
    const addressValid = /^[A-Za-z0-9\., -]+$/.test(newProfileDetails.address || '');

    return {
        currentPassword: emailValid,
        newPassword: firstnameValid,
    };
}

function isInformationValid(validationObject: any) {
    const result = Object.values(validationObject).find(e => e === false);
    return result ? false : true;
}