import logger from "../../config/winston.js";
import { getFavoriteForUser } from "../../data/favorite.js";
export default async function getFavorite(req, res) {
    try {
        const userID = req.cookies.userSession?.userID;
        if (!userID) {
            throw new Error('The userID is missing.');
        }
        const favorite = await getFavoriteForUser(userID);
        if (!favorite) {
            throw new Error('Could find favorite products.');
        }
        res.status(200);
        res.json({
            msg: 'Favorite products found.',
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
//# sourceMappingURL=getFavorite.js.map