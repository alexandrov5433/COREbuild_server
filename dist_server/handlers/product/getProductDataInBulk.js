import logger from "../../config/winston.js";
import { findProductById } from "../../data/product.js";
export default async function getProductDataInBulk(req, res) {
    try {
        const allProductIDs = req.body?.allProductIDs || null;
        const isInvalidValueIncluded = allProductIDs.find(v => !Number(v));
        if (isInvalidValueIncluded) {
            throw new Error('One or more values are not numbers.');
        }
        const results = await Promise.all(allProductIDs.reduce((acc, cur) => {
            acc.push(findProductById(cur));
            return acc;
        }, []));
        res.status(200);
        res.json({
            msg: 'Favorite products found.',
            payload: results
        });
        res.end();
    }
    catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}
//# sourceMappingURL=getProductDataInBulk.js.map