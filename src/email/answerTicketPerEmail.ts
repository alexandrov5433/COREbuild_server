import mailjet from "../config/email.js";
import logger from "../config/winston.js";
import path from "node:path";
import fs from 'node:fs';
import { convertTimeToDate } from "../util/time.js";

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'corebuildshop@gmail.com';
const DOMAIN = process.env.DOMAIN;
const answerTicket = path.resolve('./email_templates/answerTicket.html');

export default async function answerTicketPerEmail(
    title: string,
    time_open: number,
    content_question: string,
    content_answer: string,
    email_for_answer: string
) {
    return new Promise(async (res, rej) => {
        try {
            const registerTemplateString = fs.readFileSync(answerTicket, {encoding: 'utf-8'})
                .replaceAll('%%DOMAIN%%', DOMAIN)
                .replaceAll('%%TIME_OPEN%%', convertTimeToDate(time_open))
                .replaceAll('%%TITLE%%', title)
                .replaceAll('%%CONTENT_QUESTION%%', content_question)
                .replaceAll('%%CONTENT_ANSWER%%', content_answer);
            await mailjet
                .post('send')
                .request({
                    Messages: [
                        {
                            From: {
                                Email: SENDER_EMAIL,
                                Name: "COREbuild"
                            },
                            To: [
                                {
                                    Email: email_for_answer,
                                    Name: "COREbuild Customer"
                                }
                            ],
                            Subject: `Ticket at COREbuild on: ${title}.`,
                            TextPart: "Thank you for using the services of COREbuild.",
                            HTMLPart: registerTemplateString
                        }
                    ]
                });
            res(true);
        } catch (e) {
            logger.error(e.message, e);
            rej(new Error('Could not send out email to customer.'));
        }
    });
}
