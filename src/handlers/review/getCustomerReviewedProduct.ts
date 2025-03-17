import { Request, Response } from "express";
import { hasCustomerReviewedProduct } from "../../data/review.js";

export default async function getCustomerReviewedProduct(req: Request, res: Response) {
    try {
        const productID = Number(req.params.productID) || null;
        const userID = Number(req.cookies.userSession.userID);
        if (!productID) {
            res.status(400);
            res.json({
                msg: `Missing productID. Recieved: "${productID}".`
            });
            res.end();
            return;
        }
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        const hasReviewed = await hasCustomerReviewedProduct(userID, productID);
        if (hasReviewed == null) {
            res.status(400);
            res.json({
                msg: `Could not find data if customer has reviewed the product.`
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Data found.',
            payload: hasReviewed
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