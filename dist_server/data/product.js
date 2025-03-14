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
export async function checkProductAvailability(items) {
    const client = await pool.connect();
    try {
        const checks = [];
        Object.entries(items).forEach(([productID, count]) => {
            checks.push(client.query(`
                    SELECT "stockCount" FROM "product" WHERE "productID"=$1 AND "stockCount">=$2;
                `, [productID, count]));
        });
        const results = await Promise.all(checks);
        let allProductsAreAvailable = true;
        for (let i = 0; i < results.length; i++) {
            const val = results[i].rows[0].stockCount || null;
            if (!Number.isInteger(val)) {
                allProductsAreAvailable = false;
                break;
            }
        }
        return allProductsAreAvailable;
    }
    catch (e) {
        console.error(e.message);
        return null;
    }
    finally {
        client.release();
    }
}
export async function reduceProductAvailability(items) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const updates = [];
        itemEntries.forEach(([productID, count]) => {
            updates.push(client.query(`
                    UPDATE "product" SET "stockCount"="stockCount"-$2
                    WHERE "productID"=$1 AND "stockCount">=$2
                    RETURNING *;
                `, [productID, count]));
        });
        const results = await Promise.all(updates);
        let allProductsWereSuccessfullyReduced = true;
        const reducedProducts = {};
        for (let i = 0; i < results.length; i++) {
            const val = results[i].rows[0].stockCount || null;
            if (Number.isInteger(val)) {
                const [reducedId, reducedCount] = itemEntries[i];
                reducedProducts[reducedId] = reducedCount;
            }
            else {
                allProductsWereSuccessfullyReduced = false;
            }
        }
        return {
            allProductsWereSuccessfullyReduced,
            reducedProducts
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
export async function increaseProductAvailability(items) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const updates = [];
        itemEntries.forEach(([productID, count]) => {
            updates.push(client.query(`
                    UPDATE "product" SET "stockCount"="stockCount"+$2
                    WHERE "productID"=$1
                    RETURNING *;
                `, [productID, count]));
        });
        const results = await Promise.all(updates);
        let allProductsWereSuccessfullyIncreased = true;
        const increasedProducts = {};
        for (let i = 0; i < results.length; i++) {
            const val = results[i].rows[0].stockCount || null;
            if (Number.isInteger(val)) {
                const [increasedId, increasedCount] = itemEntries[i];
                increasedProducts[increasedId] = increasedCount;
            }
            else {
                allProductsWereSuccessfullyIncreased = false;
            }
        }
        return {
            allProductsWereSuccessfullyIncreased,
            increasedProducts
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
export async function getTotalPriceForProducts(items) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const priceQueries = [];
        itemEntries.forEach(([productID, _]) => {
            priceQueries.push(client.query(`
                    SELECT "price" FROM "product" WHERE "productID"=$1;
                `, [productID]));
        });
        const prices = await Promise.all(priceQueries);
        let total_price = 0;
        let allPricesSummed = true;
        const missingProducts = {};
        for (let i = 0; i < prices.length; i++) {
            const val = prices[i].rows[0].price || null;
            if (Number.isInteger(val)) {
                total_price += val;
            }
            else {
                const [missingId, missingCount] = itemEntries[i];
                missingProducts[missingId] = missingCount;
                allPricesSummed = false;
            }
        }
        return {
            total_price,
            allPricesSummed,
            missingProducts
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
//# sourceMappingURL=product.js.map