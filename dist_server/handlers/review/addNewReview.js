import { hasCustomerBoughtProduct } from "../../data/order.js";
import { addReview, hasCustomerReviewedProduct } from "../../data/review.js";
import logger from "../../config/winston.js";
import { findUserByUserID } from "../../data/user.js";
export default async function addNewReview(req, res) {
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
            comment: req.body.comment || '',
            reviewerID: userID,
            time: new Date().getTime(),
            isVerifiedPurchase: false,
            productID: Number(req.body.productID) || null
        };
        if (!reviewData.productID) {
            res.status(400);
            res.json({
                msg: 'Missing productID.'
            });
            res.end();
            return;
        }
        const userData = await findUserByUserID(userID);
        if (!userData || userData?.rows[0]?.is_employee) {
            res.status(400);
            res.json({
                msg: 'Reviewer must be a customer user.'
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
    }
    catch (e) {
        logger.error(e.message, e);
        res.status(500);
        res.json({
            msg: `Error: ${e.message}`
        });
        res.end();
    }
}
//# sourceMappingURL=addNewReview.js.map