import { PoolClient } from "pg";
import logger from "../config/winston.js";
import { FavoriteData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function createFavorite(userID: number): Promise<FavoriteData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            INSERT INTO "favorite" VALUES (
                DEFAULT,
                $1,
                DEFAULT
            )
            RETURNING *;
        `, [userID]);
        const favorite = res.rows[0] || null;
        if (favorite && favorite.id) {
            return favorite;
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function removeProductFromFavorite(userID: number, productID: number): Promise<FavoriteData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "favorite" WHERE "userID"=$1;
        `, [userID]);
        const favorite: FavoriteData | null = res.rows[0] || null;
        if (!favorite) {
            throw new Error(`Could not find favorite list for user with ID: ${userID}.`);
        }
        const newList = favorite.products.filter(id => id != productID);
        const newRes = await client.query(`
            UPDATE "favorite" SET "products"=$1 WHERE "userID"=$2 RETURNING *;
            `, [newList, userID]);
        const newFavorite: FavoriteData | null = newRes.rows[0] || null;
        if (!newFavorite) {
            throw new Error(`Could not update favorite list for user with ID: ${userID}.`);
        }
        return newFavorite;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function addProductToFavorite(userID: number, productID: number): Promise<FavoriteData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "favorite" WHERE "userID"=$1;
        `, [userID]);
        const favorite: FavoriteData | null = res.rows[0] || null;
        if (!favorite) {
            throw new Error(`Could not find favorite list for user with ID: ${userID}.`);
        }
        const list = favorite.products;
        if (list.includes(productID)) {
            return favorite;
        }
        list.push(productID);
        const newRes = await client.query(`
            UPDATE "favorite" SET "products"=$1 WHERE "userID"=$2 RETURNING *;
            `, [list, userID]);
        const newFavorite: FavoriteData | null = newRes.rows[0] || null;
        if (!newFavorite) {
            throw new Error(`Could not update favorite list for user with ID: ${userID}.`);
        }
        return newFavorite;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function clearAllProductsFromFavoriteFromDB(userID: number): Promise<FavoriteData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const newRes = await client.query(`
            UPDATE "favorite" SET "products"='{}' WHERE "userID"=$2 RETURNING *;
            `);
        const newFavorite: FavoriteData | null = newRes.rows[0] || null;
        if (!newFavorite) {
            throw new Error(`Could not update favorite list for user with ID: ${userID}.`);
        }
        return newFavorite;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getFavoriteForUser(userID: number): Promise<FavoriteData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "favorite" WHERE "userID"=$1;
            `, [userID]);
        const favorite: FavoriteData | null = res.rows[0] || null;
        if (!favorite) {
            throw new Error(`Could not find favorite list for user with ID: ${userID}.`);
        }
        return favorite;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}