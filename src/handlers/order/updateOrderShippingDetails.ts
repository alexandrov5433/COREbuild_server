import { Request, Response } from "express";
import logger from "../../config/winston.js";
import { getOrderByOrderID, updateOrderShippingDetailsInDB } from "../../data/order.js";

export default async function updateOrderShippingDetails(req: Request, res: Response) {
    try {
        const orderID = Number(req.params.orderID) || null;
        if (!orderID) {
            throw new Error('OrderID is missing.');
        }
        const newShippingData = {
            shipping_status: {
                pending: 'pending',
                sent: 'sent'
            }[req.body.shipping_status || ''] || null,
            shipping_speditor: req.body.shipping_speditor || null,
            shipment_tracking_code: req.body.shipment_tracking_code || null
        };
        if (!newShippingData.shipping_status) {
            throw new Error('Missing shipping status.');
        }
        if (newShippingData.shipping_status == 'pending') {
            newShippingData.shipping_speditor = null;
            newShippingData.shipment_tracking_code = null;
        }
        const orderData = await getOrderByOrderID(orderID);
        if (!orderData) {
            throw new Error(`Could not find order with ID: ${orderID}.`);
        }
        console.log(newShippingData);
        
        const updatedOrder = await updateOrderShippingDetailsInDB(orderID, newShippingData);
        if (!updatedOrder) {
            throw new Error('Could not update order.');
        }
        res.status(200);
        res.json({
            msg: 'Order updated.'
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