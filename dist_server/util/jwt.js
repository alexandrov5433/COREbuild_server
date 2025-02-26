import jwt from 'jsonwebtoken';
const JWT_KEY = process.env.JWT_KEY || '';
export async function createJWT(payload) {
    return await new Promise((resolve, reject) => {
        try {
            jwt.sign(payload, JWT_KEY, (err, token) => {
                if (err) {
                    throw err;
                }
                resolve(token);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
export async function validateJWT(token) {
    return await new Promise((resolve, reject) => {
        try {
            jwt.verify(token, JWT_KEY, (err, payload) => {
                if (err) {
                    throw err;
                }
                resolve(payload);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
