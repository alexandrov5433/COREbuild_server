import { NextFunction, Request, Response } from "express";

export default class Guard {
    static allowCustomer(req: Request, res: Response, next: NextFunction) {
        const { userID, is_employee } = req.cookies.userSession;
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        if (is_employee) {
            res.status(403);
            res.json({
                msg: 'Route forbidden for employees.'
            });
            res.end();
            return;
        }
        return next();
    }

    static allowEmployee(req: Request, res: Response, next: NextFunction) {
        const { userID, is_employee } = req.cookies.userSession;
        if (!userID) {
            res.status(401);
            res.json({
                msg: 'Request is not authorized.'
            });
            res.end();
            return;
        }
        if (!is_employee) {
            res.status(403);
            res.json({
                msg: 'Route forbidden for non-employees.'
            });
            res.end();
            return;
        }
        return next();
    }

    static allowGuest(req: Request, res: Response, next: NextFunction) {
        if (req.cookies.userSession === null) {
            return next();
        }
        res.status(403);
        res.json({
            msg: 'Route forbidden for users.'
        });
        res.end();
        return;
    }

    static allowUser(req: Request, res: Response, next: NextFunction) {
        if (req.cookies.userSession) {
            return next();
        }
        res.status(403);
        res.json({
            msg: 'Route forbidden for guests.'
        });
        res.end();
        return;
    }
}