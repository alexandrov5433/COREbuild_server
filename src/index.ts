import express from "express";
import configExpress from "./config/express.js";
import path from "node:path";
import https from 'node:https';
import fs from 'node:fs';
import logger from "./config/winston.js";

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();
await configExpress(app);

if (NODE_ENV == 'production') {
    const PATH_TO_SSL_KEY = path.resolve('./cert/corebuild.key');
    const PATH_TO_SSL_CERT = path.resolve('./cert/corebuild.crt');
    const httpsOptions = {
        key: fs.readFileSync(PATH_TO_SSL_KEY),
        cert: fs.readFileSync(PATH_TO_SSL_CERT),
    };
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(PORT, () => {
        logger.info(`The https server is listening on port: ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        logger.info(`The server is running at http://localhost:${PORT}`);
    });
}
