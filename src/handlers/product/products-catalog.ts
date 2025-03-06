import { Request, Response } from "express";
import url from 'node:url';
import { ProductsCatalogQueryParams } from "../../data/definitions.js";
import { searchProduct } from "../../data/product.js";

export default async function productsCatalog(req: Request, res: Response) {
    try {
        const allQueryParams = url.parse(req.url, true).query;
        // console.log('allQueryParams', allQueryParams);
        const queryParams: ProductsCatalogQueryParams = {
            name: allQueryParams?.name.toString() || '',
            category: allQueryParams?.category.toString() || '',
            priceFrom: allQueryParams?.priceFrom.toString() || '',
            priceTo: allQueryParams?.priceTo.toString() || '',
            availableInStock: allQueryParams?.availableInStock.toString() || '',
            manufacturer: allQueryParams?.manufacturer.toString() || '',
        }

        const result = await searchProduct(queryParams);

        // console.log('result', result);
        res.status(200);
        res.json({
            msg: 'Products queried and sorted successfully.',
            payload: result
        });
        res.end();
    } catch (e) {
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}