import { increaseProductAvailability, reduceProductAvailability } from "./product.js";
import { pool } from "./postgres.js";
import logger from "../config/winston.js";
export async function addNewOrder(orderData) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            INSERT INTO "order" VALUES (
                DEFAULT,
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                DEFAULT,
                DEFAULT
            ) RETURNING *;
        `, [
            orderData.payment_status,
            orderData.shipping_status,
            JSON.stringify(orderData.content),
            orderData.recipient,
            orderData.placement_time,
            orderData.total_price,
            orderData.paypal_order_id
        ]);
        const newOrder = res.rows[0] || null;
        if (newOrder && newOrder.id) {
            const { allProductsWereSuccessfullyReduced, reducedProducts } = await reduceProductAvailability(newOrder.content);
            if (allProductsWereSuccessfullyReduced) {
                return newOrder;
            }
            await increaseProductAvailability(reducedProducts);
            await deleteOrder(newOrder.id);
        }
        return `Something went wrong when processing your order. Please refresh the page or contact us.`;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function setOrderPaymentStatusToPaid(paypal_order_id) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            UPDATE "order" SET "payment_status"='paid' WHERE "paypal_order_id"=$1 RETURNING *;
        `, [paypal_order_id]);
        const updatedOrder = res.rows[0] || null;
        if (updatedOrder && updatedOrder.id) {
            return true;
        }
        return `The payment status of order ID: ${paypal_order_id} could not be modified.`;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function deleteOrder(orderID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            DELETE FROM "order" WHERE "id"=$1
            RETURNING *;
        `, [orderID]);
        if (res.rows[0].id) {
            return true;
        }
        return false;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function hasCustomerBoughtProduct(userID, productID) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT "content" -> $2 product_id
            FROM "order"
            WHERE "recipient"=$1;
        `, [userID, productID]);
        if (res?.rows[0]?.product_id) {
            return true;
        }
        return false;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function getOrderByID(paypal_order_id) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM "order" WHERE "paypal_order_id"=$1;
        `, [paypal_order_id]);
        if (res.rows[0].id) {
            return res.rows[0];
        }
        return false;
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
export async function getFilteredOrdersFromDB(filtrationOptions) {
    const client = await pool.connect();
    try {
        let currentPage = filtrationOptions.currentPage || 1;
        const itemsPerPage = filtrationOptions.itemsPerPage || 5;
        const res = await client.query(`SELECT * FROM "order";`);
        let payload = res.rows;
        // filter
        if (filtrationOptions.orderID) {
            payload = payload.filter(order => order.id == filtrationOptions.orderID);
        }
        if (filtrationOptions.recipientID) {
            payload = payload.filter(order => order.recipient == filtrationOptions.recipientID);
        }
        if (filtrationOptions.shipping_status) {
            payload = payload.filter(order => order.shipping_status == filtrationOptions.shipping_status);
        }
        // sort
        if (filtrationOptions.timeAscending) {
            payload.sort((a, b) => a.placement_time - b.placement_time);
        }
        if (filtrationOptions.timeDescending) {
            payload.sort((a, b) => b.placement_time - a.placement_time);
        }
        const pagesCount = Math.ceil(payload.length / itemsPerPage);
        if (currentPage > pagesCount) {
            currentPage = 1;
        }
        const currentPagePortion = payload.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return {
            pagesCount,
            currentPage,
            products: currentPagePortion
        };
    }
    catch (e) {
        logger.error(e.message, e);
        return null;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=order.js.map