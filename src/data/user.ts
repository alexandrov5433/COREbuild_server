import { pool } from "./postgres.js";
import { RegsiterData, UserData } from "./definitions.js";
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

export async function findUserByUserID(userID: number) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE ("userID"=${userID})`)
        return res;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewCustomer(registerData: RegsiterData) {
    const client = await pool.connect();
    try {
        return await client.query(`
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
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewEmployee(registerData: RegsiterData) {
    const client = await pool.connect();
    try {
        return await client.query(`
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
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}