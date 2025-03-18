import { checkProductAvailability, increaseProductAvailability, reduceProductAvailability } from "./product.js";
import { OrderData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function addNewOrder(orderData: OrderData) {
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
                $7
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
        console.error(e);
        return null;
    } finally {
        client.release();
    }
}

export async function setOrderPaymentStatusToPaid(paypal_order_id: string) {
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
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        client.release();
    }
}

export async function deleteOrder(orderID: number) {
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
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        client.release();
    }
}

export async function hasCustomerBoughtProduct(userID: number, productID: number) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT "content" -> '$2' product_ID
            FROM "order"
            WHERE "recipient"=$1;
        `, [userID, productID]);
        if (res.rows[0].product_ID) {
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        client.release();
    }
}

export async function getOrderByID(paypal_order_id: string) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM "order" WHERE "paypal_order_id"=$1;
        `, [paypal_order_id]);
        if (res.rows[0].id) {
            return res.rows[0];
        }
        return false;
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        client.release();
    }
}