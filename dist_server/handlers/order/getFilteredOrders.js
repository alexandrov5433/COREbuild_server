import logger from "../../config/winston.js";
import { getFilteredOrdersFromDB } from "../../data/order.js";
import url from 'node:url';
export default async function getFilteredOrders(req, res) {
    try {
        const queryParams = url.parse(req.url, true)?.query;
        const filtrationOptions = {
            orderID: Number(queryParams?.orderID) || null,
            recipientID: Number(queryParams?.recipientID) || null,
            shipping_status: {
                pending: 'pending',
                sent: 'sent'
            }[queryParams?.shipping_status || ''] || null,
            time: {
                ascending: 'ascending',
                descending: 'descending'
            }[queryParams?.time || ''] || null,
            currentPage: Number(queryParams?.currentPage) || 1,
            itemsPerPage: Number(queryParams?.itemsPerPage) || 4,
        };
        const userID = req.cookies.userSession?.userID;
        const is_employee = req.cookies.userSession?.is_employee;
        if (!userID) {
            throw new Error('Missing userID.');
        }
        const results = await getFilteredOrdersFromDB(filtrationOptions, userID, is_employee);
        if (!results) {
            throw new Error('Could not get filtered orders.');
        }
        res.status(200);
        res.json({
            msg: 'Orders found.',
            payload: results
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
//# sourceMappingURL=getFilteredOrders.js.map