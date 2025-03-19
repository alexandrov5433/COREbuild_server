import logger from "../config/winston.js";
import { pool } from "./postgres.js";
export async function createFile(fileName) {
    const client = await pool.connect();
    try {
        return await client.query(`
            INSERT INTO "file" VALUES(
                DEFAULT,
                '${fileName}')
            RETURNING *
            `);
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
//# sourceMappingURL=file.js.map