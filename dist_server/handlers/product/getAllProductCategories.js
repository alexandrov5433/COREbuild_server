import { getAllProdcutsCategoriesFromDB } from "../../data/product.js";
import logger from "../../config/winston.js";
export default async function getAllProductCategories(req, res) {
    try {
        const categories = await getAllProdcutsCategoriesFromDB();
        if (!categories) {
            res.status(400);
            res.json({
                msg: `Could not find any categories.`
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Categories found.',
            payload: categories
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
//# sourceMappingURL=getAllProductCategories.js.map