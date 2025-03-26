import { pool } from "./postgres.js";
import { NewPasswordDetails, NewProfileDetails, RegsiterData, UserData } from "./definitions.js";
import logger from "../config/winston.js";

export async function findUserByUsername(username: string): Promise<UserData | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (username='${username}')`)
        if (res.rows?.[0].userID) {
            return res.rows[0];
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}
export async function checkUsernameTaken(username: string) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (username=$1)`, [username])
        return (res.rows[0]?.username === username ? true : false);
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}
export async function checkEmailTaken(email: string) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (email=$1)`, [email])
        return (res.rows[0]?.email === email ? true : false);
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function findUserByUserID(userID: number): Promise<UserData | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE ("userID"=${userID})`)
        if (res.rows[0].userID) {
            return res.rows[0];
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewCustomer(registerData: RegsiterData): Promise<UserData | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "user" VALUES(
                DEFAULT,
                ${false},
                '${registerData.username}',
                '${registerData.password}',
                '${registerData.email}',
                '${registerData.firstname}',
                '${registerData.lastname}',
                '${registerData.address}',
                DEFAULT,
                DEFAULT)
            RETURNING *
            `);
        if (res?.rows[0]?.userID) {
            return res?.rows[0];
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewEmployee(registerData: RegsiterData): Promise<UserData | null> {
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
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function editProfileDetailsInDB(userID: number, newDetails: NewProfileDetails) {
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
        return null
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function changePasswordInDB(userID: number, newPasswordHash: string) {
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
        return null
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}