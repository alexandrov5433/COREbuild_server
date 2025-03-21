function reduceSpacesBetweenWordsToOne(sentance) {
    return sentance.trim().split(' ').filter(e => e != ' ' && e).join(' ');
}
export { reduceSpacesBetweenWordsToOne };
//# sourceMappingURL=string.js.map