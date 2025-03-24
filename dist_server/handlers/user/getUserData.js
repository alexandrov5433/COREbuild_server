import { findUserByUserID } from "../../data/user.js";
import logger from "../../config/winston.js";
export default async function getUserData(req, res) {
    try {
        const userID = Number(req.params.userID) || null;
        if (!userID) {
            throw new Error('UserID is missing.');
        }
        const userData = await findUserByUserID(userID);
        if (!userData) {
            throw new Error(`Could not find user with ID: ${userID}.`);
        }
        res.status(200);
        res.json({
            msg: 'User found.',
            payload: userData
        });
        res.end();
    }
    catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}
//# sourceMappingURL=getUserData.js.map