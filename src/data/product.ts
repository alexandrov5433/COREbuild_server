import { QueryResult } from "pg";
import { convertCentToWhole } from "../util/currency.js";
import { ProductCreationData, ProductData, ProductInfosEditingData, ProductsCatalogQueryParams, ShoppingCartData } from "./definitions.js";
import { pool } from "./postgres.js";
import logger from "../config/winston.js";

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
                )
            RETURNING *
            `)
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function searchProducts(queryParams: ProductsCatalogQueryParams) {
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
                p."pictures"
            FROM
                product p
            JOIN
                category c ON p."categoryID" = c."categoryID";
            
            `);
        let payload: Array<ProductData> = res.rows;
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
                    } else if (key === 'priceTo') {
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
        const currentPagePortion = payload.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return {
            pagesCount,
            currentPage,
            products: currentPagePortion
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function findProductById(productID: number): Promise<ProductData | null> {
    const client = await pool.connect();
    try {
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
                p."pictures"
            FROM
                product p
            JOIN
                category c ON p."categoryID" = c."categoryID"
            WHERE p."productID"=$1;
            `, [productID]);
        return res.rows[0] || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function checkProductAvailability(items: ShoppingCartData) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const checks = [];
        itemEntries.forEach(([productID, count]) => {
            checks.push(
                client.query(`
                    SELECT "stockCount" FROM "product" WHERE "productID"=$1 AND "stockCount">=$2;
                `, [productID, count])
            );
        });
        const results = await Promise.all(checks);
        let allProductsAreAvailable = true;
        const availableProducts = {};
        const unavailableProducts = {};
        for (let i = 0; i < results.length; i++) {
            const val = (results[i] as QueryResult).rows[0].stockCount || null;
            const [id, count] = itemEntries[i];
            if (Number.isInteger(val)) {
                availableProducts[id] = count;
            } else {
                allProductsAreAvailable = false;
                unavailableProducts[id] = count;
            }
        }
        return {
            allProductsAreAvailable,
            availableProducts,
            unavailableProducts
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function reduceProductAvailability(items: ShoppingCartData) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const updates = [];
        itemEntries.forEach(([productID, count]) => {
            updates.push(
                client.query(`
                    UPDATE "product" SET "stockCount"="stockCount"-$2
                    WHERE "productID"=$1 AND "stockCount">=$2
                    RETURNING *;
                `, [productID, count])
            );
        });
        const results = await Promise.all(updates);
        let allProductsWereSuccessfullyReduced = true;
        const reducedProducts: ShoppingCartData = {};
        for (let i = 0; i < results.length; i++) {
            const val = (results[i] as QueryResult).rows[0].stockCount || null;
            if (Number.isInteger(val)) {
                const [reducedId, reducedCount] = itemEntries[i];
                reducedProducts[reducedId] = reducedCount;
            } else {
                allProductsWereSuccessfullyReduced = false;
            }
        }
        return {
            allProductsWereSuccessfullyReduced,
            reducedProducts
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function increaseProductAvailability(items: ShoppingCartData) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const updates = [];
        itemEntries.forEach(([productID, count]) => {
            updates.push(
                client.query(`
                    UPDATE "product" SET "stockCount"="stockCount"+$2
                    WHERE "productID"=$1
                    RETURNING *;
                `, [productID, count])
            );
        });
        const results = await Promise.all(updates);
        let allProductsWereSuccessfullyIncreased = true;
        const increasedProducts: ShoppingCartData = {};
        for (let i = 0; i < results.length; i++) {
            const val = (results[i] as QueryResult).rows[0].stockCount || null;
            if (Number.isInteger(val)) {
                const [increasedId, increasedCount] = itemEntries[i];
                increasedProducts[increasedId] = increasedCount;
            } else {
                allProductsWereSuccessfullyIncreased = false;
            }
        }
        return {
            allProductsWereSuccessfullyIncreased,
            increasedProducts
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function getTotalPriceForProducts(items: ShoppingCartData) {
    const client = await pool.connect();
    try {
        const itemEntries = Object.entries(items);
        const priceQueries = [];
        itemEntries.forEach(([productID, _]) => {
            priceQueries.push(
                client.query(`
                    SELECT "price" FROM "product" WHERE "productID"=$1;
                `, [productID])
            );
        });
        const prices = await Promise.all(priceQueries);
        let total_price = 0;
        let allPricesSummed = true;
        const missingProducts: ShoppingCartData = {};
        for (let i = 0; i < prices.length; i++) {
            const val = (prices[i] as QueryResult).rows[0].price || null;
            const [id, count] = itemEntries[i];
            if (Number.isInteger(val)) {
                total_price += val * count;
            } else {
                missingProducts[id] = count;
                allPricesSummed = false;
            }
        }
        return {
            total_price,
            allPricesSummed,
            missingProducts
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}

export async function editProductInformation(productID: number, productData: ProductInfosEditingData) {
    const client = await pool.connect();
    try {
        return await client.query(`
            UPDATE product SET
                "name"=$1,
                "description"=$2,
                "categoryID"=$3,
                "price"=$4,
                "stockCount"=$5,
                "manufacturer"=$6
            WHERE "productID"=$7
            RETURNING *;
            `, [
                productData.name,
                productData.description,
                productData.categoryID,
                productData.price,
                productData.stockCount,
                productData.manufacturer,
                productID
            ]);
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client.release();
    }
}