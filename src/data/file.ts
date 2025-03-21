import logger from "../config/winston.js";
import { FileData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function createFile(fileName: string): Promise<FileData | boolean | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "file" VALUES(
                DEFAULT,
                '${fileName}')
            RETURNING *
            `)
        if (res.rows[0]?.fileID) {
            return res.rows[0];
        }
        return false;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function getFileNameById(fileID: number): Promise<string | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows[0]?.name || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function removeFile(fileID: number) {
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
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function getFileById(fileID: number): Promise<FileData | null> {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows?.[0] || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}