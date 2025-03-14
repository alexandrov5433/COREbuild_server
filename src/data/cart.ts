import { UserData } from "./definitions.js";
import { pool } from "./postgres.js";

export async function addProductToCart(userID: number, productID: number, count: number) {
    const client = await pool.connect();
    try {
        const __checkProduct = client.query(`
            SELECT * FROM product
            WHERE (
                "productID"=$1
            )
            `, [productID]);
        const __userCartJSON = client.query(`
            SELECT "shopping_cart" FROM "user"
            WHERE (
                "userID"=$1
                AND
                "is_employee"=false
            )
            `, [userID]);
        const checkResults = await Promise.all([__checkProduct, __userCartJSON]);
        if (!checkResults[0].rows.length) {
            return `A product with ID: ${productID} could not be found.`;
        } else if (!checkResults[1].rows.length) {
            return `A customer with ID: ${userID} could not be found.`;
        }
        if (count <= 0) {
            return `The number of items to add must be 1 or greater.`;
        }
        const availableInStock = checkResults[0].rows[0].stockCount;
        if (availableInStock <= 0) {
            return `The product with ID: ${productID} is out of stock.`;
        } else if (availableInStock < count) {
            return `There are less than ${count} pieces left in stock.`;
        }
        const userCart = checkResults[1].rows[0].shopping_cart;
        if (Object.hasOwn(userCart, productID.toString())) {
            // product is already in cart
            const currentQuantityInCart = Number(userCart[productID.toString()]);
            if (currentQuantityInCart == availableInStock) {
                return `All pieces available in stock are already in your cart.`;
            }
            const wantedQuantity = currentQuantityInCart + count;
            if (availableInStock < wantedQuantity) {
                return `We cannot add ${count} more to your cart as the sum would exceed the available in stock.`;
            }
            // availabililty check - ok
            userCart[productID.toString()] = wantedQuantity;
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

export async function removeProductFromCart(userID: number, productID: number, count: number) {
    const client = await pool.connect();
    try {
        const __checkProduct = client.query(`
            SELECT * FROM product
            WHERE (
                "productID"=$1
            )
            `, [productID]);
        const __userCartJSON = client.query(`
            SELECT "shopping_cart" FROM "user"
            WHERE (
                "userID"=$1
                AND
                "is_employee"=false
            )
            `, [userID]);
        const checkResults = await Promise.all([__checkProduct, __userCartJSON]);
        if (!checkResults[0].rows.length) {
            return `A product with ID: ${productID} could not be found.`;
        } else if (!checkResults[1].rows.length) {
            return `A customer with ID: ${userID} could not be found.`;
        }
        if (count <= 0) {
            return `The number of items to remove must be 1 or greater.`;
        }
        let userCart = checkResults[1].rows[0].shopping_cart;
        if (Object.hasOwn(userCart, productID.toString())) {
            // product is in cart
            const currentQuantityInCart = Number(userCart[productID.toString()]);
            const reducedTargetQuantity = currentQuantityInCart - count;
            if (reducedTargetQuantity <= 0) {
                userCart[productID.toString()] = 0;
                userCart = removeZeroQuantityItems(userCart);
            } else {
                userCart[productID.toString()] = reducedTargetQuantity;
            }
        } else {
            return `The prodcut with ID: ${productID} is not in the cart.`;
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

export async function emptyUserCart(userID: number) {
    const client = await pool.connect();
    try {
        const update = await client.query(`
            UPDATE "user"
            SET "shopping_cart"=$1
            WHERE ("userID"=$2)
            RETURNING *
            `, [JSON.stringify({}), userID]);
        if (update.rows[0].userID) {
            return update.rows[0] as UserData;
        }
        return false;
    } catch (e) {
        console.error(e.message);
        return null;
    } finally {
        client.release();
    }
}


function removeZeroQuantityItems(cart: object) {
    const newCart = {};
    Object.entries(cart).forEach(([key, val]) => {
        if (val > 0) {
            newCart[key] = val;
        }
    });
    return newCart;
}