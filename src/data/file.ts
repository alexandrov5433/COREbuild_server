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