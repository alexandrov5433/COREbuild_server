import express from "express";
import configExpress from "./config/express.js";
const PORT = process.env.PORT || 3000;
const app = express();
await configExpress(app);
app.listen(PORT, () => {
    console.log(`The server is running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map