import logger from "../../config/winston.js";
import { getFilteredTicketsFromDB } from "../../data/ticket.js";
import url from 'node:url';
export default async function getFilteredTickets(req, res) {
    try {
        const userID = Number(req.cookies?.userSession?.userID) || null;
        const is_employee = Number(req.cookies?.userSession?.is_employee) || null;
        if (!userID) {
            throw new Error('UserID is missing.');
        }
        if (!is_employee) {
            throw new Error('Only employees may review tickets.');
        }
        const allQueryParams = url.parse(req.url, true).query;
        const ticketFiltrationOptions = {
            id: Number(allQueryParams.id) || null,
            status: {
                open: 'open',
                closed: 'closed',
            }[allQueryParams.status] || null,
            time_open: {
                ascending: 'ascending',
                descending: 'descending',
            }[allQueryParams.time_open] || null,
            currentPage: Math.abs(Number(allQueryParams.currentPage)) || null,
            itemsPerPage: Math.abs(Number(allQueryParams.itemsPerPage)) || null
        };
        const filteredTickets = await getFilteredTicketsFromDB(ticketFiltrationOptions);
        if (!filteredTickets) {
            throw new Error('Could not retrieve filtered tickets.');
        }
        res.status(200);
        res.json({
            msg: 'Tickets filtered.',
            payload: filteredTickets
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
//# sourceMappingURL=getFilteredTickets.js.map