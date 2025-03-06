import { ProductCreationData, ProductData, ProductsCatalogQueryParams } from "./definitions.js";
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

export async function searchProduct(queryParams: ProductsCatalogQueryParams) {
    const client = await pool.connect();
    try {
        const params = Object.entries(queryParams);
        const res = await client.query(`SELECT * FROM product`);
        let payload: Array<ProductData> = res.rows;
        for (let i = 0; i < params.length; i++) {
            const key = params[i][0];
            const value = params[i][1];
            if (!value) {
                continue;
            }
            if (['name', 'category', 'manufacturer'].includes(key)) {
                payload = payload.filter(el => (el[key].toLowerCase()).includes(value.toLowerCase()));
            }
            if (['priceFrom', 'priceTo'].includes(key)) {
                payload = payload.filter(el => {
                    if (key === 'priceFrom') {
                        return el.price >= Number(value);
                    } else if (key === 'priceTo') {
                        return el.price <= Number(value);
                    }
                });
            }
            if (key ===  'availableInStock') {
                payload = payload.filter(el => {
                    if (value === 'yes') {
                        return el.stockCount > 0;
                    } else if (value === 'no') {
                        return el.stockCount === 0;
                    }
                });
            }
        }
        return payload;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}
//     SELECT
//         "productID",
//         name,
//         setweight(to_tsvector('english', name), 'A') ||
//         setweight(to_tsvector('english', description), 'B') AS vector
//     FROM product
// )
// SELECT
//     product.name,
//     ts_rank(sv.vector, to_tsquery('english', $1)) AS rank
// FROM
//     search_vector sv
// JOIN
//     product ON product."productID" = sv."productID",
// WHERE
//     sv.vector @@ to_tsquery('english', $1)
// ORDER BY
//     rank DESC;
// WITH search_vector AS (
//     SELECT setweight(to_tsvector('english', product.name), 'A') ||
//         setweight(to_tsvector('english', product.description), 'B')
// )
// SELECT name, ts_rank(search_vector, my_query) AS rank
// FROM product, to_tsquery('english', $1) my_query
// WHERE search_vector @@ my_query
// ORDER BY rank DESC;