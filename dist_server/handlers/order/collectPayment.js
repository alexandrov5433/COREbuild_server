import { ordersController } from "../../config/paypal.js";
import { ApiError } from "@paypal/paypal-server-sdk";
import { setOrderPaymentStatusToPaid } from "../../data/order.js";
import { emptyUserCart } from "../../data/cart.js";
import logger from "../../config/winston.js";
export default async function collectPayment(req, res) {
    try {
        const paypalOrderID = req.params.paypalOrderID || null;
        const userID = Number(req.cookies.userSession.userID);
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        if (!paypalOrderID) {
            res.status(401);
            res.json({
                msg: 'The orderID is missing.'
            });
            res.end();
            return;
        }
        const collect = {
            id: paypalOrderID,
            prefer: "return=minimal",
        };
        try {
            const { body } = await ordersController.ordersCapture(collect);
            const paypal_order_id = JSON.parse(body).id;
            const updatedOrderData = await setOrderPaymentStatusToPaid(paypal_order_id);
            if (!updatedOrderData) {
                // order status could not be modified
                res.status(400);
                res.json({
                    msg: `The payment status of order ID: ${paypal_order_id} could not be modified.`
                });
                res.end();
                return;
            }
            const userData = await emptyUserCart(userID);
            if (!userData) {
                res.status(400);
                res.json({
                    msg: `The user cart could not be emptied. Please empty it and try again.`
                });
                res.end();
                return;
            }
            res.status(200);
            res.json({
                msg: 'Order placed.',
                payload: {
                    updatedOrderData,
                    userData
                }
            });
            res.end();
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.message);
            }
        }
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
//# sourceMappingURL=collectPayment.js.map