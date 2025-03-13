import { Request, Response } from "express";
import path from 'node:path';
import fsp from 'node:fs/promises';
import sp from 'node:stream/promises';
import { getFileNameById } from "../../data/file.js";

const PICS_STORAGE_PATH = path.resolve('./fileStorage/pics');
const DOCS_STORAGE_PATH = path.resolve('./fileStorage/docs');

export default async function file(req: Request, res: Response) {
    try {
        const fileid = req.params.fileid || null;
        const picOrDoc = req.params.picOrDoc || null;

        if (!fileid || !Number(fileid)) {
            res.status(400);
            res.json({
                msg: 'File id is required in order to return a file.'
            });
            return;
        }
        if (!picOrDoc || !['pic', 'doc'].includes(picOrDoc)) {
            res.status(400);
            res.json({
                msg: 'Missing parameter picOrDoc.'
            });
            return;
        }
        const filename = await getFileNameById(Number(fileid));
        if (!filename) {
            res.status(400);
            res.json({
                msg: `A file with fileID: "${fileid}" was not found.`
            });
            return;
        }
        const filePath = path.join({
            'pic': PICS_STORAGE_PATH,
            'doc': DOCS_STORAGE_PATH,
        }[picOrDoc], filename);

        const stats = await fsp.stat(filePath);
        if (!stats) {
            res.status(400);
            res.json({
                msg: `No file with file name: "${filename}" was found in storage.`
            });
            return;
        }
        const fileHandle = await fsp.open(filePath, 'r');
        const fileSteam = fileHandle.createReadStream();
        const contentType = picOrDoc === 'pic' ?
            (filename.endsWith('.png') ?
                'image/png'
                : 'image/jpeg'
            )
            : 'application/pdf';
        res.status(200);
        res.set({
            'Content-Type': contentType,
            'Content-Length': stats.size,
        });
        await sp.pipeline(fileSteam, res);
        res.end();
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({
            msg: `Error: ${(e as Error).message}`
        });
        res.end();
    }
}