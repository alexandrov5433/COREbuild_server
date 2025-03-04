import { ProductCreationData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function createProduct(productData: ProductCreationData) {
    const client = await pool.connect();
    try {
        const specsDocIDVal = productData.specsDocID || 'DEFAULT';
        const picturesVal = productData.pictures ? `'{${productData.pictures.join(', ')}}'` : 'DEFAULT';
        return await client.query(`
            INSERT INTO "product" VALUES(
                DEFAULT,
                '${productData.name}',
                '${productData.description}',
                ${productData.categoryID},
                ${productData.price},
                ${productData.stockCount},
                '${productData.manufacturer}',
                ${specsDocIDVal},
                ${productData.thumbnailID},
                ${picturesVal},
                DEFAULT)
            RETURNING *
            `)
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}