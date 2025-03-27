import logger from "../../config/winston.js";
import { addProductToFavorite } from "../../data/favorite.js";
export default async function addNewProductToFavorite(req, res) {
    try {
        const userID = req.cookies.userSession?.userID;
        const productID = Number(req.params.productID) || null;
        if (!userID) {
            throw new Error('The userID is missing.');
        }
        if (!productID) {
            throw new Error('The productID is missing.');
        }
        const favorite = await addProductToFavorite(userID, productID);
        if (!favorite) {
            throw new Error('Could not add product to favorites.');
        }
        res.status(200);
        res.json({
            msg: 'Product added to favorites.',
            payload: favorite
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
//# sourceMappingURL=addNewProductToFavorite.js.map