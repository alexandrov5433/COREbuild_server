import logger from "../../config/winston.js";
import { createNewTicketInDB } from "../../data/ticket.js";
export default async function submitTicket(req, res) {
    try {
        const userID = Number(req.cookies?.userSession?.userID) || null;
        const is_employee = Number(req.cookies?.userSession?.is_employee) || null;
        if (is_employee) {
            throw new Error('Only customers can submit tickets.');
        }
        const ticketCreationData = {
            title: (req.body.title || '').trim() || null,
            content_question: (req.body.content_question || '').trim() || null,
            time_open: new Date().getTime(),
            email_for_answer: (req.body.email_for_answer || '').trim() || null,
        };
        if (Object.values(ticketCreationData).includes(null)) {
            throw new Error('One or more fields of data are missing.');
        }
        ticketCreationData.userID_submit = userID;
        const emailValid = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(ticketCreationData.email_for_answer || '');
        if (!emailValid) {
            throw new Error(`The provided email is invalid. Valid example: example123@some.com`);
        }
        const newTicket = await createNewTicketInDB(ticketCreationData);
        if (!newTicket) {
            throw new Error('Could not submit ticket. Please try again.');
        }
        res.status(200);
        res.json({
            msg: 'Ticket submitted.'
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
//# sourceMappingURL=submitTicket.js.map