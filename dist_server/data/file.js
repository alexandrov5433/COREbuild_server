import logger from "../config/winston.js";
import { pool } from "./postgres.js";
export async function createFile(fileName) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "file" VALUES(
                DEFAULT,
                '${fileName}')
            RETURNING *
            `);
        if (res.rows[0]?.fileID) {
            return res.rows[0];
        }
        return false;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function getFileNameById(fileID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows[0]?.name || null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function removeFile(fileID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            DELETE FROM "file" WHERE "fileID"=$1
            RETURNING *
            `, [fileID]);
        if (res.rows[0]?.fileID) {
            return res.rows[0];
        }
        return false;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function getFileById(fileID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows?.[0] || null;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=file.js.map