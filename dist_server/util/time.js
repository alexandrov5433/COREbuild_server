function convertTimeToDate(time) {
    const formater = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return formater.format(new Date(Number(time)));
}
export { convertTimeToDate };
//# sourceMappingURL=time.js.map