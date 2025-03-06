import { pool } from "./postgres.js";

export async function createFile(fileName: string) {
    const client = await pool.connect();
    try {
        return await client.query(`
            INSERT INTO "file" VALUES(
                DEFAULT,
                '${fileName}')
            RETURNING *
            `)
    } catch (e) {
        console.error(e.message);
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
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}