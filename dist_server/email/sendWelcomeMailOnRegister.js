import mailjet from "../config/email.js";
import logger from "../config/winston.js";
import path from "node:path";
import fs from 'node:fs';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'corebuildshop@gmail.com';
const DOMAIN = process.env.DOMAIN;
const registerTemplate = path.resolve('./email_templates/register.html');
export default async function sendWelcomeMailOnRegister(customerFirstName, customerLastName, customerEmail) {
    return new Promise(async (res, rej) => {
        try {
            const registerTemplateString = fs.readFileSync(registerTemplate, { encoding: 'utf-8' })
                .replace('%%CUSTOMER%%', customerFirstName)
                .replaceAll('%%DOMAIN%%', DOMAIN);
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
                                Email: customerEmail,
                                Name: customerFirstName + ' ' + customerLastName
                            }
                        ],
                        Subject: "Welcome to COREbuild!",
                        TextPart: "Thank you for creating an account on our website - https://corebuild.xyz",
                        HTMLPart: registerTemplateString
                    }
                ]
            });
            res(true);
        }
        catch (e) {
            logger.error('Could not send out welcome email.');
            logger.error(e.message, e);
            res(false); // res, because it should not throw wenn usen in a try catch
        }
    });
}
//# sourceMappingURL=sendWelcomeMailOnRegister.js.map