import { PoolClient } from "pg";
import logger from "../config/winston.js";
import { FileData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function createFile(fileName: string): Promise<FileData | boolean | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
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
        client?.release();
    }
}

export async function getFileNameById(fileID: number): Promise<string | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows[0]?.name || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function removeFile(fileID: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
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
        client?.release();
    }
}

export async function getFileById(fileID: number): Promise<FileData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM file WHERE "fileID"=$1`, [fileID]);
        return res?.rows?.[0] || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}