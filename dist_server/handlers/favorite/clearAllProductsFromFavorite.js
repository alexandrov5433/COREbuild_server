import logger from "../../config/winston.js";
import { clearAllProductsFromFavoriteFromDB } from "../../data/favorite.js";
export default async function clearAllProductsFromFavorite(req, res) {
    try {
        const userID = req.cookies.userSession?.userID;
        if (!userID) {
            throw new Error('The userID is missing.');
        }
        const favorite = await clearAllProductsFromFavoriteFromDB(userID);
        if (!favorite) {
            throw new Error('Could not clear products from favorites.');
        }
        res.status(200);
        res.json({
            msg: 'Products cleared from favorites.',
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
//# sourceMappingURL=clearAllProductsFromFavorite.js.map