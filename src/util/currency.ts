function convertCentToWhole(cent: number) {
    let newCent = Number(cent);
    if (!newCent) {
        throw new Error(`The price of a product is not a number. Value recieved: "${cent}"`);
    }
    return newCent / 100;
}

export {
    convertCentToWhole
};