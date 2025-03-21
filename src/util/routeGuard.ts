import { NextFunction, Request, Response } from "express";

export default class Guard {
    static allowCustomer(req: Request, res: Response, next: NextFunction) {
        const userID = req.cookies?.userSession?.userID;
        const is_employee = req.cookies?.userSession?.is_employee;
        if (!userID) {
            res.redirect('/');
            res.end();
            return;
        }
        if (is_employee) {
            res.redirect('/');
            res.end();
            return;
        }
        return next();
    }

    static allowEmployee(req: Request, res: Response, next: NextFunction) {
        const userID = req.cookies?.userSession?.userID;
        const is_employee = req.cookies?.userSession?.is_employee;
        if (!userID) {
            res.redirect('/');
            res.end();
            return;
        }
        if (!is_employee) {
            res.redirect('/');
            res.end();
            return;
        }
        return next();
    }

    static allowGuest(req: Request, res: Response, next: NextFunction) {
        if (req.cookies?.userSession === null) {
            return next();
        }
        res.redirect('/');
        res.end();
        return;
    }

    static allowUser(req: Request, res: Response, next: NextFunction) {
        if (req.cookies?.userSession) {
            return next();
        }
        res.redirect('/');
        res.end();
        return;
    }
}