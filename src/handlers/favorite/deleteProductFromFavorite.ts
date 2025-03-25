import { Request, Response } from "express";
import logger from "../../config/winston.js";
import { removeProductFromFavorite } from "../../data/favorite.js";

export default async function deleteProductFromFavorite(req: Request, res: Response) {
    try {
        const userID = req.cookies.userSession?.userID;
        const productID = Number(req.params.productID) || null;
        if (!userID) {
            throw new Error('The userID is missing.');
        }
        if (!productID) {
            throw new Error('The productID is missing.');
        }
        const favorite = await removeProductFromFavorite(userID, productID);
        if (!favorite) {
            throw new Error('Could not delete product from favorites.');
        }
        res.status(200);
        res.json({
            msg: 'Product deleted from favorites.',
            payload: favorite
        });
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}