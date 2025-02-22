import jwt from 'jsonwebtoken';

const JWT_KEY:string = process.env.JWT_KEY || '';

export type JwtPayload = {
    userID: string
};

export async function createJWT(payload: JwtPayload): Promise<string | Error> {
    return await new Promise((resolve, reject) => {
        try {
            jwt.sign(payload, JWT_KEY, (err, token) => {
                if(err) {
                    throw err;
                }
                resolve(token as string);
            });
        } catch (err) {
            reject(err);
        }
    });
}

export async function validateJWT(token: string): Promise<JwtPayload | Error> {
    return await new Promise((resolve, reject) => {
        try {
            jwt.verify(token, JWT_KEY, (err, payload) => {
                if(err) {
                    throw err;
                }
                resolve(payload as JwtPayload);
            });
        } catch (err) {
            reject(err);
        }
    });
}