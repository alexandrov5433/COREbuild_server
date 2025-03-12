import { Request, Response } from "express";
import { removeProductFromCart } from "../../data/cart.js";

export default async function removeFromCart(req: Request, res: Response) {
    try {
        const userID = req.cookies.userSession.userID;
        console.log(req.body);
        
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        const productToRemove = {
            productID: Number(req.body.productID) || 0,
            count: Number(req.body.count) || 0,
        };
        if (!productToRemove.productID || !productToRemove.count) {
            res.status(400);
            res.json({
                msg: 'Missing either prodcutID or count.'
            });
            res.end();
            return;
        }
        const updatedCart = await removeProductFromCart(
            userID,
            productToRemove.productID,
            productToRemove.count
        );
        if (typeof updatedCart == 'string') {
            // string (handled error message)
            res.status(400);
            res.json({
                msg: updatedCart,
            });
            res.end();
            return;
        }
        if (!updatedCart) {
            // false or null (error)
            res.status(400);
            res.json({
                msg: 'And error occured while processing your request. Please try again later or contact us.',
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Product removed.',
            payload: updatedCart
        });
        res.end();
    } catch (e) {
        console.log('ERROR:', e.message);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}