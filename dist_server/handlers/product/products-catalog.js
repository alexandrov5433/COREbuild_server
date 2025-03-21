import url from 'node:url';
import { searchProducts } from "../../data/product.js";
import logger from "../../config/winston.js";
export default async function productsCatalog(req, res) {
    try {
        const allQueryParams = url.parse(req.url, true).query;
        // console.log('allQueryParams', allQueryParams);
        const queryParams = {
            currentPage: Number(allQueryParams?.currentPage) || 1,
            itemsPerPage: Number(allQueryParams?.itemsPerPage) || 12,
            name: allQueryParams?.name?.toString() || '',
            category: allQueryParams?.category?.toString() || '',
            priceFrom: allQueryParams?.priceFrom?.toString() || '',
            priceTo: allQueryParams?.priceTo?.toString() || '',
            availableInStock: allQueryParams?.availableInStock?.toString() || '',
            manufacturer: allQueryParams?.manufacturer?.toString() || '',
        };
        const result = await searchProducts(queryParams);
        if (!result) {
            res.status(400);
            res.json({
                msg: 'Could not find any matching products because an error occured.'
            });
            res.end();
            return;
        }
        res.status(200);
        res.json({
            msg: 'Products queried and sorted successfully.',
            payload: result
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
//# sourceMappingURL=products-catalog.js.map