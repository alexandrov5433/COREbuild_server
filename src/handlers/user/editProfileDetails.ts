import { Request, Response } from "express";

import logger from "../../config/winston.js";
import { NewProfileDetails } from "../../data/definitions.js";
import { editProfileDetailsInDB } from "../../data/user.js";

export default async function editProfileDetails(req: Request, res: Response) {
    try {
        const userID = Number(req.params.userID) || null;
        if (!userID) {
            throw new Error('UserID is missing.');
        }
        const newDetails = {
            email: req.body.email || null,
            firstname: req.body.firstname || null,
            lastname: req.body.lastname || null,
            address: req.body.address || null,
        } as NewProfileDetails;
        if (Object.values(newDetails).includes(null)) {
            throw new Error('One or more fields of data are missing.')
        }
        const validationObject = validateNewProfileDetails(newDetails);
        const isDetailsValid = isInformationValid(validationObject);
        if (!isDetailsValid) {
            throw new Error('One or more fields contain invalid data.');
        }
        const updatedUserData = await editProfileDetailsInDB(userID, newDetails);
        if (!updatedUserData) {
            throw new Error('Profile details could not be updated.');
        }
        res.status(200);
        res.json({
            msg: 'Profile details updated.',
            payload: updatedUserData
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
        email: emailValid,
        firstname: firstnameValid,
        lastname: lastnameValid,
        address: addressValid
    };
}

function isInformationValid(validationObject: any) {
    const result = Object.values(validationObject).find(e => e === false);
    return result ? false : true;
}