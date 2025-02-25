import { pool } from "./postgres.ts";
import { RegsiterData } from "./definitions.ts";

export async function findUserByUsername(username: string) {
    const client = await pool.connect();
    try {
        const res = await client.query(`FROM user SELECT * WHERE (username=${username})`)
        return res;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewCustomer(registerData: RegsiterData) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO user VALUES(
                DEFAULT,
                ${false},
                ${registerData.username},
                ${registerData.password},
                ${registerData.email},
                ${registerData.firstname},
                ${registerData.lastname},
                ${registerData.prefered_payment_method},
                ${registerData.address},
                DEFAULT,
                DEFAULT)
            RETURNING *
            `);
        return res;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}

export async function addNewEmployee(registerData: RegsiterData) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO user VALUES(
                DEFAULT,
                ${true},
                ${registerData.username},
                ${registerData.password},
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT,
                DEFAULT)
            RETURNING *
            `);
        return res;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}