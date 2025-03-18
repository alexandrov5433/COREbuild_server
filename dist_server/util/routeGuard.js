export default class Guard {
    static allowCustomer(req, res, next) {
        const { userID, is_employee } = req.cookies.userSession;
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
    static allowEmployee(req, res, next) {
        const { userID, is_employee } = req.cookies.userSession;
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
    static allowGuest(req, res, next) {
        if (req.cookies.userSession === null) {
            return next();
        }
        res.redirect('/');
        res.end();
        return;
    }
    static allowUser(req, res, next) {
        if (req.cookies.userSession) {
            return next();
        }
        res.redirect('/');
        res.end();
        return;
    }
}
//# sourceMappingURL=routeGuard.js.map