import mailjet from "../config/email.js";
import logger from "../config/winston.js";
import path from "node:path";
import fs from 'node:fs';
import { convertTimeToDate } from "../util/time.js";
import { getOrderByID } from "../data/order.js";
import { ProductData } from "../data/definitions.js";
import { findProductById } from "../data/product.js";
import { convertCentToWhole } from "../util/currency.js";
import { findUserByUserID } from "../data/user.js";

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'corebuildshop@gmail.com';
const DOMAIN = process.env.DOMAIN;
const orderTemplate = path.resolve('./email_templates/order.html');

const PRODUCT_DEVIDER = '<hr style="width: 20%; margin-left: 2rem; opacity: 0.5;"></hr>';
const PRODUCT_INFO = `
    <p style="padding-left: 2rem; font-size: 1rem; text-align: left;">%%QANTITY%% x %%PRODUCT_NAME%%</p>
    <p style="padding-left: 2rem; font-size: 1rem; text-align: left;">Price of one: %%PRICE%% €</p>`;
const TOTAL = `
    <hr style="width: 20%; margin-left: 2rem; opacity: 0.5;"></hr>
    <p style="padding-left: 2rem; font-size: 1rem; text-align: left;">Total: %%TOTAL%% €</p>`;

export default async function sendOrderEmail(
    paypal_order_id: string
) {
    return new Promise(async (res, rej) => {
        try {
            const orderData = await getOrderByID(paypal_order_id);
            if (!orderData) {
                throw new Error('Could not find order in order to send an email.');
            }
            const userData = await findUserByUserID(orderData.recipient);
            if (!userData) {
                throw new Error('Could not find user in order to send an email.');
            }

            const prodcuts = await Promise.all(
                Object.keys(orderData.content).reduce((acc, cur) => {
                    acc.push(findProductById(Number(cur)));
                    return acc;
                }, [] as Array<Promise<ProductData | null>>)
            );
            if (!prodcuts || prodcuts.includes(null)) {
                throw new Error('Could not find one or more products from order for email.');
            }

            const orderContent = Object.entries(orderData.content);
            const productsList = [];
            for (let i = 0; i < orderContent.length; i++) {
                const [productID, productQuantity] = orderContent[i];
                const productData = prodcuts.find(p => p.productID.toString() == productID);
                const productInfo = PRODUCT_INFO
                    .replace('%%QANTITY%%', productQuantity.toString())
                    .replace('%%PRODUCT_NAME%%', productData.name)
                    .replace('%%PRICE%%', convertCentToWhole(productData.price).toString());
                productsList.push(productInfo);
            }
            const tempResult = productsList.join(PRODUCT_DEVIDER);
            const total = TOTAL.replace('%%TOTAL%%', convertCentToWhole(orderData.total_price).toString());
            const endResult = tempResult + total;

            const orderTemplateString = fs.readFileSync(orderTemplate, {encoding: 'utf-8'})
                .replaceAll('%%DOMAIN%%', DOMAIN)
                .replaceAll('%%ORDER_ID%%', orderData.id.toString())
                .replaceAll('%%PLACEMENT_TIME%%', convertTimeToDate(orderData.placement_time))
                .replaceAll('%%RECIPIENT_NAME%%', userData.firstname + ' ' + userData.lastname)
                .replaceAll('%%DELIVERY_ADDRESS%%', userData.address)
                .replace('%%ORDER_PRODUCTS_LIST%%', endResult);
            
            await mailjet
                .post('send')
                .request({
                    Messages: [
                        {
                            From: {
                                Email: SENDER_EMAIL,
                                Name: "COREbuild"
                            },
                            To: [
                                {
                                    Email: userData.email,
                                    Name: userData.firstname + ' ' + userData.lastname
                                }
                            ],
                            Subject: "Order details from COREbuild.",
                            TextPart: "Thank you shopping at COREbuild.",
                            HTMLPart: orderTemplateString
                        }
                    ]
                });
            res(true);
        } catch (e) {
            logger.error('Could not send out order email.');
            logger.error(e.message, e);
            res(false); // res, because it should not throw wenn usen in a try catch
        }
    });
}
