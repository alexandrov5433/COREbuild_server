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
        console.log(e.message);
        console.log(e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}