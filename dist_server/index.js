import express from "express";
import configExpress from "./config/express.js";
import path from "node:path";
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import logger from "./config/winston.js";
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 433;
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();
await configExpress(app);
if (NODE_ENV == 'production') {
    const PATH_TO_SSL_KEY = path.resolve('./ssl_corebuild/corebuild_xyz.key');
    const PATH_TO_SSL_CERT = path.resolve('./ssl_corebuild/www_corebuild_xyz.crt');
    const PATH_TO_SSL_CA = path.resolve('./ssl_corebuild/www_corebuild_xyz.ca-bundle');
    const httpsOptions = {
        key: fs.readFileSync(PATH_TO_SSL_KEY),
        cert: fs.readFileSync(PATH_TO_SSL_CERT),
        ca: fs.readFileSync(PATH_TO_SSL_CA)
    };
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(httpsOptions, app);
    httpServer.listen(HTTP_PORT, () => {
        logger.info(`The HTTP server is listening on port: ${HTTP_PORT}`);
    });
    httpsServer.listen(HTTPS_PORT, () => {
        logger.info(`The HTTPS server is listening on port: ${HTTPS_PORT}`);
    });
}
else {
    app.listen(3000, () => {
        logger.info(`The server is running at http://localhost:3000`);
    });
}
//# sourceMappingURL=index.js.map