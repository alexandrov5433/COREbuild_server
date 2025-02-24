import { pool } from "./postgres.ts";
import { UserData } from "./definitions.ts";

export async function findUserByUsername(username: string) {
    const client = await pool.connect();
    try {
        const res = client.query(`FROM user SELECT * WHERE (username=${username})`)
        return res;
    } catch (e) {
        console.error(e.message);
    } finally {
        client.release();
    }
}

export async function addNewCustomer(userData: UserData) {
    const client = await pool.connect();
    try {
        const res = client.query(`
            INSERT INTO user VALUES(
                DEFAULT,
                ${false},
                ${userData.username},
                ${userData.password},
                ${userData.email},
                ${userData.firstname},
                ${userData.lastname},
                'paypal',
                ${userData.address},
                DEFAULT,
                DEFAULT)
            RETURNING *
            `);
        return res;
    } catch (e) {
        console.error(e.message);
    } finally {
        client.release();
    }
}

export async function addNewEmployee(userData: UserData) {
    const client = await pool.connect();
    try {
        const res = client.query(`
            INSERT INTO user VALUES(
                DEFAULT,
                ${true},
                ${userData.username},
                ${userData.password},
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
    } finally {
        client.release();
    }
}