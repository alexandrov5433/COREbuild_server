import { pool } from "./postgres.js";
import logger from "../config/winston.js";
export async function findUserByUsername(username) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (username='${username}')`);
        if (res.rows?.[0].userID) {
            return res.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function checkUsernameTaken(username) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (username=$1)`, [username]);
        return (res.rows[0]?.username === username ? true : false);
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function checkEmailTaken(email) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (email=$1)`, [email]);
        return (res.rows[0]?.email === email ? true : false);
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function findUserByUserID(userID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE ("userID"=${userID})`);
        if (res.rows[0].userID) {
            return res.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function addNewCustomer(registerData) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "user" VALUES(
                DEFAULT,
                ${false},
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                DEFAULT)
            RETURNING *;
            `, [
            registerData.username,
            registerData.password,
            registerData.email,
            registerData.firstname,
            registerData.lastname,
            registerData.address,
        ]);
        if (res?.rows[0]?.userID) {
            return res?.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function addNewEmployee(registerData) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "user" VALUES(
                DEFAULT,
                ${true},
                '${registerData.username}',
                '${registerData.password}',
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT)
            RETURNING *
            `);
        if (res?.rows[0]?.userID) {
            return res?.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function editProfileDetailsInDB(userID, newDetails) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            UPDATE "user" SET
                "email"=$2,
                "firstname"=$3,
                "lastname"=$4,
                "address"=$5
            WHERE "userID"=$1
            RETURNING *;
        `, [
            userID,
            newDetails.email,
            newDetails.firstname,
            newDetails.lastname,
            newDetails.address,
        ]);
        if (res?.rows[0].userID) {
            return res.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function changePasswordInDB(userID, newPasswordHash) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            UPDATE "user" SET
                "password"=$2
            WHERE "userID"=$1
            RETURNING *;
        `, [userID, newPasswordHash]);
        if (res?.rows[0].userID) {
            return res.rows[0];
        }
        return null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=user.js.map