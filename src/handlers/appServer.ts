import { Request, Response } from "express";
import logger from "../config/winston.js";
import path from 'node:path';
import fs from 'node:fs';

const indexHTMLPath = path.resolve('./dist_app/index.html');

export default async function appServer(req: Request, res: Response) {
    try {
        const file = fs.readFileSync(indexHTMLPath, {encoding: 'utf-8'});
        res.status(200);
        res.set({
            'Content-Type': 'text/html',
        });
        res.send(file);
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.end();
    }
}