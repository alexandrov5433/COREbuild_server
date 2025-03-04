import { pool } from "./postgres.js";

export async function createCategory(categoryName: string) {
    const client = await pool.connect();
    try {
        return await client.query(`
                WITH insertion AS (
                    INSERT INTO category VALUES (
                        DEFAULT,
                        '${categoryName}'
                    )
                    ON CONFLICT (name) DO NOTHING
                    RETURNING *
                )
                SELECT * FROM insertion
                UNION
                SELECT * FROM category WHERE (name='${categoryName}')
            `);
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}