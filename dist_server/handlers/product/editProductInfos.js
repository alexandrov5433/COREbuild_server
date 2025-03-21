import { editProductInformation, findProductById } from "../../data/product.js";
import logger from "../../config/winston.js";
import { reduceSpacesBetweenWordsToOne } from "../../util/string.js";
import { createCategory } from "../../data/category.js";
export default async function editProductInfos(req, res) {
    try {
        const productID = Number(req.params.productID) || null;
        if (!productID) {
            res.status(400);
            res.json({
                msg: `Missing productID. Recieved: "${productID}".`
            });
            res.end();
            return;
        }
        const productData = {
            name: req.body.name.trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            description: req.body.description.trim().replaceAll(/[%&\$\*_'"]/g, '') || null,
            category: reduceSpacesBetweenWordsToOne(req.body.category.toLowerCase().replaceAll(/[^A-Za-z ]/g, '')) || null,
            categoryID: null,
            price: Number(req.body.price),
            stockCount: Number(req.body.stockCount),
            manufacturer: req.body.manufacturer.trim().replaceAll(/[%&\$\*_'"]/g, '') || null
        };
        const isProductExists = await findProductById(productID);
        if (!isProductExists) {
            res.status(400);
            res.json({
                msg: `Could not find a product with ID: "${productID}".`
            });
            res.end();
            return;
        }
        if (!productData.name) {
            res.status(400)
                .json({
                msg: `The product name is missing.`
            })
                .end();
            return;
        }
        if (!productData.description) {
            res.status(400)
                .json({
                msg: `The product description is missing.`
            })
                .end();
            return;
        }
        if (!productData.category) {
            res.status(400)
                .json({
                msg: `The product category is missing.`
            })
                .end();
            return;
        }
        if (!productData.price || productData.price <= 0 || !/^[0-9]+(?:\.[0-9]{2}){0,1}$/.test(productData.price.toString())) {
            res.status(400)
                .json({
                msg: `The price must be greater than 0. Please use a dot as a decimal separator. E.g.: '01.23', '23.03' or '0.01'.`
            })
                .end();
            return;
        }
        if (Number.isNaN(productData.stockCount) || productData.stockCount < 0 || !Number.isInteger(productData.stockCount)) {
            res.status(400)
                .json({
                msg: `The stock count must be 0 or greater and a whole number.`
            })
                .end();
            return;
        }
        if (!productData.manufacturer) {
            res.status(400)
                .json({
                msg: `The product manufacturer is missing.`
            })
                .end();
            return;
        }
        productData.price = Number(Number.parseFloat(`${productData.price}`).toFixed(2)) * 100; // converting to cent
        productData.categoryID = (await createCategory(productData.category))?.rows[0]?.categoryID;
        const updatedProduct = await editProductInformation(productID, productData);
        if (!updatedProduct?.rows[0]?.productID) {
            res.status(400);
            res.json({
                msg: 'Product infos could not be updated.'
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Product infos updated.',
            payload: true
        });
        res.end();
    }
    catch (e) {
        logger.error(e.message, e);
        res.status(500);
        res.json({
            msg: `Error: ${e.message}`
        });
        res.end();
    }
}
//# sourceMappingURL=editProductInfos.js.map