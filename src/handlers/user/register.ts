import { Request, Response } from "express";
import { RegsiterData, UserData } from "../../data/definitions.js";
import bcrypt from "bcryptjs";
import { addNewCustomer, addNewEmployee, checkEmailTaken, checkUsernameTaken } from "../../data/user.js";
import { QueryResult } from "pg";
import { createJWT } from "../../util/jwt.js";
import logger from "../../config/winston.js";
import { createFavorite } from "../../data/favorite.js";

const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS) || 10;
const EMPLOYEE_AUTH_CODE = process.env.EMPLOYEE_AUTH_CODE;

export default async function register(req: Request, res: Response) {
    try {
        const registerData: RegsiterData = {
            is_employee: req.body.is_employee || null,
            username: req.body.username || null,
            password: req.body.password || null,
            repeat_password: req.body.repeat_password || null,
            email: req.body.email || null,
            firstname: req.body.firstname || null,
            lastname: req.body.lastname || null,
            address: req.body.address || null,
            stayLoggedIn: req.body.stayLoggedIn || null,
            authentication_code: req.body.authentication_code || null
        };
        let userData: UserData | null = null;
        if (registerData.is_employee) {
            const isUsernameTaken = await checkUsernameTaken(registerData.username);
            if (isUsernameTaken == true) {
                res.status(403);
                res.json({
                    msg: `The username: "${registerData.username}" is already taken.`
                });
                res.end();
                return;
            }
            const validationObject = validateEmployeeData(registerData);
            if (isInformationValid(validationObject)) {
                registerData.password = await bcrypt.hash(registerData.password!, HASH_SALT_ROUNDS);
                userData = await addNewEmployee(registerData);
            } else {
                res.status(400);
                res.json({
                    msg: 'Invalid registration data.',
                    payload: validationObject
                });
                res.end();
                return;
            }
        } else {
            const areTaken = await Promise.all([
                checkUsernameTaken(registerData.username),
                checkEmailTaken(registerData.email)
            ]);
            if (areTaken.includes(true)) {
                res.status(403);
                res.json({
                    msg: `The data given for the following fields is in use: ${areTaken[0] ? 'Username' : ''} ${areTaken[1] ? 'Email' : ''}`
                });
                res.end();
                return;
            }
            const validationObject = validateCustomerData(registerData);
            if (isInformationValid(validationObject)) {
                registerData.password = await bcrypt.hash(registerData.password!, HASH_SALT_ROUNDS);
                userData = await addNewCustomer(registerData);
            } else {
                res.status(400);
                res.json({
                    msg: 'Invalid registration data.',
                    payload: validationObject
                });
                res.end();
                return;
            }
        }
        if (!userData) {
            res.status(403);
            res.json({
                msg: 'Could not create new user.',
            });
            res.end();
            return;
        }
        await createFavorite(userData.userID);
        const jwt = await createJWT({ userID: userData?.userID, is_employee: userData?.is_employee });
        // 1 Year = 31,556,952 Seconds
        const cookieMaxAge = registerData.stayLoggedIn ? ' Max-Age=31556952;' : '';

        res.status(200);
        res.setHeader('Set-Cookie', `session=${jwt};${cookieMaxAge} Path=/; HttpOnly; Secure;`);
        res.json({
            msg: 'Registration successful.',
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
        logger.info(`New user registered.`, userData);
    } catch (e) {
        logger.error(e.message, e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}

function validateEmployeeData(registerData: RegsiterData) {
    const usernameValid = /^[A-Za-z0-9@_+?!-]{1,30}$/.test(registerData.username || '');
    const passwordValid = /^[A-Za-z0-9@_+?!-]{5,50}$/.test(registerData.password || '');
    const repeat_passwordValid = registerData.password === registerData.repeat_password;
    const authentication_codeValid = registerData.authentication_code === EMPLOYEE_AUTH_CODE;
    return {
        username: {
            valid: usernameValid,
            touched: true,
            msg: `${usernameValid ? '' : 'The username can be maximum 30 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        password: {
            valid: passwordValid,
            touched: true,
            msg: `${passwordValid ? '' : 'The password can be beween 5 and 50 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        repeat_password: {
            valid: repeat_passwordValid,
            touched: true,
            msg: `${repeat_passwordValid ? '' : 'Both passwords must match.'}`
        },
        authentication_code: {
            valid: authentication_codeValid,
            touched: true,
            msg: `${authentication_codeValid ? '' : 'Invalid employee authentication code.'}`
        }
    };
}

function validateCustomerData(registerData: RegsiterData) {
    const usernameValid = /^[A-Za-z0-9@_+?!-]{1,30}$/.test(registerData.username || '');
    const passwordValid = /^[A-Za-z0-9@_+?!-]{5,50}$/.test(registerData.password || '');
    const repeat_passwordValid = registerData.password === registerData.repeat_password;
    const emailValid = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(registerData.email || '');
    const firstnameValid = /^[A-Za-z]{1,50}$/.test(registerData.firstname || '');
    const lastnameValid = /^[A-Za-z]{1,50}$/.test(registerData.lastname || '');
    const addressValid = /^[A-Za-z0-9\., -]+$/.test(registerData.address || '');

    return {
        username: {
            valid: usernameValid,
            touched: true,
            msg: `${usernameValid ? '' : 'The username can be maximum 30 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        password: {
            valid: passwordValid,
            touched: true,
            msg: `${passwordValid ? '' : 'The password can be beween 5 and 50 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        repeat_password: {
            valid: repeat_passwordValid,
            touched: true,
            msg: `${repeat_passwordValid ? '' : 'Both passwords must match.'}`
        },
        email: {
            valid: emailValid,
            touched: true,
            msg: `${emailValid ? '' : 'Please enter a valid email like: example123@some.com, example123!?_-@so23me.com.gov'}`
        },
        firstname: {
            valid: firstnameValid,
            touched: true,
            msg: `${firstnameValid ? '' : 'First name must be between 1 and 50 characters long and may only include letters.'}`
        },
        lastname: {
            valid: lastnameValid,
            touched: true,
            msg: `${lastnameValid ? '' : 'Last name must be between 1 and 50 characters long and may only include letters.'}`
        },
        address: {
            valid: addressValid,
            touched: true,
            msg: `${addressValid ? '' : 'Please enter a postal address. Example: "Some-Str. 34a, 23456, Some City"'}`
        }
    };
}

function isInformationValid(validationObject: any) {
    const result = Object.values(validationObject).find(e => (e as any).valid === false);
    return result ? false : true;
}