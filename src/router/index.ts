import { Router, Request, Response } from "express";

import login from "../handlers/user/login.js";
import register from "../handlers/user/register.js";
import logout from "../handlers/user/logout.js";
import validateCookie from "../handlers/user/validateCookie.js";
import addProduct from "../handlers/product/add-product.js";
import productDetails from "../handlers/product/product-details.js";
import productsCatalog from "../handlers/product/products-catalog.js";
import file from "../handlers/file/file.js";
import addToCart from "../handlers/shoppingCart/addToCart.js";
import getCart from "../handlers/shoppingCart/getCart.js";
import removeFromCart from "../handlers/shoppingCart/removeFromCart.js";
import placeOrder from "../handlers/order/placeOrder.js";
import collectPayment from "../handlers/order/collectPayment.js";
import addNewReview from "../handlers/review/addNewReview.js";
import getRatingAndReviewCount from "../handlers/review/getRatingAndReviewCount.js";
import getReviews from "../handlers/review/getReviews.js";
import getCustomerReviewedProduct from "../handlers/review/getCustomerReviewedProduct.js";

const router = Router();

// user
router.post('/api/login', login);
router.post('/api/register', register);
router.get('/api/logout', logout);
router.get('/api/validate-cookie', validateCookie);

// product
router.post('/api/add-product', addProduct);
router.get('/api/product-details/:productID', productDetails);
router.get('/api/products-catalog', productsCatalog);

// file
router.get('/api/file/:picOrDoc/:fileid', file);

// shopping cart
router.post('/api/cart/add', addToCart);
router.post('/api/cart/remove', removeFromCart);
router.get('/api/cart/:userID', getCart);

// order
router.post('/api/order', placeOrder);
router.get('/api/collect-payment/:paypalOrderID', collectPayment);

// review
router.post('/api/review', addNewReview);
router.get('/api/rating-and-review-count/:productID', getRatingAndReviewCount);
router.get('/api/product-reviews', getReviews);
router.get('/api/customer-reviewed-product/:productID', getCustomerReviewedProduct);

router.all('*', (req: Request, res: Response) => {
    res.redirect('/index.html');
    res.end();
});

export {
    router
};