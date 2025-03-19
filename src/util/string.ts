
function reduceSpacesBetweenWordsToOne(sentance: string) {
    return sentance.trim().split(' ').filter(e => e != ' ' && e).join(' ');
}

export {
    reduceSpacesBetweenWordsToOne
};