import { checkProductAvailability, increaseProductAvailability, reduceProductAvailability } from "./product.js";
import { OrderData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function addNewOrder(orderData: OrderData) {
    const client = await pool.connect();
    try {
        const allProductsAreAvailable = await checkProductAvailability(orderData.content);
        if (!allProductsAreAvailable) {
            return `One or more products are not available any more in the quantity you selected.`;
        }
        const res = await client.query(`
            INSERT INTO "order" VALUES (
                DEFAULT,
                $1,
                $2,
                $3,
                $4,
                $5
            ) RETURNING *;
        `, [
            orderData.payment_status,
            orderData.shipping_status,
            JSON.stringify(orderData.content),
            orderData.recipient,
            orderData.placement_time
        ]);
        const newOrder = res.rows[0] || null;
        if (newOrder && newOrder.id) {
            const {allProductsWereSuccessfullyReduced, reducedProducts} = await reduceProductAvailability(newOrder.content);
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