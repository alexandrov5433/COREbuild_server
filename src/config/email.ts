import Mailjet from "node-mailjet";

const MJ_APIKEY_PUBLIC = process.env.MJ_APIKEY_PUBLIC;
const MJ_APIKEY_PRIVATE = process.env.MJ_APIKEY_PRIVATE;

const mailjet = Mailjet.Client.apiConnect(
    MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE,
    {
        config: {
            version: 'v3.1'
        }
    }
)

export default mailjet;