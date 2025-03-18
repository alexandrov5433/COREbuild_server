import { Client, Environment, LogLevel, OrdersController, PaymentsController, } from '@paypal/paypal-server-sdk';
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, } = process.env;
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);
export { client, ordersController, paymentsController };
//# sourceMappingURL=paypal.js.map