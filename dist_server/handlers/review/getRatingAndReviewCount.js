import { getRatingAndReviewCountForProduct } from "../../data/review.js";
import logger from "../../config/winston.js";
export default async function getRatingAndReviewCount(req, res) {
    try {
        const productID = Number(req.params.productID) || null;
        if (!productID) {
            res.status(400);
            res.json({
                msg: `Missing productID. Recieved: "${productID}".`
            });
            res.end();
            return;
        }
        const ratingAndCount = await getRatingAndReviewCountForProduct(productID);
        if (!ratingAndCount) {
            res.status(400);
            res.json({
                msg: 'Problem occured. Could not get the rating and reviews count for the product.'
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Rating and reviews count found.',
            payload: ratingAndCount
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
//# sourceMappingURL=getRatingAndReviewCount.js.map