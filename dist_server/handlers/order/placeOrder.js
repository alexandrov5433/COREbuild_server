import { addNewOrder } from "../../data/order.js";
import { checkProductAvailability, getTotalPriceForProducts } from "../../data/product.js";
import { ApiError } from '@paypal/paypal-server-sdk';
import { convertCentToWhole } from "../../util/currency.js";
import { ordersController } from "../../config/paypal.js";
import logger from "../../config/winston.js";
export default async function placeOrder(req, res) {
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
        const orderData = {
            payment_status: 'pending',
            shipping_status: 'pending',
            content: JSON.parse(req.body.order || {}),
            recipient: userID,
            placement_time: new Date().getTime(),
            total_price: 0,
            paypal_order_id: '',
            shipping_speditor: null,
            shipment_tracking_code: null
        };
        const checkResult = await checkProductAvailability(orderData.content);
        if (!checkResult) {
            // null was returned       
            res.status(400);
            res.json({
                msg: `And error occured while processing your request. Please try again later or contact us.`,
            });
            res.end();
            return;
        }
        const { allProductsAreAvailable, unavailableProducts } = checkResult;
        if (!allProductsAreAvailable) {
            res.status(400);
            res.json({
                msg: `The products with IDs: ${Object.keys(unavailableProducts).join(', ')} are unavailbale. Please empty your cart and try again.`,
            });
            res.end();
            return;
        }
        const totalPriceResult = await getTotalPriceForProducts(orderData.content);
        if (!totalPriceResult) {
            // null was returned       
            res.status(400);
            res.json({
                msg: 'And error occured while processing your request. Please try again later or contact us.',
            });
            res.end();
            return;
        }
        const { total_price: total_price_products, allPricesSummed, missingProducts } = totalPriceResult;
        if (allPricesSummed) {
            orderData.total_price = total_price_products;
        }
        else {
            // some products are missing       
            res.status(400);
            res.json({
                msg: `Some products in your order were not found. Product IDs: ${Object.keys(missingProducts).join(', ')}. Please emtpy the cart and retry.`,
            });
            res.end();
            return;
        }
        const orderTotalCost = convertCentToWhole(total_price_products).toString();
        const collect = {
            body: {
                intent: "CAPTURE",
                purchaseUnits: [
                    {
                        amount: {
                            currencyCode: "EUR",
                            value: orderTotalCost,
                            breakdown: {
                                itemTotal: {
                                    currencyCode: "EUR",
                                    value: orderTotalCost,
                                },
                            },
                        },
                    },
                ],
            },
            prefer: "return=minimal",
        };
        try {
            const { body } = await ordersController.ordersCreate(collect);
            const paypal_order_id = JSON.parse(body).id;
            orderData.paypal_order_id = paypal_order_id;
            const newOrder = await addNewOrder(orderData);
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
                payload: paypal_order_id
            });
            res.end();
        }
        catch (error) {
            if (error instanceof ApiError) {
                // const { statusCode, headers } = error;
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
//# sourceMappingURL=placeOrder.js.map