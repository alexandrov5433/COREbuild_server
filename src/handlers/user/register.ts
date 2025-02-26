import { Request, Response } from "express";
import { RegsiterData } from "../../data/definitions.js";
import bcrypt from "bcryptjs";
import { addNewCustomer, addNewEmployee } from "../../data/user.js";
import { QueryResult } from "pg";
import { createJWT } from "../../util/jwt.js";

const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS) || 10;
const EMPLOYEE_AUTH_CODE = process.env.EMPLOYEE_AUTH_CODE;

export default async function register(req: Request, res: Response) {
    try {
        if (req.cookies.userSession) {
            res.redirect('/');
            res.end();
            return;
        }
        const registerData: RegsiterData = {
            is_employee: req.body.is_employee || null,
            username: req.body.username || null,
            password: req.body.password || null,
            repeat_password: req.body.repeat_password || null,
            email: req.body.email || null,
            firstname: req.body.firstname || null,
            lastname: req.body.lastname || null,
            prefered_payment_method: req.body.prefered_payment_method || null,
            address: req.body.address || null,
            stayLoggedIn: req.body.stayLoggedIn || null,
            authentication_code: req.body.authentication_code || null
        };
        let dbResponse: QueryResult<any> | null = null;
        if (registerData.is_employee) {
            const validationObject = validateEmployeeData(registerData);
            if (isInformationValid(validationObject)) {
                registerData.password = await bcrypt.hash(registerData.password!, HASH_SALT_ROUNDS);
                dbResponse = await addNewEmployee(registerData);
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
            const validationObject = validateCustomerData(registerData);
            if (isInformationValid(validationObject)) {
                registerData.password = await bcrypt.hash(registerData.password!, HASH_SALT_ROUNDS);
                dbResponse = await addNewCustomer(registerData);
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
        const jwt = await createJWT({ userID: dbResponse?.rows[0].userID });
        // 1 Year = 31,556,952 Seconds
        const cookieMaxAge = registerData.stayLoggedIn ? ' Max-Age=31556952;' : '';
        console.log('New User Created ID:', dbResponse?.rows[0].userID);
        
        res.status(200);
        res.setHeader('Set-Cookie', `session=${jwt};${cookieMaxAge} Path=/; HttpOnly; Secure;`);
        res.json({
            msg: 'Registration successful.',
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
    } catch (e) {
        console.log('ERROR:', e.message);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}

function validateEmployeeData(registerData: RegsiterData) {
    const is_employeeValid = registerData.is_employee === 'on';
    const usernameValid = /^[A-Za-z0-9@_+?!-]{1,30}$/.test(registerData.username || '');
    const passwordValid = /^[A-Za-z0-9@_+?!-]{5,50}$/.test(registerData.password || '');
    const repeat_passwordValid = registerData.password === registerData.repeat_password;
    const authentication_codeValid = registerData.authentication_code === EMPLOYEE_AUTH_CODE;
    return {
        is_employee: {
            valid: is_employeeValid,
            msg: `${is_employeeValid ? '' : 'You must check the employee box.'}`
        },
        username: {
            valid: usernameValid,
            msg: `${usernameValid ? '' : 'The username can be maximum 30 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        password: {
            valid: passwordValid,
            msg: `${passwordValid ? '' : 'The password can be beween 5 and 50 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        repeat_password: {
            valid: repeat_passwordValid,
            msg: `${repeat_passwordValid ? '' : 'Both passwords must match.'}`
        },
        authentication_code: {
            valid: authentication_codeValid,
            msg: `${authentication_codeValid ? '' : 'Invalid employee authentication code.'}`
        }
    };
}

function validateCustomerData(registerData: RegsiterData) {
    const is_employeeValid = !Boolean(registerData.is_employee); // true when is_employee is falsy; customer is not an employee
    const usernameValid = /^[A-Za-z0-9@_+?!-]{1,30}$/.test(registerData.username || '');
    const passwordValid = /^[A-Za-z0-9@_+?!-]{5,50}$/.test(registerData.password || '');
    const repeat_passwordValid = registerData.password === registerData.repeat_password;
    const emailValid = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(registerData.email || '');
    const firstnameValid = /^[A-Za-z]{1,50}$/.test(registerData.firstname || '');
    const lastnameValid = /^[A-Za-z]{1,50}$/.test(registerData.lastname || '');
    const prefered_payment_methodValid = /^paypal|bank$/.test(registerData.prefered_payment_method || '');
    const addressValid = /^[A-Za-z0-9\., -]+$/.test(registerData.prefered_payment_method || '');

    return {
        is_employee: {
            valid: is_employeeValid,
            msg: `${is_employeeValid ? '' : 'You must UNcheck the employee box.'}`
        },
        username: {
            valid: usernameValid,
            msg: `${usernameValid ? '' : 'The username can be maximum 30 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        password: {
            valid: passwordValid,
            msg: `${passwordValid ? '' : 'The password can be beween 5 and 50 characters long and may include letters, numbers and the following symbols: @-_+?!'}`
        },
        repeat_password: {
            valid: repeat_passwordValid,
            msg: `${repeat_passwordValid ? '' : 'Both passwords must match.'}`
        },
        email: {
            valid: emailValid,
            msg: `${emailValid ? '' : 'Please enter a valid email like: example123@some.com, example123!?_-@so23me.com.gov'}`
        },
        firstname: {
            valid: firstnameValid,
            msg: `${firstnameValid ? '' : 'First name must be between 1 and 50 characters long and may only include letters.'}`
        },
        lastname: {
            valid: lastnameValid,
            msg: `${lastnameValid ? '' : 'Last name must be between 1 and 50 characters long and may only include letters.'}`
        },
        prefered_payment_method: {
            valid: prefered_payment_methodValid,
            msg: `${prefered_payment_methodValid ? '' : 'The available payment methods are PayPal and Bank. Please select one of them.'}`
        },
        address: {
            valid: addressValid,
            msg: `${addressValid ? '' : 'Please enter a postal address. Example: "Some-Str. 34a, 23456, Some City"'}`
        }
    };
}

function isInformationValid(validationObject: any) {
    const result = Object.values(validationObject).find(e => (e as any).valid === false);
    return result ? false : true;
}