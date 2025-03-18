import { pool } from "./postgres.js";
export async function findUserByUsername(username) {
    const client = await pool.connect();
    try {
        const res = await client.query(`SELECT * FROM "user" WHERE (username='${username}')`);
        return res;
    }
    catch (e) {
        console.error(e.message);
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
        console.error(e.message);
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
        console.error(e.message);
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
        return res;
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
export async function addNewCustomer(registerData) {
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
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
export async function addNewEmployee(registerData) {
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
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=user.js.map