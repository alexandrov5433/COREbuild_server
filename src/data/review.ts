import { PoolClient } from "pg";
import logger from "../config/winston.js";
import { ReviewData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function addReview(reviewData: ReviewData): Promise<ReviewData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            INSERT INTO "review"
            VALUES (
                DEFAULT,
                $1,
                $2,
                $3,
                $4,
                $5,
                $6
            )
            RETURNING *;
            `, [
            reviewData.rating,
            reviewData.comment,
            reviewData.reviewerID,
            reviewData.time,
            reviewData.isVerifiedPurchase,
            reviewData.productID,
        ]);
        return res.rows[0] || null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function hasCustomerReviewedProduct(userID: number, productID: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "review"
            WHERE "reviewerID"=$1 AND "productID"=$2;
            `, [userID, productID]);
        if (res.rows[0]?.reviewID) {
            return true;
        }
        return false;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getReviewsForProduct(productID: number, currentPage: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        if (currentPage <= 0) {
            currentPage = 1;
        }
        const reviewsPerPage = 5;
        const res = await client.query(`
            SELECT
                r."reviewID",
                r."productID",
                r."rating",
                r."comment",
                u."username" AS "username",
                r."time",
                r."isVerifiedPurchase"
            FROM "review" r
            JOIN "user" u ON r."reviewerID" = u."userID"
            WHERE r."productID"=$1;
            `, [productID]);  
        let payload: Array<ReviewData> = res.rows || [];
        const pagesCount = Math.ceil(payload.length / reviewsPerPage);
        if (currentPage > pagesCount) {
            currentPage = 1;
        }
        const currentPagePortion = payload.slice(
            (currentPage - 1) * reviewsPerPage,
            currentPage * reviewsPerPage
        );
        return {
            pagesCount,
            currentPage,
            reviews: currentPagePortion
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getRatingAndReviewCountForProduct(productID: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT "rating" FROM "review"
            WHERE "productID"=$1;
            `, [productID]); 
        const reviewsCount = (res.rows || []).length;
        let rating = 0;
        if (reviewsCount > 0) {
            rating = (res.rows || []).reduce((acc, cur) => {
                acc = acc + cur.rating;
                return acc;
            }, 0) / reviewsCount;
        }
        return {
            rating,
            reviewsCount
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}