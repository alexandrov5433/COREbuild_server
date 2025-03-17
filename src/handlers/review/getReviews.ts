import { Request, Response } from "express";
import { getReviewsForProduct } from "../../data/review.js";
import url from 'node:url';

export default async function getReviews(req: Request, res: Response) {
    try {
        const queryParams = url.parse(req.url, true).query;
        const productID = Number(queryParams?.productID) || null;
        const currentPage = Number(queryParams?.currentPage) || 1;
        if (!productID) {
            res.status(400);
            res.json({
                msg: `Missing productID. Recieved: "${productID}".`
            });
            res.end();
            return;
        }
        const reviews = await getReviewsForProduct(productID, currentPage);
        if (!reviews) {
            res.status(400);
            res.json({
                msg: `Could not fetch reviews.`
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Reviews were found.',
            payload: reviews
        });
        res.end();
    } catch (e) {
        console.log('ERROR:', e.message);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}