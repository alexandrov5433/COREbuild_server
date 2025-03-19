import { findProductById } from "../../data/product.js";
import logger from "../../config/winston.js";
export default async function productDetails(req, res) {
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
        const productData = await findProductById(productID);
        if (!productData) {
            res.status(400);
            res.json({
                msg: `Could not find a product with ID: "${productID}".`
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'TODO',
            payload: productData
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
//# sourceMappingURL=product-details.js.map