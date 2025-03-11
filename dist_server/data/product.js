import { convertCentToWhole } from "../util/currency.js";
import { pool } from "./postgres.js";
export async function createProduct(productData) {
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
            `);
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
export async function searchProducts(queryParams) {
    const client = await pool.connect();
    try {
        let currentPage = Number(queryParams.currentPage) || 1;
        const itemsPerPage = Number(queryParams.itemsPerPage) || 12;
        const params = Object.entries(queryParams);
        const res = await client.query(`
            SELECT
                p."productID",
                p."name",
                p."description",
                c."name" AS category,
                p."price",
                p."stockCount",
                p."manufacturer",
                p."specsDocID",
                p."thumbnailID",
                p."pictures",
                p."reviews"
            FROM
                product p
            JOIN
                category c ON p."categoryID" = c."categoryID";
            
            `);
        let payload = res.rows;
        for (let i = 0; i < params.length; i++) {
            const key = params[i][0];
            const value = params[i][1];
            if (!key || !value || key === 'currentPage' || key === 'itemsPerPage') {
                continue;
            }
            if (['name', 'category', 'manufacturer'].includes(key)) {
                payload = payload.filter(el => {
                    const regex = new RegExp(`${value}`, 'i');
                    return regex.test(el[key]);
                });
            }
            if (['priceFrom', 'priceTo'].includes(key)) {
                payload = payload.filter(el => {
                    if (key === 'priceFrom') {
                        return convertCentToWhole(el.price) >= Number(value);
                    }
                    else if (key === 'priceTo') {
                        return convertCentToWhole(el.price) <= Number(value);
                    }
                });
            }
            if (key === 'availableInStock') {
                payload = payload.filter(el => {
                    if (value === 'yes') {
                        return el.stockCount > 0;
                    }
                    return true;
                });
            }
        }
        const pagesCount = Math.ceil(payload.length / itemsPerPage);
        if (currentPage > pagesCount) {
            currentPage = 1;
        }
        const currentPagePortion = payload.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return {
            pagesCount,
            currentPage,
            products: currentPagePortion
        };
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
export async function findProductById(productID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM product WHERE product."productID"=$1;
            `, [productID]);
        return res.rows[0] || null;
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=product.js.map