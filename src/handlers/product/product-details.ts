import { Request, Response } from "express";

export default async function productDetails(req: Request, res: Response) {
    try {
        res.status(200);
        res.json({
            msg: 'TODO',
            // payload: {}
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