import { Request, Response } from "express";
import { hasCustomerBoughtProduct } from "../../data/order.js";
import { addReview, hasCustomerReviewedProduct } from "../../data/review.js";
import logger from "../../config/winston.js";

export default async function addNewReview(req: Request, res: Response) {
    try {
        const userID = Number(req.cookies.userSession.userID);
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        const reviewData = {
            rating: Number(req.body.rating) || null,
            comment: req.body.comment as string || '',
            reviewerID: userID,
            time: new Date().getTime(),
            isVerifiedPurchase: false,
            productID: Number(req.body.productID) || null
        }
        if (!reviewData.productID) {
            res.status(400);
            res.json({
                msg: 'Missing productID.'
            });
            res.end();
            return;
        }
        const customerHasReviewedProduct = await hasCustomerReviewedProduct(reviewData.reviewerID, reviewData.productID);
        if (customerHasReviewedProduct) {
            res.status(400);
            res.json({
                msg: 'You have already reviewed this product.'
            });
            res.end();
            return;
        }
        const purchaseVerified = await hasCustomerBoughtProduct(reviewData.reviewerID, reviewData.productID);
        logger.debug('purchaseVerified', purchaseVerified);
        
        reviewData.isVerifiedPurchase = Boolean(purchaseVerified);
        const newReview = await addReview(reviewData);
        if (!newReview) {
            res.status(400);
            res.json({
                msg: 'Problem occured. The new review could not be added.'
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'New review added.',
            payload: newReview
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