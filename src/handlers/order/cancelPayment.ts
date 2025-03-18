import { Request, Response } from "express";
import { deleteOrder, getOrderByID } from "../../data/order.js";
import logger from "../../config/winston.js";
import { increaseProductAvailability } from "../../data/product.js";

export default async function cancelPayment(req: Request, res: Response) {
    try {
        const paypalOrderID = req.params.paypalOrderID || null;
        if (!paypalOrderID) {
            res.status(401);
            res.json({
                msg: 'The orderID is missing.'
            });
            res.end();
            return;
        }
        const canceledOrder = await getOrderByID(paypalOrderID);
        if (!canceledOrder) {
            res.status(400);
            res.json({
                msg: 'Could not find order to cancel.'
            });
            res.end();
            return;
        }
        const actions = await Promise.all([
            increaseProductAvailability(canceledOrder.content),
            deleteOrder(canceledOrder.id)
        ]);
        if (
            !actions[0].allProductsWereSuccessfullyIncreased ||
            !actions[1]
        ) {
            res.status(400);
            res.json({
                msg: 'Could not revert changes in database.'
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Order canceled and deleted.'
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