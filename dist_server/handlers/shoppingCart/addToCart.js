import { addProductToCart } from "../../data/cart.js";
export default async function addToCart(req, res) {
    try {
        const userID = req.cookies.userSession.userID;
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        const productToAdd = {
            productID: Number(req.body.productID) || 0,
            count: Number(req.body.count) || 0,
        };
        if (!productToAdd.productID || !productToAdd.count) {
            res.status(400);
            res.json({
                msg: 'Missing either prodcutID or count.'
            });
            res.end();
            return;
        }
        const updatedCart = await addProductToCart(userID, productToAdd.productID, productToAdd.count);
        if (typeof updatedCart == 'string') {
            // string (handled error message)
            res.status(400);
            res.json({
                msg: updatedCart,
            });
            res.end();
            return;
        }
        if (!updatedCart) {
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
            msg: 'Product added.',
            payload: updatedCart
        });
        res.end();
    }
    catch (e) {
        console.log('ERROR:', e.message);
        res.status(500);
        res.json({
            msg: `Error: ${e.message}`
        });
        res.end();
    }
}
//# sourceMappingURL=addToCart.js.map