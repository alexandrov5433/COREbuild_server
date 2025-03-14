import { addNewOrder } from "../../data/order.js";
import { getTotalPriceForProducts } from "../../data/product.js";
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
            total_price: 0
        };
        const result = await getTotalPriceForProducts(orderData.content);
        if (!result) {
            // null was returned       
            res.status(400);
            res.json({
                msg: 'And error occured while processing your request. Please try again later or contact us.',
            });
            res.end();
            return;
        }
        const { total_price: total_price_products, allPricesSummed, missingProducts } = result;
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
            payload: newOrder
        });
        res.end();
    }
    catch (e) {
        console.log('ERROR:', e);
        res.status(500);
        res.json({
            msg: `Error: ${e.message}`
        });
        res.end();
    }
}
//# sourceMappingURL=placeOrder.js.map