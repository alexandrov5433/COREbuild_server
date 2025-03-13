import { Request, Response } from "express";
import { OrderData } from "../../data/definitions.js";
import { addNewOrder } from "../../data/order.js";

export default async function placeOrder(req: Request, res: Response) {
    try {
        const userID = Number(req.cookies.userSession.userID);
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        const orderData: OrderData = {
            payment_status: 'pending',
            shipping_status: 'pending',
            content: JSON.parse(req.body.order || {}),
            recipient: userID,
            placement_time: new Date().getTime()
        }
        const newOrder: OrderData | string | null = await addNewOrder(orderData);

        if (typeof newOrder === 'string') {
            res.status(400);
            res.json({
                msg: newOrder
            });
            res.end();
            return;
        }
        if (!newOrder) {
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
            msg: 'Order placed.',
            payload: newOrder
        });
        res.end();
    } catch (e) {
        console.log('ERROR:', e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}