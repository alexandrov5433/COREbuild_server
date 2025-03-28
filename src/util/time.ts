function convertTimeToDate(time: number) {
    const formater = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return formater.format(new Date(time));
}

export {
    convertTimeToDate
};