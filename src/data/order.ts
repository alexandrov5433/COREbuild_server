import { checkProductAvailability, increaseProductAvailability, reduceProductAvailability } from "./product.js";
import { OrderData, OrderFiltrationOptions } from "./definitions.js";
import { pool } from "./postgres.js";
import logger from "../config/winston.js";
import { PoolClient } from "pg";

export async function addNewOrder(orderData: OrderData) {
    let client: PoolClient;
    try {
        client = await pool.connect();
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
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function setOrderPaymentStatusToPaid(paypal_order_id: string): Promise<OrderData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            UPDATE "order" SET "payment_status"='paid' WHERE "paypal_order_id"=$1 RETURNING *;
        `, [paypal_order_id]);
        const updatedOrder = res.rows[0] || null;
        if (updatedOrder && updatedOrder.id) {
            return updatedOrder;
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function deleteOrder(orderID: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            DELETE FROM "order" WHERE "id"=$1
            RETURNING *;
        `, [orderID]);
        if (res.rows[0].id) {
            return true;
        }
        return false;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function hasCustomerBoughtProduct(userID: number, productID: number) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT "content" -> $2 product_id
            FROM "order"
            WHERE "recipient"=$1;
        `, [userID, productID]);
        if (res?.rows?.length) {
            const found = res.rows.find(obj => obj.product_id > 0);
            if (found) {
                return true;
            }
        }
        return false;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getOrderByID(paypal_order_id: string) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "order" WHERE "paypal_order_id"=$1;
        `, [paypal_order_id]);
        if (res.rows[0].id) {
            return res.rows[0];
        }
        return false;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getOrderByOrderID(orderID: number): Promise<OrderData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            SELECT * FROM "order" WHERE "id"=$1;
        `, [orderID]);
        if (res.rows[0].id) {
            return res.rows[0];
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function getFilteredOrdersFromDB(filtrationOptions: OrderFiltrationOptions, queryingUserID: number, is_employee: boolean) {
    let client: PoolClient;
    try {
        client = await pool.connect();
        let currentPage = filtrationOptions.currentPage || 1;
        const itemsPerPage = filtrationOptions.itemsPerPage || 4;
        let res: any;
        if (is_employee) {
            res = await client.query(`SELECT * FROM "order";`);
        } else {
            res = await client.query(`SELECT * FROM "order" WHERE "recipient"=$1;`, [queryingUserID]);
        }
        let payload: Array<OrderData> = res?.rows;

        // filter
        if (filtrationOptions.orderID) {
            payload = payload.filter(order => order.id == filtrationOptions.orderID)
        }
        if (filtrationOptions.recipientID) {
            payload = payload.filter(order => order.recipient == filtrationOptions.recipientID)
        }
        if (filtrationOptions.shipping_status) {
            payload = payload.filter(order => order.shipping_status == filtrationOptions.shipping_status)
        }

        // sort
        if (filtrationOptions.time == 'ascending') {
            payload.sort((a, b) => Number(a.placement_time) - Number(b.placement_time));
        }
        if (filtrationOptions.time == 'descending') {
            payload.sort((a, b) => Number(b.placement_time) - Number(a.placement_time));
        }

        const pagesCount = Math.ceil(payload.length / itemsPerPage);
        if (currentPage > pagesCount) {
            currentPage = 1;
        }
        const currentPagePortion = payload.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return {
            pagesCount,
            currentPage,
            orders: currentPagePortion
        };
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}

export async function updateOrderShippingDetailsInDB(
    orderID: number, newShippingData: {
        shipping_status: 'pending' | 'sent',
        shipping_speditor: string | null,
        shipment_tracking_code: string | null
    }
): Promise<OrderData | null> {
    let client: PoolClient;
    try {
        client = await pool.connect();
        const res = await client.query(`
            UPDATE "order" SET 
                "shipping_status"=$2,
                "shipping_speditor"=$3,
                "shipment_tracking_code"=$4 
            WHERE "id"=$1
            RETURNING *;
        `, [orderID, newShippingData.shipping_status, newShippingData.shipping_speditor, newShippingData.shipment_tracking_code]);
        if (res.rows[0].id) {
            return res.rows[0];
        }
        return null;
    } catch (e) {
        logger.error(e.message, e);
        return null;
    } finally {
        client?.release();
    }
}