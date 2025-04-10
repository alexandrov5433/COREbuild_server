import logger from "../../config/winston.js";
import { addAnswerToTicketInDB } from "../../data/ticket.js";
import answerTicketPerEmail from "../../email/answerTicketPerEmail.js";
export default async function answerTicket(req, res) {
    try {
        const userID = Number(req.cookies?.userSession?.userID) || null;
        const is_employee = Number(req.cookies?.userSession?.is_employee) || null;
        if (!userID) {
            throw new Error('UserID is missing.');
        }
        if (!is_employee) {
            throw new Error('Only employees may answer tickets.');
        }
        const ticketAnswerData = {
            id: req.body.id || null,
            content_answer: req.body.content_answer || null,
            time_close: new Date().getTime(),
            userID_employee: userID
        };
        if (Object.values(ticketAnswerData).includes(null)) {
            throw new Error('One or more fields of data are missing.');
        }
        const answeredTicket = await addAnswerToTicketInDB(ticketAnswerData);
        if (!answeredTicket) {
            throw new Error('Could not submit answer for ticket.');
        }
        res.status(200);
        res.json({
            msg: 'Ticket answered.'
        });
        res.end();
        answerTicketPerEmail(answeredTicket.title, answeredTicket.time_open, answeredTicket.content_question, answeredTicket.content_answer, answeredTicket.email_for_answer);
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
//# sourceMappingURL=answerTicket.js.map