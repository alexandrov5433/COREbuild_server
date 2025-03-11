import { pool } from "./postgres.js";

export async function addProductToCart(userID: number, productID: number, count: number) {
    const client = await pool.connect();
    try {
        const __checkProduct = client.query(`
            SELECT * FROM product
            WHERE (
                "productID"=$1
                AND
                "stockCount">=$2
            )
            `, [productID, count]);
        const __userCartJSON = client.query(`
            SELECT "shopping_cart" FROM "user"
            WHERE (
                "userID"=$1
                AND
                "is_employee"=false
            )
            `, [userID]);
        const checkResults = await Promise.all([__checkProduct, __userCartJSON]);
        if (!checkResults[0].rows.length || !checkResults[1].rows.length) {
            return false;
        }
        const availableInStock = checkResults[0].rows[0].stockCount; 
        const userCart = checkResults[1].rows[0].shopping_cart;
        if (Object.hasOwn(userCart, productID.toString())) {
            // product is already in cart
            const wantedQuantity = Number(userCart[productID.toString()]) + count;
            if ( availableInStock >= wantedQuantity) {
                // availabililty check - ok
                userCart[productID.toString()] = wantedQuantity;
            } else {
                return false;
            }
        } else {
            userCart[productID.toString()] = count;
        }
        const update = await client.query(`
            UPDATE "user"
            SET "shopping_cart"=$1
            WHERE ("userID"=$2)
            RETURNING *
            `, [JSON.stringify(userCart), userID]);
        if (update.rows[0]) {
            return update.rows[0].shopping_cart;
        }
        return false;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}

export async function getCartForUser(userID: number) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT "shopping_cart" FROM "user"
            WHERE (
                "userID"=$1
                AND
                "is_employee"=false
            )
            `, [userID]);
        if (res.rows[0].shopping_cart) {
            return res.rows[0].shopping_cart;
        }
        return false;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}