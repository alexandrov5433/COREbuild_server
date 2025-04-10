function convertCentToWhole(cent) {
    let newCent = Number(cent);
    if (!newCent) {
        throw new Error(`The price of a product is not a number. Value recieved: "${cent}"`);
    }
    return newCent / 100;
}
function toCent(num) {
    num = num.toString();
    if (num.indexOf('.') == -1) {
        return Number(num + '00');
    }
    return Number(num.replace('.', ''));
}
export { convertCentToWhole, toCent };
//# sourceMappingURL=currency.js.map