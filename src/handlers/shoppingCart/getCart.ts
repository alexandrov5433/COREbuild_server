import { Request, Response } from "express";
import { addProductToCart, getCartForUser } from "../../data/cart.js";
import logger from "../../config/winston.js";

export default async function getCart(req: Request, res: Response) {
    try {
        const userID = req.params.userID;     
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }

        const cart = await getCartForUser(Number(userID));
        if (!cart) {
            // false or null (error)
            res.status(400);
            res.json({
                msg: 'Could not retrieve cart.',
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Card found.',
            payload: cart
        });
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}