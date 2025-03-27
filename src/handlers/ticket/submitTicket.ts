import { Request, Response } from "express";
import logger from "../../config/winston.js";
import { TicketCreationData } from "../../data/definitions.js";
import { createNewTicketInDB } from "../../data/ticket.js";

export default async function submitTicket(req: Request, res: Response) {
    try {
        const userID = Number(req.cookies?.userSession?.userID) || null;
        const ticketCreationData: TicketCreationData = {
            title: req.body.title || null,
            content_question: req.body.content_question || null,
            time_open: new Date().getTime(),
            email_for_answer: req.body.email_for_answer || null,
            userID_submit: userID
        }
        if (Object.values(ticketCreationData).includes(null)) {
            throw new Error('One or more fields of data are missing.');
        }
        const emailValid = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(ticketCreationData.email_for_answer || '');
        if (!emailValid) {
            throw new Error(`The provided email is invalid. Valid example: example123@some.com`);
        }
        const newTicket = await createNewTicketInDB(ticketCreationData);
        if (!newTicket) {
            throw new Error('Could not submit ticket. Please try again.');
        }
        res.status(200);
        res.end();
    } catch (e) {
        logger.error(e.message, e);
        res.status(400);
        res.json({
            msg: e.message
        });
        res.end();
    }
}