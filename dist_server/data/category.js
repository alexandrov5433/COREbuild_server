import logger from "../config/winston.js";
import { pool } from "./postgres.js";
export async function createCategory(categoryName) {
    let client;
    try {
        client = await pool.connect();
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
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client?.release();
    }
}
//# sourceMappingURL=category.js.map