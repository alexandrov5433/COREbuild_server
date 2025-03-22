import { Router } from "express";
import Guard from "../util/routeGuard.js";
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
import cancelPayment from "../handlers/order/cancelPayment.js";
import editProductInfos from "../handlers/product/editProductInfos.js";
import getAllProductCategories from "../handlers/product/getAllProductCategories.js";
import updateProductThumbnail from "../handlers/product/updateProductThumbnail.js";
import addProductPictures from "../handlers/product/addProductPictures.js";
import deletePictureOfProdcut from "../handlers/product/deleteProductPicture.js";
import deleteProductSpecsDoc from "../handlers/product/deleteProductSpecsDoc.js";
import updateProductSpecsDoc from "../handlers/product/updateProductSpecsDoc.js";
import getFilteredOrders from "../handlers/order/getFilteredOrders.js";
const router = Router();
// user
router.post('/api/login', Guard.allowGuest, login);
router.post('/api/register', Guard.allowGuest, register);
router.get('/api/logout', Guard.allowUser, logout);
router.get('/api/validate-cookie', validateCookie);
// product
router.post('/api/add-product', Guard.allowEmployee, addProduct);
router.get('/api/product-details/:productID', productDetails);
router.get('/api/products-catalog', productsCatalog);
router.post('/api/edit-products-infos/:productID', Guard.allowEmployee, editProductInfos);
router.get('/api/product-categories', getAllProductCategories);
router.post('/api/update-product-thumbnail/:productID', Guard.allowEmployee, updateProductThumbnail);
router.post('/api/add-product-pictures/:productID', Guard.allowEmployee, addProductPictures);
router.delete('/api/delete-product-picture/:productID/:pictureToDeleteID', Guard.allowEmployee, deletePictureOfProdcut);
router.delete('/api/delete-product-document/:productID/:specsDocToDeleteID', Guard.allowEmployee, deleteProductSpecsDoc);
router.put('/api/update-product-document/:productID', Guard.allowEmployee, updateProductSpecsDoc);
// file
router.get('/api/file/:picOrDoc/:fileid', file);
// shopping cart
router.post('/api/cart/add', Guard.allowCustomer, addToCart);
router.post('/api/cart/remove', Guard.allowCustomer, removeFromCart);
router.get('/api/cart/:userID', Guard.allowCustomer, getCart);
// order
router.post('/api/order', Guard.allowCustomer, placeOrder);
router.get('/api/collect-payment/:paypalOrderID', Guard.allowCustomer, collectPayment);
router.get('/api/cancel-payment/:paypalOrderID', Guard.allowCustomer, cancelPayment);
router.get('/api/filtered-orders', Guard.allowUser, getFilteredOrders);
// review
router.post('/api/review', Guard.allowCustomer, addNewReview);
router.get('/api/rating-and-review-count/:productID', getRatingAndReviewCount);
router.get('/api/product-reviews', getReviews);
router.get('/api/customer-reviewed-product/:productID', getCustomerReviewedProduct);
router.all('*', (req, res) => {
    res.redirect('/index.html');
    res.end();
});
export { router };
//# sourceMappingURL=index.js.map