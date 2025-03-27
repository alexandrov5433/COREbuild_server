import mailjet from "../config/email.js";
import logger from "../config/winston.js";
import path from "node:path";
import fs from 'node:fs';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'corebuildshop@gmail.com';
const DOMAIN = process.env.DOMAIN;
const registerTemplate = path.resolve('./email_templates/register.html');
export async function sendMailOnRegister(customerName) {
    return new Promise(async (res, rej) => {
        try {
            const registerTemplateString = fs.readFileSync(registerTemplate, { encoding: 'utf-8' })
                .replace('%%Customer%%', customerName)
                .replaceAll('%%DOMAIN%%', DOMAIN);
            const result = await mailjet
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
                                Email: "alexandrov5433@gmail.com",
                                Name: "COREbuild Shop"
                            }
                        ],
                        Subject: "This is a test Email for COREbuild.",
                        TextPart: "Thank you for using the services of COREbuild.",
                        HTMLPart: registerTemplateString
                    }
                ]
            });
            res(true);
        }
        catch (e) {
            logger.error(e.message, e);
        }
    });
}
//# sourceMappingURL=email.js.map